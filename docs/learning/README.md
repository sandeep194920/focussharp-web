# Learning Docs — Index

Notes written while building FocusSharp. Each doc explains the concepts behind what we built, at a level that assumes no prior knowledge of the topic.

---

## [01 — Supabase Auth & Backend](./01-supabase-auth.md)

**The big picture:** What Supabase is, how we set up the database, and how data syncs between the app and the cloud.

Key concepts inside:
- What Supabase is and why we chose it over Firebase
- The 4 tables we created (profiles, categories, sessions, waitlist) and why each is structured the way it is
- **Database indexes** — what they are, why they make queries fast, the key→rows mental model
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

## What's Coming Next

As we build more features, new docs will be added here:

| Topic | When |
|---|---|
| Stripe payments & webhooks | Phase 2 — before launch |
| Apple IAP & Google Play Billing | Native app phase |
| Vercel deployment & environment variables | Pre-launch |
| Email confirmation & SMTP (Resend) | Pre-launch |
