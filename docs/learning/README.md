# Learning Docs — Index

Notes written while building FocusSharp. Each doc explains the concepts behind what we built, at a level that assumes no prior knowledge of the topic.

---

## [01 — Supabase Auth & Backend](./01-supabase-auth.md)

**The big picture:** What Supabase is, how we set up the database, and how data syncs between the app and the cloud.

Key concepts inside:
- What Supabase is and why we chose it over Firebase
- The 4 tables we created (profiles, categories, sessions, waitlist) and why each is structured the way it is
- **Database indexes** — what they are, why they make queries fast, the key→rows mental model, how query time scales with and without an index, and how to measure it with `EXPLAIN ANALYZE`
- **Row Level Security (RLS)** — how Postgres enforces "users can only see their own data" at the database level
- **Primary keys and foreign keys** — what uniquely identifies a row, and how tables link to each other
- **`on delete cascade`** — what orphan rows are and how this prevents them
- **Triggers** — functions that run automatically when something happens in the database (we use one to auto-create a profile on signup)
- **Browser client vs server client** — why we need two different Supabase clients and what each one does
- **Middleware** — what runs on every request and why (token refresh)
- **JWT tokens** — what they are, access token vs refresh token, why they expire
- **Our sync strategy** — pull on login, push on mutation, why we didn't do real-time
- How to manually grant Pro access before Stripe is set up

---

## [02 — OAuth & Google Sign-In](./02-oauth-google.md)

**The big picture:** How "Continue with Google" works under the hood — the complete flow from button click to signed in.

Key concepts inside:
- What OAuth is (the hotel key card analogy — you never give your password to FocusSharp)
- The three parties in every OAuth flow: user, your app, and the authorization server (Google)
- **Redirect URI** — what it is, why Google requires you to pre-register it, and the attack it prevents
- The complete step-by-step flow: button click → Google → Supabase → your app → signed in
- **PKCE** (pronounced "pixie") — the lock-and-key trick that makes OAuth safe for browser apps without a secret
- **The `state` parameter** — what CSRF is and how a random string prevents it
- **Why two callbacks** — why the redirect goes to Supabase first, then your app (and why the Client Secret never touches your browser)
- **JWT deep dive** — what the three parts are, why anyone can read it but nobody can fake it
- Common interview questions on OAuth with answers

---

## [03 — Identity Linking & Social Auth Flow](./03-identity-linking.md)

**The big picture:** What happens when a user has two sign-in methods for the same email, and the complete technical flow of cookies and redirects.

Key concepts inside:
- The three outcomes when the same email signs up two ways (separate accounts / block / silent merge) and what popular apps do
- **User vs identity** — the difference between an account and a way of proving you own it (passport vs driver's licence analogy)
- Why Supabase keeps them separate by default — and the real security reason behind it
- **`linkIdentity`** — what it does differently from `signInWithOAuth`, and when to call which
- What **manual linking** is and why it's off by default
- A reusable decision tree for handling social auth in any future app
- **The complete redirect & cookie flow** — all 8 steps from button click to avatar appearing, with a full diagram
- **Why cookies and not localStorage** — comparison table, httpOnly security, why the server needs them
- What happens silently when the access token expires (and what happens when the refresh token expires too)

---

## [04 — Stripe Payments](./04-stripe-payments.md)

**The big picture:** How Stripe is integrated for Pro subscriptions — checkout, webhooks, and the billing portal.

Key concepts inside:
- How Stripe Checkout works (hosted page vs embedded)
- Webhooks — what they are and why Stripe uses them to tell your server what happened
- Stripe's event model: `checkout.session.completed`, `customer.subscription.deleted`, etc.
- How `is_pro` gets flipped in the database after a successful payment
- The billing portal — letting users manage or cancel their subscription without you building a UI
- Why you verify webhook signatures (and what happens if you don't)

---

## [05 — Supabase Migrations & CLI](./05-supabase-migrations-cli.md)

**The big picture:** How to manage database schema changes cleanly using the Supabase CLI — so every change is tracked in git and reproducible on any environment.

Key concepts inside:
- **Why two separate Supabase projects** — dev vs prod, what each is for, why you never share them
- **The `supabase/migrations/` folder** — how migration files are structured (timestamp + name + SQL)
- One-time CLI setup per machine (`supabase login`, `supabase init`)
- **Setting up a new Supabase project** step by step — from dashboard to env vars to auth redirect URLs
- **`supabase link` and `supabase db push`** — how to point the CLI at a project and run migrations
- **The dev → prod deployment flow** — the exact order to push migrations vs deploy code
- **Creating new migrations** — `supabase migration new`, what to write in the file, when to push
- **CLI vs Supabase SQL Editor** — schema changes go in migration files, data changes go in the SQL Editor, and what never to do (Table Editor)
- Starting fresh on a new machine in 2 commands

---

## [06 — Database Triggers](./06-database-triggers.md)

**The big picture:** What triggers are, how the auto-create-profile trigger works line by line, and the exact sequence of events when a user signs up.

Key concepts inside:
- What a trigger is — the motion sensor analogy (runs automatically, no app code calls it)
- The two parts of every trigger: the **function** (what to do) and the **trigger** (when to do it)
- Every line of `handle_new_user()` explained — `new`, `raw_user_meta_data`, `coalesce`, `security definer`
- Every line of `on_auth_user_created` explained — `after insert`, `for each row`
- **The exact step-by-step sequence** when a user signs up — from button click through database inserts to redirect to `/app`
- Why a trigger is safer than doing this in app code — atomicity, no network gap, no half-created accounts
- How to verify the trigger is working in the SQL Editor
- When you'd add more triggers in the future (examples for FocusSharp)

---

## [Analytics — PostHog & Sentry](./analytics-posthog-sentry.md)

**The big picture:** How product analytics and error tracking are wired up in FocusSharp.

Key concepts inside:
- PostHog for user behaviour tracking and session replay
- Sentry for runtime error tracking in production
- How to track custom events (`track()` helper)

---

## [SEO Explained](./seo-explained.md)

**The big picture:** How FocusSharp is optimised for search engines.

Key concepts inside:
- Next.js Metadata API for titles, descriptions, Open Graph tags
- JSON-LD structured data (SoftwareApplication schema)
- Sitemap and robots.txt auto-generation
- Target keywords and how they're used

---

## [Web Audio API & Sounds](./web-audio-api-sounds.md)

**The big picture:** How browser-native sound effects work without any audio files.

Key concepts inside:
- Web Audio API — generating tones programmatically
- Why we avoided audio files (no network request, no permissions)
- How the sound toggle works

---

## [Stripe Payments — Plain English](./stripe-payments-explained.md)

**The big picture:** How Stripe processes payments, fees, refunds, and payouts — written from real experience.

Key concepts inside:
- The exact flow of a single payment (charge → fee → balance → payout)
- Stripe's fee structure (2.9% + $0.30, currency conversion)
- Test mode vs live mode — test card numbers
- **Refunds** — why you lose the fee even when refunding, how negative balance works
- Subscriptions vs one-time payments
- Webhooks — how payment events unlock Pro access in the app
- Stripe balance vs bank account — the 2-day payout delay

---

## [07 — Mobile LCP Performance](./07-mobile-performance-lcp.md)

**The big picture:** How a 6-second mobile LCP was diagnosed and fixed by splitting a client component into a static shell and a lazy-loaded interactive version.

Key concepts inside:
- What LCP is and why 2.5s is the threshold
- Why `"use client"` components block the LCP
- Static shell + `next/dynamic` lazy load pattern
- PostHog deferred with `requestIdleCallback`

---

## [08 — Auth Token Refresh & Silent API Failures](./08-auth-token-refresh.md)

**The big picture:** How a Supabase auth token expiry caused silent session data loss — and the right way to handle auth state in any Supabase app.

Key concepts inside:
- **Access token vs refresh token** — what each one is, how long they last, the wristband analogy
- **Why the store and the token can go out of sync** — set once on load, never updated
- **`onAuthStateChange`** — the listener that keeps store and auth state aligned, every event it fires for
- **Silent `.catch(() => {})`** — why swallowing errors on writes causes invisible data loss
- Rules to follow in every future Supabase app
- How to test token expiry during development (set JWT to 60 seconds)

---

## [Engineering Challenges](./engineering-challenges.md)

**The big picture:** Real technical problems encountered while building FocusSharp — written for interview preparation.

Challenges documented:
- **localStorage + Supabase sync conflict** — how default categories caused ghost data on every login, the three solutions considered, and why the final architectural decision (guests are stateless) was the right one
- **Flash of Unstyled Content (FOUC) in dark mode** — why React hydration is too late for theme init and how a blocking inline script fixes it
- **Timer accuracy with setInterval** — why tick-counting drifts and how wall-clock diffing solves it
- **Silent session data loss (auth token expiry)** — how an expired Supabase token + silent error swallowing caused invisible data loss, and how `onAuthStateChange` fixes it

---

## [Tech Stack Used](./tech-stack-used.md)

**The big picture:** Every technology used to build FocusSharp — a checklist reference for interviews.

Covers:
- Frontend (Next.js, TypeScript, Tailwind, Zustand, Framer Motion, Recharts)
- Backend (Supabase, Next.js API Routes, Vercel)
- Payments (Stripe, webhooks, customer portal)
- Email (Resend — transactional emails for Pro upgrades, refunds, waitlist signups)
- Analytics (PostHog, Sentry, Vercel Analytics)
- Key architecture decisions
- Free tier limits for every service

---

## What's Coming Next

| Topic | When |
|---|---|
| Apple IAP & Google Play Billing | Native app phase |
| CloudKit sync | Native app phase |
