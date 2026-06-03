# Identity Linking — Same Email, Multiple Sign-in Methods

## The Problem

Imagine a user signs up to FocusSharp with their email and password on day 1. Three weeks later they come back and click "Continue with Google" because it's faster. Their Google account has the same email address.

What should happen?

This is one of the most common UX problems in auth systems. There are three possible outcomes:

| Outcome | What happens | User experience |
|---|---|---|
| **Separate accounts** | Two accounts created, each with their own data | Confusing — "where are my sessions?" |
| **Block with message** | "An account with this email already exists, please sign in with email/password" | Annoying — user has to remember which method they used |
| **Silent merge** | Both methods linked to one account, all data in one place | Seamless — works like the user expected |

Most good apps (Notion, Linear, Vercel, GitHub) do the **silent merge**. That's what we implemented.

---

## What is an Identity?

In Supabase (and most auth systems), a **user** and an **identity** are different things:

- A **user** is the account — one row in `auth.users`, one UUID, one set of data
- An **identity** is a way of proving you are that user — email/password is one identity, Google is another

One user can have multiple identities. Think of it like a person who has both a passport and a driver's licence — two different documents, but they both prove you're the same person.

```
User: sandeepamaranath@gmail.com (one account, one UUID)
  ├── Identity 1: email + password
  └── Identity 2: Google OAuth
```

When both identities are linked, signing in with either method lands you in the same account with all your data.

---

## Why Supabase Keeps Them Separate by Default

Supabase's default is: **same email ≠ same person**.

This sounds counterintuitive but there's a real security reason. Consider this scenario:

1. You sign up to FocusSharp with your email and password
2. Someone else creates a Google account using your email (maybe accidentally, maybe maliciously)
3. They click "Continue with Google" on FocusSharp

If Supabase auto-merged accounts by email, that person would now have access to your account. That's a serious security hole.

So Supabase's safe default is: treat them as separate accounts until the *current logged-in user* explicitly links an identity. This way, only you — while signed in — can link Google to your account.

---

## The Two Flows We Handle

### Flow 1: Brand new user clicks Google
User has no account yet. They click "Continue with Google".

```
handleGoogle() is called
→ check: is there an active session? NO
→ call signInWithOAuth({ provider: 'google' })
→ browser goes to Google login
→ comes back, new account created
→ signed in
```

### Flow 2: Existing email/password user clicks Google
User already has an account and is signed in with email/password. They open the modal and click Google to link it.

```
handleGoogle() is called
→ check: is there an active session? YES
→ call linkIdentity({ provider: 'google' })
→ browser goes to Google login
→ comes back, Google identity added to existing account
→ both methods now work for the same account
```

### What about: new user signs up with email, then later (not signed in) clicks Google?

This is the tricky case. They're not signed in, so we call `signInWithOAuth`. If their Google email matches their existing email/password account:
- Without manual linking enabled: Supabase creates a second account
- With manual linking enabled: Supabase still creates a second account — but now you can merge them from settings later

The cleanest solution for this case is to **detect the duplicate** and prompt the user to sign in with their password first, then link Google from there. We haven't built the full settings page yet, but the foundation is in place.

---

## What is `linkIdentity`?

```ts
await supabase.auth.linkIdentity({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/app` },
});
```

This call:
1. Redirects the user to Google (same as `signInWithOAuth`)
2. After Google confirms their identity, instead of creating a new user — it adds a new identity record to the *existing* user
3. From now on, both email/password AND Google sign-in resolve to the same user UUID

The key difference from `signInWithOAuth`: Supabase knows there's an active session, so instead of "create or find user", it does "add identity to current user".

---

## What is "Manual Linking" and Why is It Off by Default?

Manual linking is the Supabase setting that allows `linkIdentity` to work at all. It's off by default because it changes the trust model:

**Without manual linking:** Each identity is completely independent. Email/password and Google can never be connected.

**With manual linking:** A logged-in user can add more sign-in methods to their account.

The reason it's opt-in: Supabase wants you to consciously decide that you trust this flow. If your app has strict security requirements (banking, healthcare), you might want to explicitly verify each new identity before linking. For most consumer apps like FocusSharp, it's safe and the right choice to enable.

---

## How Other Popular Apps Handle This

| App | Approach |
|---|---|
| **Notion** | Auto-merges by email. Sign in with Google, it finds your existing account. |
| **Linear** | Same — merges automatically |
| **GitHub** | Blocks with a message: "An account with this email already exists. Sign in and add this provider from settings." |
| **Slack** | Auto-merges per workspace |
| **Apple Sign In** | More complex — Apple can hide your email, so merging is harder |

The trend is toward auto-merge for consumer apps. Blocking and asking users to remember which method they used leads to support tickets and frustrated users.

---

## The Pattern to Use in Future Apps

Here's the reusable decision tree for any app you build:

```
User clicks a social login button (Google, GitHub, Apple, etc.)
│
├── Is there an active session?
│   ├── YES → linkIdentity() — add this provider to their existing account
│   └── NO  → signInWithOAuth() — new login or new account
│
└── After OAuth returns, does the email already exist on a different provider?
    ├── YES + manual linking on → Supabase handles the merge automatically
    └── YES + manual linking off → Two separate accounts exist
                                   → Prompt user to sign in with original method first
                                   → Then link from account settings
```

---

## What We Built in Code

In `components/ui/AuthModal.tsx`:

```ts
const handleGoogle = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // User is already signed in — link Google to their existing account
    await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/app` },
    });
  } else {
    // No active session — normal sign in / sign up via Google
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/app` },
    });
  }
};
```

`getSession()` reads the current session from the cookie. If it returns a session object, the user is logged in. If it returns null, they're not.

The redirect URL is the same in both cases — our `/api/auth/callback` route handles the session cookie either way.

---

## The Full Redirect & Cookie Flow — Step by Step

This is the complete journey from "user clicks Continue with Google" to "user is signed in and the app knows who they are." Every step explained.

---

### Step 1 — User clicks the button

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `https://focussharp.app/api/auth/callback?next=/app` },
});
```

This doesn't contact Google yet. It just builds a URL and tells the browser to go there. The browser **leaves your app entirely** — the React app unmounts, all state is gone. This is important to understand: after this line, your JavaScript is no longer running.

The URL it navigates to looks like:
```
https://accounts.google.com/o/oauth2/auth
  ?client_id=YOUR_GOOGLE_CLIENT_ID
  &redirect_uri=https://abcdef.supabase.co/auth/v1/callback
  &response_type=code
  &scope=openid email profile
  &state=RANDOM_STRING
  &code_challenge=PKCE_CHALLENGE
  &code_challenge_method=S256
```

---

### Step 2 — Google's login page

The user sees Google's own login page. Your app has no involvement here — you're not even running. Google handles everything: showing the form, verifying the password, showing the consent screen ("FocusSharp wants to access your Google account").

If the user clicks **Allow**, Google prepares a one-time authorization code.

If the user clicks **Deny** or closes the tab, the flow stops here. Nothing happens in your app.

---

### Step 3 — Google redirects to Supabase

Google sends the user's browser to:
```
https://abcdef.supabase.co/auth/v1/callback
  ?code=ONE_TIME_CODE
  &state=SAME_RANDOM_STRING_FROM_STEP_1
```

This is **Supabase's server**, not your app. Your code is still not running.

Supabase does three things here:
1. Verifies the `state` matches what it sent in Step 1 (CSRF protection — see the OAuth doc)
2. Makes a server-to-server call to Google: "exchange this `code` for the user's info"
3. Google responds with the user's email, name, avatar, and tokens

Supabase then:
- Creates a new user in `auth.users` if this email/Google combo hasn't been seen before
- Or finds the existing user if they've signed in with Google before
- Creates a Supabase **session** (an access token + a refresh token)
- Stores the session temporarily (server-side, very briefly)
- Generates a short-lived **session exchange code** (different from the Google code)

---

### Step 4 — Supabase redirects to your app

Supabase sends the browser to:
```
https://focussharp.app/api/auth/callback
  ?code=SUPABASE_SESSION_CODE
  &next=/app
```

Your Next.js app is now involved again. This hits `app/api/auth/callback/route.ts`:

```ts
export async function GET(request: NextRequest) {
  const code = searchParams.get("code");  // the Supabase session code
  const next = searchParams.get("next") ?? "/app";

  const supabase = await getSupabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);
  // ↑ This exchanges the code for the actual session tokens
  // and writes them as cookies into the HTTP response

  return NextResponse.redirect(`${origin}${next}`);
  // ↑ Redirects to /app
}
```

`exchangeCodeForSession` does two things:
1. Calls Supabase to swap the exchange code for the real access token + refresh token
2. Writes those tokens as **cookies** into the browser

---

### Step 5 — What are these cookies?

After `exchangeCodeForSession`, the browser now has two cookies set by Supabase:

**`sb-access-token`** (or similar name)
- Contains the JWT — the user's proof of identity
- Expires in 1 hour
- Readable by your server (but httpOnly so JavaScript can't read it directly)

**`sb-refresh-token`** (or similar name)
- A long-lived secret for silently getting a new access token
- Expires in weeks/months
- httpOnly (JavaScript absolutely cannot read this one)

These cookies are automatically sent with every request the browser makes to your app from this point on. You don't have to do anything — that's how cookies work. The browser attaches them to every request automatically.

---

### Step 6 — Redirect to /app, middleware runs

The callback route redirects to `/app`. As the browser navigates there, it hits `middleware.ts` first:

```ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      // ↑ reads the sb-access-token and sb-refresh-token cookies
      setAll(cookiesToSet) { /* writes updated cookies to response */ }
    }
  });

  await supabase.auth.getUser();
  // ↑ reads the access token cookie, verifies the JWT
  // if the access token is expired, uses the refresh token to get a new one
  // writes the new access token cookie into the response

  return supabaseResponse;
}
```

The middleware runs on **every single request** — page loads, API calls, everything. Its job is just to keep the session fresh. The user never sees this.

---

### Step 7 — The page loads, React mounts

`/app` renders. `app/app/layout.tsx` mounts and runs this `useEffect`:

```ts
useEffect(() => {
  const supabase = getSupabaseBrowserClient();
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.full_name,
        avatarUrl: session.user.user_metadata?.avatar_url,
      });
      syncOnLogin(); // fetch categories + sessions from Supabase
    }
  });
}, []);
```

`getSession()` reads the access token cookie and decodes the JWT — no network request needed, just reading the cookie. This is how the React app finds out who the user is after a full page reload.

The Zustand store's `user` field is set. The `UserMenu` component re-renders and shows the avatar instead of "Sign in".

---

### Step 8 — Subsequent API calls

From now on, every time the app calls `/api/categories`, `/api/sessions`, etc., the browser automatically sends the cookies. The API route does:

```ts
const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
// ↑ reads the access token cookie from the request
// verifies the JWT signature
// returns the user — no database lookup needed
```

The server knows who the user is from the cookie alone. The database is only queried for the actual data (categories, sessions), not to verify identity.

---

### The Complete Flow as a Diagram

```
Browser                  Your App              Supabase             Google
   |                        |                     |                    |
   |-- clicks Google -----→ |                     |                    |
   |                        |                     |                    |
   |←-- redirect to Google login ----------------→|                    |
   |                                              |                    |
   |------------------------------------------------- Google login --→ |
   |                                                                    |
   |←---------------- redirect to supabase.co/auth/v1/callback ------→ |
   |                        |                     |                    |
   |                        |              exchanges code with Google  |
   |                        |              creates session             |
   |                        |                     |                    |
   |←-- redirect to /api/auth/callback?code=xxx -→|                    |
   |                        |                     |                    |
   |-- GET /api/auth/callback ----------------→   |                    |
   |                        |-- exchangeCodeForSession(code) --------→ |
   |                        |←-- access token + refresh token -------- |
   |←-- set cookies + redirect to /app ---------- |                    |
   |                        |                     |                    |
   |-- GET /app ----------→ middleware            |                    |
   |                        |-- getUser() (verify JWT from cookie)     |
   |                        |-- refresh if expired                     |
   |←-- page HTML ----------|                     |                    |
   |                        |                     |                    |
   |   React mounts         |                     |                    |
   |   useEffect runs       |                     |                    |
   |   getSession() reads cookie                  |                    |
   |   setUser() + syncOnLogin()                  |                    |
   |   avatar appears in header                   |                    |
```

---

### Why Cookies and Not localStorage?

You might wonder: why store the tokens in cookies instead of localStorage like we do for categories and sessions?

| | Cookies | localStorage |
|---|---|---|
| **Sent automatically** | Yes — browser attaches to every request | No — you have to manually add to each fetch call |
| **Accessible by server** | Yes — API routes can read them | No — server never sees localStorage |
| **httpOnly option** | Yes — JavaScript can't read it (safer) | No — any JavaScript on the page can read it |
| **XSS risk** | Low (for httpOnly cookies) | High — malicious scripts can steal tokens |
| **CSRF risk** | Needs protection (we use `state` param) | No CSRF risk |
| **Works across tabs** | Yes | Yes |
| **Works after page reload** | Yes | Yes |

Auth tokens go in cookies because:
1. The server needs to read them (API routes, middleware)
2. httpOnly cookies can't be stolen by XSS attacks
3. The browser sends them automatically — you never forget to include them

App data (categories, sessions) goes in localStorage because:
1. The server doesn't need it — it has its own database
2. It's larger data that doesn't need to be sent on every request
3. It needs to work offline

---

### What Happens When the Access Token Expires?

1. User has been on the app for over an hour
2. They navigate to `/app/stats`
3. Middleware runs, calls `getUser()`, detects the access token is expired
4. Middleware uses the refresh token cookie to silently call Supabase: "give me a new access token"
5. Supabase responds with a new access token
6. Middleware writes the new access token cookie into the response
7. The page loads normally — user sees nothing

If the refresh token is also expired (user hasn't used the app in weeks/months):
1. Middleware can't get a new access token
2. `getSession()` in the layout returns null
3. `user` in the store stays null
4. The header shows "Sign in" — user needs to sign in again

This is the expected behaviour. Long-lived refresh tokens mean users stay signed in for weeks without being interrupted.

---

## Edge Case: Signed Up With Google First, Then Tries Email/Password Signup

**Scenario:** User creates an account by clicking "Continue with Google". Later they come back and try to sign up again using the same email with a password.

**What Supabase does:** Blocks the signup and returns `"User already registered"`.

This is correct — the account already exists. But showing that raw error is confusing. The user doesn't know they already have an account via Google.

**What we do instead:** Detect that specific error message and show something helpful:

```
"An account with this email already exists. Try signing in instead."
[Go to sign in →]
```

Clicking the link switches the modal to sign-in mode, where they can use "Continue with Google" to get back in.

```ts
if (error.message.toLowerCase().includes("already registered")) {
  setError("An account with this email already exists. Try signing in instead.");
  return; // don't throw — we're handling it gracefully
}
```

**The pattern for any app:** Whenever auth returns an error, ask yourself — does the raw error message make sense to a non-technical user? If not, catch it and rewrite it. Common ones to handle:

| Raw Supabase error | User-friendly version |
|---|---|
| `"User already registered"` | "An account with this email already exists. Try signing in instead." |
| `"Invalid login credentials"` | "Incorrect email or password." |
| `"Email not confirmed"` | "Please confirm your email before signing in." |
| `"Password should be at least 6 characters"` | "Password must be at least 6 characters." |

Never show raw backend error messages to users — they contain implementation details and are often scary or confusing.

---

## What to Add Later (Account Settings Page)

Right now we handle the "signed in → link Google" case. What we haven't built yet:

- A settings page showing which identities are linked
- An "Add Google sign-in" button there
- An "Unlink Google" option (in case they want to remove it)
- Detecting the "same email, different provider, not signed in" case and showing a helpful message instead of creating a duplicate account

These are standard features of any mature auth system. For now the foundation is solid — one account, multiple identities, data always in the right place.
