# Supabase Auth & Backend — What We Built and Why

## What is Supabase?

Supabase is a hosted backend platform built on top of PostgreSQL. Think of it as renting a fully set-up kitchen instead of building one yourself — the kitchen (database, auth, APIs) is already there, you just cook in it.

It gives you:
- A real Postgres database (not a proprietary format — more on Postgres below)
- Authentication (email/password, OAuth, OTP)
- Auto-generated REST APIs so your app can talk to the database
- Storage (for files/images)
- Edge Functions (serverless — small bits of code that run on Supabase's servers)

### What is PostgreSQL?

PostgreSQL (or "Postgres") is a database — a place to store data in organized tables, like a very powerful spreadsheet. Unlike a spreadsheet, it can handle millions of rows, enforce rules, and let multiple apps read/write at the same time without corrupting data.

A database has **tables** (like sheets in a spreadsheet), **rows** (one record per row), and **columns** (the fields in each record).

### Why Supabase over Firebase?

Firebase (Google's equivalent) stores data as JSON documents — like a big nested JavaScript object. Supabase uses a real SQL database, which means:
- Data has clear relationships (sessions *belong to* users, categories *belong to* users)
- You can query across tables ("give me all sessions where the category is Deep Work")
- Much easier to reason about when data gets complex

---

## The Database Schema We Created

A "schema" just means the structure of your database — what tables exist, what columns each has, what types of data each column holds.

We created 4 tables:

### `profiles`
Stores one row per user. Created automatically when a new user signs up (via a database trigger — explained below).

```
id           — the user's unique ID (a UUID — a long random string like "a1b2-c3d4-...")
email        — their email address, copied from auth at signup
display_name — their name (from Google, or email as fallback)
avatar_url   — profile picture URL (from Google, or null for email signups)
is_pro       — true or false. false by default. We flip this to true for paid users.
```

**Why a separate `profiles` table?**
Supabase manages its own internal `auth.users` table for authentication. You can't add columns to it or query it from your app code — it's locked. So the standard pattern is: create your own `public.profiles` table that you fully control, and copy the info you need into it when a user signs up.

### `categories` and `sessions`
These mirror the data structures already in `lib/store.ts` — the same categories and sessions the app uses in localStorage, just now also stored in the cloud.

The column names use `snake_case` (e.g. `cat_id`, `duration_mins`) because that's the Postgres convention. Our TypeScript code uses `camelCase` (e.g. `catId`, `durationMins`). The API routes in `app/api/` translate between the two when reading/writing.

One important detail: `created_at` in `categories` is stored as a `bigint` (a big integer — the raw JavaScript `Date.now()` number like `1748612345678`), not a formatted timestamp. This is intentional — we generate category IDs client-side using `cat-${Date.now()}`, so we store the exact same number we generated, not a reformatted version.

### `waitlist`
Simple table for the email capture form on the landing page. No login required to insert a row — anyone can join the waitlist.

---

## What is a Database Index?

Imagine your `sessions` table has 10,000 rows. When the app asks "give me all sessions for user ABC", the database has two choices:

**Without an index:** Read every single row — all 10,000 — and check each one: "is this row's `user_id` equal to ABC?" Like finding a name in a phonebook by reading every single entry from page 1.

**With an index:** Jump straight to the matching rows. Like using the alphabetical index in the phonebook — you flip to "A", find "ABC" immediately, done.

An index is a separate hidden data structure the database keeps updated automatically. You can think of it as a key→value map:

```
user_id "ABC" → [row 3, row 47, row 291]
user_id "XYZ" → [row 12, row 88]
```

So when you query for user ABC's sessions, it looks up "ABC" in the map and goes directly to those 3 rows instead of checking all 10,000.

```sql
create index categories_user_id_idx on public.categories(user_id);
```

This line says: "on the `categories` table, build and maintain an index on the `user_id` column, and call it `categories_user_id_idx`." The name is just a label — it doesn't affect how it works.

### Why does it matter here?

Every single query our app makes is filtered by `user_id` (because of RLS — explained next). Without the index, every page load would scan the entire table. With the index, it's a direct lookup no matter how many total users or rows exist.

### The tradeoff

Indexes make reads faster but writes very slightly slower (when you insert a new row, the index needs to be updated too). For our app — many reads, few writes — it's always worth it.

We created three indexes:
- `categories_user_id_idx` — fast lookup of a user's categories
- `sessions_user_id_idx` — fast lookup of a user's sessions
- `sessions_completed_at_idx` — fast sorting of sessions by date (for the stats bar chart)

---

## Row Level Security (RLS)

RLS is Postgres's built-in system for controlling which rows a user can see or change. When RLS is enabled on a table, the database automatically filters every query — you literally cannot accidentally return another user's data.

Think of it like this: normally a database is like a filing cabinet with no locks — anyone with a key to the room can read any file. RLS adds a lock on each individual file drawer, and each user only has the key to their own drawer.

```sql
alter table public.sessions enable row level security;
```

This turns RLS on for the `sessions` table. Now by default, nobody can read or write any rows — you have to explicitly grant access with policies.

```sql
create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);
```

This policy says: "when someone does a SELECT (read) on sessions, only show them rows where `user_id` matches their own ID."

`auth.uid()` is a special Supabase function that reads the currently logged-in user's ID from the JWT token attached to the request. Every time a query runs, Supabase checks this automatically.

### What is a JWT token?

JWT stands for JSON Web Token. It's a small piece of encrypted text that proves who you are, like a signed ticket. When you sign in, Supabase gives you a JWT. Every API request your app makes includes this JWT in the request headers. The server (and the database) reads it to know which user is making the request — without having to look up the user in the database every time.

### Why RLS is safer than doing it in code

You might think: "I'll just add `WHERE user_id = currentUserId` to every query in my API code." That works, but:
- If you forget it even once, you have a security hole
- RLS enforces it at the database level — even if your API code has a bug, the DB won't return wrong rows
- It protects even against direct database access via the Supabase dashboard

### The publishable key is safe to ship publicly — because of RLS

The `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is in your client-side code and visible to anyone. That's fine. It only identifies your Supabase project (like a phone number). Without RLS, it could read any row. With RLS and policies in place, it can only access rows that belong to the authenticated user — enforced by the database itself.

---

## What is a Primary Key?

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ...
```

A **primary key** is a column (or set of columns) that uniquely identifies each row. No two rows can have the same primary key. It's like a social security number for your data — every row has one unique ID.

`uuid` is the data type — a Universally Unique Identifier, a random 128-bit string like `a3f8c2d1-4b5e-6f7a-8c9d-0e1f2a3b4c5d`. UUIDs are generated randomly so two different computers can generate IDs at the same time without collision, which is important in distributed systems.

### What is `references auth.users(id)`?

This is a **foreign key**. It says: "the `id` in `profiles` must match an existing `id` in `auth.users`." It's a link between two tables.

If you tried to insert a profile with an ID that doesn't exist in `auth.users`, Postgres would reject it. This keeps your data consistent — you can never have an orphaned profile that doesn't belong to a real user.

### What is `on delete cascade`?

It means: if the user is deleted from `auth.users`, automatically delete their `profiles` row too (and their categories and sessions). Without this, deleting a user would leave behind "orphan" rows with no owner.

---

## The Trigger: Auto-Creating Profiles

A **trigger** is a function that runs automatically when something happens in the database — like a doorbell that rings whenever a package arrives, without you having to check the door yourself.

When a new user signs up, Supabase inserts a row into `auth.users`. We want a corresponding row to appear in `public.profiles` automatically. We do this with:

```sql
-- Step 1: Define the function to run
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Step 2: Attach the function to fire when a new user is inserted
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Breaking this down line by line:

- `create or replace function` — define a reusable function (like a JavaScript function)
- `returns trigger` — this function is specifically designed to be used as a trigger
- `$$` — a delimiter that means "the function body starts/ends here" (like `{` and `}` in JS)
- `begin ... end` — marks the start and end of the function body
- `new` — a special variable inside triggers that refers to the row being inserted. `new.id` is the new user's ID, `new.email` is their email, etc.
- `raw_user_meta_data` — a JSON column Supabase populates from the OAuth provider. When someone signs in with Google, Google sends their name and avatar URL here.
- `->>'full_name'` — extracts the `full_name` field from the JSON. The `->>` operator gets it as plain text.
- `coalesce(a, b)` — returns `a` if it's not null, otherwise returns `b`. So if there's no `full_name` (email signup has no name), we fall back to using the email address as the display name.
- `security definer` — the function runs with the permissions of whoever created it (a superuser), not the user calling it. This is needed because when a new user signs up, their session doesn't exist yet, so they can't insert into `profiles` themselves.
- `language plpgsql` — the programming language used (PL/pgSQL is Postgres's built-in scripting language)
- `after insert on auth.users` — fire this trigger after a row is inserted into `auth.users`
- `for each row` — run the function once per inserted row (not once per query)

---

## Browser Client vs Server Client

We have two Supabase clients in the codebase.

### What is a "client"?

A client is just an object you create to talk to a service. Like calling `new XMLHttpRequest()` in JavaScript — you create the object, then use it to make requests. The Supabase client wraps all the API calls (sign in, fetch data, etc.) into convenient functions.

### Browser client (`lib/supabase.ts` → `getSupabaseBrowserClient`)

```ts
createBrowserClient(SUPABASE_URL, PUBLISHABLE_KEY)
```

- Runs in the user's browser (client-side)
- Created once and reused (a singleton — creating it multiple times would create multiple connections)
- Stores the auth session in the browser (cookies + localStorage)
- Used in `AuthModal.tsx` to sign in, sign up, and trigger Google OAuth

### Server client (`lib/supabase-server.ts` → `getSupabaseServerClient`)

```ts
createServerClient(SUPABASE_URL, PUBLISHABLE_KEY, { cookies: { getAll, setAll } })
```

- Runs on our Next.js server (inside API routes like `/api/categories`)
- Created fresh on every single request (not a singleton)
- Reads the auth session from the HTTP request's cookies to identify the user
- Used in all API routes to verify who is making the request before touching the database

**Why two?** On the server, there's no browser window, no `localStorage`, no persistent memory between requests. Every request comes in fresh. The only way to know who the user is, is to read the auth cookie they sent with their HTTP request. The `@supabase/ssr` library handles this by accepting `getAll`/`setAll` cookie functions so it can read and update cookies on the server.

---

## The Middleware

`middleware.ts` is a special Next.js file that runs on **every single request** before it reaches any page or API route. Think of it as a bouncer at a club door — every person passes through before entering.

Our middleware's only job is to **refresh the auth token**.

### What is a token and why does it expire?

When you sign in, Supabase gives you two things:
1. **Access token (JWT)** — proves who you are. Expires after 1 hour for security. If someone steals it, it's only useful for 1 hour.
2. **Refresh token** — a longer-lived secret used only to get a new access token. Stored in a cookie.

After 1 hour, the access token expires. If we do nothing, the next API call returns `401 Unauthorized` and the user looks logged out, even though their refresh token is still valid.

The middleware calls `supabase.auth.getUser()` on every request. If the access token is expired, this call automatically uses the refresh token to get a new one — silently, without the user noticing. It then updates the cookies in the response so the browser has the new token.

```ts
await supabase.auth.getUser(); // refreshes the session if needed, updates cookies
```

---

## The OAuth Flow (Google — not enabled yet, but planned)

OAuth is a standard way to let a third party (Google) tell your app "yes, this person is who they say they are" — without your app ever seeing their Google password.

When Google OAuth is enabled, the flow works like this:

1. User clicks "Continue with Google" in `AuthModal`
2. We call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/api/auth/callback' } })`
3. Browser redirects to Google's login page (leaving our app entirely)
4. User approves access → Google redirects to Supabase's own servers with a temporary code
5. Supabase exchanges that code with Google for the user's info, creates a session, then redirects to our `/api/auth/callback?code=xxx`
6. Our callback route calls `supabase.auth.exchangeCodeForSession(code)` — this sets the session cookie
7. User is redirected to `/app`, now signed in

The `code` in step 5-6 is a one-time token — it expires immediately after being exchanged. Even if someone intercepted it, it would be useless. This is the standard OAuth 2.0 PKCE (Proof Key for Code Exchange) flow — designed so the process is secure even over potentially insecure channels.

---

## Our Sync Strategy

We chose a "pull on login, push on mutation" approach — simple, offline-friendly, and fast.

### Pull on login (`syncOnLogin`)

When a user signs in, we:
1. Fetch all their categories and sessions from Supabase
2. Merge with what's already in localStorage — remote wins if the same ID exists in both
3. Any local-only records (created while offline or as a guest) are pushed up to Supabase

This means if you used the app on your phone as a guest, then signed in on your laptop, your phone's data merges into your account on the next login.

### Push on mutation (fire-and-forget)

When the user adds a category, updates it, deletes it, or completes a session:
1. We immediately update localStorage and re-render the UI (feels instant)
2. We fire a background fetch to the API to sync it to Supabase
3. If the fetch fails (no internet), the data is safe in localStorage and syncs on the next login

"Fire-and-forget" means we don't wait for the server to respond before updating the UI. We just send the request and move on — the user never sees a loading spinner for these small updates.

### Why not real-time sync?

Real-time sync (where your data updates instantly across all your devices simultaneously) uses WebSockets — a persistent connection between the browser and the server. It adds a lot of complexity and cost. For a single-user focus timer, you don't need your phone to update the second you add a category on your laptop. Syncing on login is enough. We can add real-time later if it becomes necessary.

---

## The Three User States

| State | `user` in store | `isPro` | Data lives in |
|---|---|---|---|
| Guest | null | false | localStorage only — lost if browser is cleared |
| Free account | set | false | localStorage + Supabase (synced on login) |
| Pro account | set | true | localStorage + Supabase (synced on login) |

Guest mode works exactly as it did before we added Supabase — no API calls are made, no account needed. This is important for the "no signup required" pitch on the landing page. We never broke existing behaviour.

---

## How to Manually Grant Pro Access (Until Stripe)

In Supabase SQL Editor:

```sql
UPDATE public.profiles
SET is_pro = true
WHERE email = 'your@email.com';
```

`UPDATE` modifies existing rows. `SET` specifies what to change. `WHERE` limits which rows to change — without a `WHERE` clause, every row in the table would be updated, which is almost never what you want.

Sign out and sign back in — `syncOnLogin` fetches the profile from the DB and calls `setIsPro(true)` in the Zustand store, which unlocks unlimited categories and full session history.
