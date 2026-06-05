# Database Triggers

## What is a trigger?

A trigger is a function that the database runs automatically when something happens — without your app code doing anything. You set it up once, and from that point on the database handles it on its own forever.

Think of it like a motion sensor light. You don't flip the switch — you just walk in the room and the light turns on by itself. The trigger is the sensor. The function it runs is the light turning on.

---

## The trigger we have: auto-create profile on signup

When a new user signs up, we need two things to happen:
1. Supabase creates a row in its internal `auth.users` table (Supabase does this automatically)
2. A matching row gets created in our `public.profiles` table (we need to do this)

We could do #2 in our app code — call an API route after sign-up that inserts the profile. But that's fragile. What if the network drops after sign-up? What if the user closes the tab? The profile never gets created and the account is broken.

A trigger solves this by moving #2 into the database itself. It's guaranteed to run — no network, no app code, no timing issues.

---

## The two parts

Every trigger has two parts: the **function** (what to do) and the **trigger** (when to do it).

### Part 1: The function

```sql
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
```

This is just a function definition — like writing a JavaScript function. On its own it does nothing. It's just sitting there waiting to be called.

Line by line:

- `create or replace function public.handle_new_user()` — define a function called `handle_new_user`. `create or replace` means "if it already exists, overwrite it" — safe to run multiple times.
- `returns trigger` — this function is specifically designed to be used as a trigger, not called directly
- `$$` ... `$$` — everything between these is the function body. Like `{` and `}` in JavaScript.
- `begin` ... `end` — marks the start and end of the actual logic
- `new` — a special variable that only exists inside triggers. It refers to the row that was just inserted. So `new.id` is the new user's ID, `new.email` is their email, etc.
- `new.raw_user_meta_data->>'full_name'` — `raw_user_meta_data` is a JSON column Supabase populates from the OAuth provider. When someone signs in with Google, Google sends their name here. `->>'full_name'` extracts that field as plain text.
- `coalesce(a, b)` — returns `a` if it's not null, otherwise returns `b`. If the user signed up with email (no Google name), `full_name` is null, so we fall back to using their email address as the display name.
- `security definer` — the function runs with the permissions of whoever created it (a superuser), not the permissions of the user triggering it. This is necessary because at the moment of sign-up, the user's session doesn't exist yet — they're not "logged in" — so they don't have permission to insert into `profiles` themselves. Running as superuser bypasses that.
- `language plpgsql` — the programming language used. PL/pgSQL is Postgres's built-in scripting language.

### Part 2: The trigger

```sql
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

This is the sensor. It watches the database and fires the function at the right moment.

Line by line:

- `create trigger on_auth_user_created` — give the trigger a name. Just a label.
- `after insert on auth.users` — fire this trigger *after* a new row is inserted into `auth.users`. The `after` means the insert already succeeded before our function runs — we're reacting to it, not intercepting it.
- `for each row` — run the function once per inserted row. (The alternative is `for each statement` which runs once per query regardless of how many rows were inserted — not what we want here.)
- `execute procedure public.handle_new_user()` — call the function we defined above.

---

## The exact sequence when a user signs up

Here is the precise order of events, step by step:

```
1. User fills in email + password and clicks "Create account"
   └── AuthModal.tsx calls supabase.auth.signUp({ email, password })

2. Supabase Auth receives the sign-up request
   └── Validates the email and password
   └── Inserts a new row into auth.users (Supabase's internal table)
         id:    "a1b2-c3d4-..."
         email: "user@example.com"
         raw_user_meta_data: {}   ← empty for email signup, has name/avatar for Google

3. The INSERT into auth.users completes ✓

4. The trigger fires automatically
   └── Postgres sees "a row was just inserted into auth.users"
   └── Looks up: "is there a trigger for this?" → yes: on_auth_user_created
   └── Calls handle_new_user() with new = the row that was just inserted

5. handle_new_user() runs
   └── Inserts a row into public.profiles:
         id:           "a1b2-c3d4-..."  (same as auth.users id)
         email:        "user@example.com"
         display_name: "user@example.com"  (no full_name for email signup, falls back to email)
         avatar_url:   null
         is_pro:       false  (default)

6. Both inserts are done. The whole thing is one atomic transaction —
   either both succeed or neither does.

7. Supabase returns the session to your app
   └── AuthModal.tsx receives data.user
   └── Calls setUser() and syncOnLogin()
   └── Redirects to /app
```

For Google OAuth the flow is the same from step 4 onward, except `raw_user_meta_data` has the user's real name and avatar URL from Google — so `display_name` gets set to their actual name instead of their email.

---

## Why not just do this in app code?

You could write an API route that creates the profile after sign-up:

```ts
// after supabase.auth.signUp succeeds...
await fetch('/api/create-profile', { method: 'POST', body: ... })
```

The problem is this is two separate operations with a gap between them. Things that can go wrong:
- Network drops between sign-up and the profile creation call
- User closes the tab immediately after clicking sign-up
- Your API route has a bug and throws an error
- Supabase times out on the second call

In any of these cases, the user exists in `auth.users` but has no profile — a broken half-created account. You'd need error handling, retries, and cleanup logic.

The trigger runs **inside the same database transaction** as the original insert. Either both the `auth.users` row and the `profiles` row get created, or neither does. There's no gap, no network call, no way for them to get out of sync.

---

## How to verify it's working

Sign up a test user, then run this in the Supabase SQL Editor:

```sql
SELECT * FROM public.profiles ORDER BY id;
```

The new user's profile row should be there — even though your app code never explicitly created it.

---

## When would you add more triggers?

Same pattern any time you need something to happen automatically when data changes:

| Event | Trigger idea |
|---|---|
| User deletes their account | Clean up any storage files they uploaded |
| Session is completed | Update an aggregated "total focus minutes" counter on the profile |
| User upgrades to Pro | Send a welcome email via an Edge Function |

Each one follows the same two-part pattern: write the function, attach the trigger.
