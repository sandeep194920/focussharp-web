# Supabase Migrations & CLI — Dev/Prod Setup

## The Big Picture

When you build with Supabase, your app has two separate concerns:

1. **Your code** — TypeScript, React, API routes. Lives in git. Easy to track changes.
2. **Your database schema** — tables, policies, indexes, triggers. Lives in Supabase. Easy to forget to track.

The Supabase CLI solves #2. It lets you write schema changes as **migration files** — plain SQL files that live in your git repo alongside your code. Every change to the database is a file with a timestamp, a name, and the exact SQL that was run. You always know what state the database is in, and you can recreate it from scratch on any project.

---

## Dev vs Prod: Two Separate Supabase Projects

You run two completely separate Supabase projects:

| | Dev | Prod |
|---|---|---|
| Purpose | Local development, testing, experiments | Real users, real data |
| Pointed to by | `.env.local` | Vercel environment variables |
| Safe to wipe? | Yes — do it freely | Never |
| Users | Just you (test accounts) | Real users |

Each project has its own database, its own auth users, its own API URL and keys. They share nothing. Pointing your app at one vs the other is just a matter of which env vars are loaded.

### Why not one project for both?

- You'd be running test code against real user data
- A bad migration run during development could corrupt prod data
- Auth redirect URLs would conflict (localhost vs your real domain)
- You can't safely experiment with schema changes

---

## The supabase/ Folder

When you run `supabase init` in your project, it creates:

```
supabase/
  config.toml          — project-level config (ignored for our purposes)
  migrations/
    20260604034032_initial_schema.sql
    20260610_add_notes_to_sessions.sql   ← future migrations look like this
```

The migrations folder is the important part. Each file is:
- **Timestamped** — the prefix `20260604034032` is the date+time it was created. This determines run order.
- **Named** — the suffix describes what the migration does (`initial_schema`, `add_notes_to_sessions`)
- **SQL** — plain SQL that transforms the database from the previous state to the next

These files are committed to git. They are the source of truth for your database schema.

---

## One-Time Setup (Per Machine)

### 1. Install the Supabase CLI

```bash
brew install supabase/tap/supabase
```

Verify:
```bash
supabase --version
```

### 2. Log in

```bash
supabase login
```

This opens a browser and saves your credentials locally. You only do this once per machine.

### 3. Init the project (already done for FocusSharp)

```bash
supabase init
```

This creates the `supabase/` folder. Already done — don't run again.

---

## Setting Up a New Supabase Project (Dev or Prod)

1. Go to [supabase.com](https://supabase.com) → New project
2. Give it a name (`focussharp-dev` or `focussharp-prod`)
3. Choose a region (Americas or closest to your users)
4. Enable automatic RLS — yes, always check this
5. Save the database password somewhere safe (you won't need it often but keep it)
6. After it provisions, go to **Connect → App Frameworks** (or **Settings → API**) and copy:
   - Project URL (`https://xxxx.supabase.co`)
   - Publishable key (shown as `anon` / `publishable` depending on UI version)
   - `service_role` secret key (keep this secret — never commit it)

### Point your app at it

**Dev** — paste into `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Prod** — paste into Vercel dashboard → Settings → Environment Variables (same keys, prod values).

### Configure Auth redirect URLs

In the Supabase project dashboard → **Authentication → URL Configuration**:

1. Set the **Site URL** (top field) to your app's base URL:
   - Dev: `http://localhost:3000`
   - Prod: `https://focussharp.app`

2. Scroll down to **Redirect URLs** and click **Add URL**. Add the callback path:
   - Dev: `http://localhost:3000/api/auth/callback`
   - Prod: `https://focussharp.app/api/auth/callback`

Do this separately in each project (dev project gets the localhost URL, prod project gets the focussharp.app URL).

If you skip this, Google OAuth will break — the redirect URL check only matters for OAuth providers, not email/password auth. That's why things may appear to work without it until you add Google Sign-In.

---

## Running Migrations

### Link the CLI to a project

Before you can push migrations, you tell the CLI which Supabase project to talk to:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

The project ref is the string in the Supabase dashboard URL:
`app.supabase.com/project/YOUR_PROJECT_REF`

**You link to one project at a time.** To switch between dev and prod, run `supabase link` again with the other ref. This just updates a local config file — it doesn't change anything in either database.

### Push migrations

```bash
supabase db push
```

This runs all migration files that haven't been applied to the linked project yet. It tracks which migrations have run using a hidden table in your database (`supabase_migrations.schema_migrations`). So running `db push` twice is safe — it won't run the same migration twice.

### The dev → prod deployment flow

```bash
# 1. Develop and test against dev
supabase link --project-ref YOUR_DEV_REF
supabase db push

# 2. When ready to deploy, switch to prod
supabase link --project-ref YOUR_PROD_REF
supabase db push

# 3. Deploy code to Vercel (git push / vercel deploy)
```

Always push the migration to prod *before* or *at the same time as* deploying the code that depends on it. Never deploy code that references a table or column that doesn't exist in prod yet.

---

## Creating a New Migration

Whenever you need to change the database — add a table, add a column, change a policy — you create a new migration file:

```bash
supabase migration new describe_what_youre_changing
```

Examples:
```bash
supabase migration new add_notes_to_sessions
supabase migration new add_timezone_to_profiles
supabase migration new create_tags_table
```

This creates a new empty `.sql` file in `supabase/migrations/` with the current timestamp as the prefix. Open it and write your SQL. Then push.

### Example: adding a column

```bash
supabase migration new add_timezone_to_profiles
```

Open the created file and write:
```sql
alter table public.profiles
  add column timezone text default 'UTC';
```

Then:
```bash
supabase db push   -- pushes to whichever project is currently linked
```

---

## Writing the SQL: CLI vs Supabase Dashboard

You have two ways to make database changes. Here's when to use each:

### Use CLI migrations (the right way for schema changes)

- Adding or modifying tables, columns, indexes
- Changing RLS policies
- Adding triggers or functions
- Anything that needs to be reproducible and tracked in git

This is the default. If it changes the structure of the database, it goes in a migration file.

### Use the Supabase SQL Editor (for one-off data operations)

- Manually granting Pro access to a user: `UPDATE profiles SET is_pro = true WHERE email = '...'`
- Inspecting data while debugging: `SELECT * FROM sessions WHERE user_id = '...'`
- Running a one-time data backfill
- Experimenting with a query before writing it in code

Data changes (rows) don't go in migration files. Structure changes (schema) do.

### Never do this

Don't use the Supabase Table Editor (the spreadsheet-like UI) to add columns or create tables — it bypasses your migration files and your git history won't reflect the change. The next time you `db push` to a fresh project, those changes will be missing.

---

## The Golden Rule

> **If it changes the database structure, it lives in a migration file.**
> If it changes data (rows), it stays in the SQL Editor or in your app code.

---

## Checking Migration Status

```bash
supabase migration list
```

Shows all migration files and whether they've been applied to the linked project. Useful for confirming what's been run on prod vs dev.

---

## Starting Fresh (New Dev Project)

If you ever need to spin up a brand new dev environment — new machine, new team member, or you just wiped your dev project:

1. Create a new Supabase project
2. Add the URL/keys to `.env.local`
3. Add `http://localhost:3000/api/auth/callback` to Auth redirect URLs
4. Run:
   ```bash
   supabase link --project-ref YOUR_NEW_DEV_REF
   supabase db push
   ```

That's it. All migrations run in order and your database is in the exact same state as everyone else's. This is why the CLI approach is worth the setup — a new environment takes 2 minutes instead of manually recreating tables from memory.

---

## FocusSharp-Specific Reference

| Project | Ref | Used for |
|---|---|---|
| focussharp-dev | `oxethxanhyhzlehonykv` | `.env.local` — local development |
| focussharp-prod | (your prod ref — set up when ready to launch) | Vercel env vars — real users |

Migration files live in: `supabase/migrations/`

Current migrations:
- `20260604034032_initial_schema.sql` — profiles, categories, sessions, waitlist, signup trigger
