# OAuth 2.0 & Google Sign-In — Complete Flow

## What is OAuth?

OAuth (Open Authorization) is a standard way to let a user sign into your app using their account on another service — without ever giving your app their password.

Imagine you want a friend to pick up a package from your apartment building. You don't give them your house key (your master password). Instead, the building manager (Google) gives your friend a special temporary key card that only works for your mailroom. Your friend gets the package, returns the key card, and they never had access to your whole apartment.

That's OAuth:
- Your **password** stays with Google. FocusSharp never sees it.
- Google gives FocusSharp a temporary **token** (key card) that just says "yes, this person is who they say they are"
- Google can cancel that token at any time without you changing your password

OAuth 2.0 is the current version, used by Google, GitHub, Apple, Twitter, and almost every major platform.

---

## The Three Parties in OAuth

Every OAuth flow involves exactly three parties:

| Party | In our case | Role |
|---|---|---|
| **Resource Owner** | The user | The person who owns the Google account |
| **Client** | FocusSharp | The app requesting access |
| **Authorization Server** | Google | The service that verifies identity and grants access |

There's also a fourth entity in our setup — **Supabase** — which acts as an intermediary between Google and FocusSharp to handle the complexity.

---

## What is a Redirect URI and Why Does Google Require It?

When a user finishes approving your app on Google's login page, Google needs to know **where to send them back**. That "send them back to" address is called the redirect URI.

It's like writing your return address on an envelope. Google will only deliver the package to addresses you registered in advance.

**Why is pre-registering important?**

Imagine Google didn't check the return address. A bad person could create a fake link:
```
https://accounts.google.com/login?app=focussharp&send_to=https://evil.com
```
They use FocusSharp's real name but tell Google to send the user to their evil website instead. The user logs in thinking it's FocusSharp, and the bad person steals their account.

Google prevents this by checking: "is the return address in this request exactly the same as what FocusSharp pre-registered with us?" If not, it refuses the whole login. So the attacker's fake link gets blocked immediately.

---

## The Full Google OAuth Flow in FocusSharp

Here's exactly what happens when a user clicks "Continue with Google":

```
User's Browser          FocusSharp App          Supabase              Google
      |                       |                     |                     |
      |--- clicks button ---→ |                     |                     |
      |                       |                     |                     |
      |                  calls signInWithOAuth()    |                     |
      |                       |--- redirects ------→|                     |
      |                       |                     |                     |
      |←-- redirect to Google login ---------------→|                     |
      |                                             |                     |
      |------------------------------------------------ goes to Google --→|
      |                                                                    |
      |                                          user sees consent screen |
      |                                          "FocusSharp wants to     |
      |                                           access your Google      |
      |                                           account"                |
      |                                                                    |
      |←----- user approves, Google redirects to Supabase callback ------→|
      |         (with a one-time `code` in the URL)                        |
      |                                             |                     |
      |                    Supabase receives code   |                     |
      |                    exchanges it with Google |--- POST /token ----→|
      |                                             |←-- user info + JWT -|
      |                                             |                     |
      |                    Supabase creates/updates user in auth.users     |
      |                    creates a session (access token + refresh token)|
      |                    redirects to /api/auth/callback?code=xxx        |
      |                                             |                     |
      |←-- arrives at FocusSharp /api/auth/callback|                     |
      |                                             |                     |
      |         our route calls exchangeCodeForSession(code)              |
      |         Supabase sets session cookies                             |
      |                                             |                     |
      |←-- redirected to /app, now signed in ------→|                     |
```

### Step-by-step in plain English:

**Step 1 — User clicks the button**
```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/app` }
})
```
This call doesn't do any authentication itself — it just builds a Google OAuth URL and redirects the browser to it.

**Step 2 — Browser goes to Google**
The URL looks something like:
```
https://accounts.google.com/oauth/authorize
  ?client_id=YOUR_GOOGLE_CLIENT_ID
  &redirect_uri=https://abcdef.supabase.co/auth/v1/callback
  &response_type=code
  &scope=openid email profile
  &state=random_string_to_prevent_csrf
```
- `client_id` — identifies FocusSharp to Google
- `redirect_uri` — where to send the user after approval (must match your registered URI)
- `response_type=code` — we want an authorization code (not a token directly)
- `scope` — what we're asking permission for (just email and profile, not drive/gmail/etc.)
- `state` — a random string Supabase generates to prevent CSRF attacks (explained below)

**Step 3 — User sees the consent screen**
Google shows "FocusSharp wants to access your Google Account" with the specific permissions listed. The user clicks "Allow" or "Deny".

**Step 4 — Google redirects back to Supabase**
After approval, Google redirects to:
```
https://abcdef.supabase.co/auth/v1/callback?code=ONE_TIME_CODE&state=same_random_string
```
The `code` is a short-lived (usually 10 minutes) one-time authorization code. It's not the actual access token — it's a voucher that can be exchanged for one.

**Step 5 — Supabase exchanges the code**
Supabase's servers make a server-to-server POST request to Google:
```
POST https://oauth2.googleapis.com/token
  code=ONE_TIME_CODE
  client_id=YOUR_CLIENT_ID
  client_secret=YOUR_CLIENT_SECRET   ← never exposed to the browser
  grant_type=authorization_code
```
Google responds with:
- The user's profile (name, email, avatar)
- An access token (to call Google APIs on their behalf)
- A refresh token

Supabase uses this to create or update the user in `auth.users` and generates its own session (JWT + refresh token). The Google access token is not stored — we don't need to call Google APIs directly.

**Step 6 — Supabase redirects to your app**
Supabase redirects to:
```
https://focussharp.app/api/auth/callback?code=SUPABASE_CODE&next=/app
```
Note: this is a different code — it's a Supabase session code, not the Google one.

**Step 7 — Your callback route finalises the session**
```ts
// app/api/auth/callback/route.ts
const { error } = await supabase.auth.exchangeCodeForSession(code);
```
This call sets the session cookies (access token + refresh token) in the browser. From this point, every request the user makes includes these cookies, proving who they are.

**Step 8 — User lands on /app, signed in**
The redirect to `/app` happens. The middleware refreshes the token if needed. The app reads the session and the user is authenticated.

---

## What is PKCE?

PKCE stands for **Proof Key for Code Exchange** (pronounced "pixie"). It's an extra security layer on top of OAuth 2.0.

**The problem it solves:**

Your app has a Client Secret — like a password that proves to Google "I'm really FocusSharp, not someone pretending to be FocusSharp." On a server, you can hide this secret safely. But in a browser or phone app, anyone can open the developer tools and find it. So for browser/mobile apps, you can't safely use a Client Secret at all.

PKCE solves this with a lock-and-key trick:

1. Before going to Google, your app creates a random secret (the **code verifier**) and locks it in a box — the lock is a math function (SHA-256 hash) of the secret, called the **code challenge**
2. Your app sends the *lock* (code challenge) to Google but keeps the *key* (code verifier) in memory
3. Google gives back an authorization code
4. When your app exchanges that code for a token, it sends the *key* (code verifier)
5. Google runs the same math function on the key and checks: does this match the lock I was given earlier?

Even if someone intercepts the authorization code in step 3, they can't use it — because they don't have the code verifier that was never sent over the network.

Supabase handles all of this automatically. You don't write any PKCE code yourself.

---

## What is the `state` Parameter?

The `state` is a random string that your app generates before sending the user to Google, and checks when Google sends them back.

**Why it's needed — CSRF explained simply:**

Imagine you're already logged into FocusSharp. A bad person sends you a link in an email. You click it. Without you realising, the link silently completes a Google login and connects the bad person's Google account to YOUR FocusSharp account. Now they can access your data.

This attack is called **CSRF — Cross-Site Request Forgery** (forging a request from another site).

The `state` parameter stops this:
1. Before going to Google, your app generates a random string like `"x7k2p9"` and remembers it
2. It sends that string to Google as `state`
3. Google sends it back unchanged when the user returns
4. Your app checks: does the returned `state` match what I sent? If not, reject it

The attacker's fake link doesn't know what random string your app generated, so the check fails and the attack is blocked.

Supabase handles this automatically.

---

## Why Two Callbacks? (Supabase and Your App)

This is the part that confuses almost everyone. Why does the redirect go to Supabase first, and not directly to your app?

There are two separate hops:

**Hop 1: Google → Supabase** (`supabase.co/auth/v1/callback`)

Google sends the user here with a one-time code. Supabase's servers then exchange that code with Google's servers to get the user's actual info. This exchange requires the **Client Secret** — and this step happens server-to-server, never in the browser. The Client Secret never touches your app's code or the user's browser.

Think of it like a post office: Google hands a sealed envelope (the code) to the Supabase post office. Supabase opens it on their secure server, reads the contents (user info), and prepares your app's package (a session).

**Hop 2: Supabase → Your app** (`focussharp.app/api/auth/callback`)

Now Supabase redirects to your app with a Supabase session code (not the Google one). Your `/api/auth/callback` route exchanges this for session cookies so the browser knows the user is logged in.

Why not skip Supabase and go directly to your app? Because:
- Your app is a Next.js server — it could do the Google exchange itself
- But then you'd need to store the Client Secret in your own server, manage the exchange code, verify Google's response, handle errors
- Supabase does all of that so you don't have to write or maintain any of it

---

## What is a JWT (JSON Web Token)?

After sign-in, Supabase gives the user a JWT — a small digital ID card they carry with every request to prove who they are.

A JWT looks like random gibberish:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhM2Y4YzJkMSIsImVtYWlsIjoic2FuZGVlcEBleGFtcGxlLmNvbSIsImV4cCI6MTc0ODYxNjAwMH0.xK9mP2qRtL8vN3wYjZ5uA1bC4dE6fG7hI0jK
```

It has three parts separated by dots — `header.payload.signature`:

- **Header** — says what algorithm was used to sign it. Like the cover of the ID card.
- **Payload** — the actual info: user ID, email, expiry time. Like the details printed on the ID card.
- **Signature** — a mathematical proof that the header + payload haven't been tampered with. Like a hologram sticker on the ID card.

```json
// What the payload looks like when decoded:
{
  "sub": "a3f8c2d1-4b5e-6f7a-8c9d",   // user's ID
  "email": "sandeep@example.com",
  "role": "authenticated",
  "exp": 1748616000                     // expiry time (a Unix timestamp = seconds since 1970)
}
```

**The clever part:** Anyone can read the payload (it's just base64 encoded, like a simple encoding, not encryption). But no one can *change* it without breaking the signature — because making a valid signature requires Supabase's secret key, which nobody else has.

So when your API receives a JWT, it doesn't need to look up the database to know who the user is. It just verifies the signature (math, instant) and trusts the payload. This is much faster than a database lookup on every single request.

### Access token vs Refresh token

You get two tokens when you sign in:

| | Access token | Refresh token |
|---|---|---|
| **What it is** | Your current ID card | A voucher to get a new ID card |
| **Expires** | 1 hour | Weeks or months |
| **Used for** | Proving identity on every API request | Silently getting a new access token |
| **If stolen** | Attacker has 1 hour of access | Much more serious |

**Why does the access token expire so quickly?**
If it was stolen (say, it appeared in a log file somewhere), limiting it to 1 hour limits the damage. After an hour it's useless.

**How does the refresh token work without annoying the user?**
Our middleware runs on every request and silently calls `supabase.auth.getUser()`. If the access token is expired, Supabase uses the refresh token to get a new one automatically — no sign-in prompt, user notices nothing.

The refresh token is stored in an **HttpOnly cookie** — a special type of cookie that JavaScript code cannot read. This protects it from XSS attacks (malicious scripts injected into the page).

---

## Common Interview Questions on OAuth

**Q: What's the difference between authentication and authorization?**
Authentication = "who are you?" (proving identity). Authorization = "what are you allowed to do?" (permissions). OAuth is technically an authorization protocol — it grants access to resources. OpenID Connect (OIDC), which runs on top of OAuth, adds authentication (identity).

**Q: Why use OAuth instead of just asking for the user's Google password?**
Security and trust. Users shouldn't give their Google password to every app — if FocusSharp were hacked, attackers would have their Google password. OAuth means a breach of FocusSharp exposes only a revocable token, not the password itself.

**Q: What's the difference between OAuth 1.0 and 2.0?**
OAuth 1.0 required complex cryptographic signing of every request. OAuth 2.0 simplified this by using HTTPS for transport security and tokens for authorization. OAuth 2.0 is the industry standard today.

**Q: What is the difference between an authorization code and an access token?**
The authorization code is a short-lived one-time voucher exchanged server-to-server for the actual access token. It's an extra step that keeps the access token from ever appearing in the browser URL (which could be logged or leaked).

**Q: Why does the access token expire?**
If a token is stolen (e.g. via a man-in-the-middle attack or a log file), the damage is time-limited. A token that expires in 1 hour is much less dangerous than one that never expires.

**Q: What is CSRF and how does the `state` parameter prevent it?**
CSRF is when an attacker tricks a user's browser into making an authenticated request the user didn't intend. In OAuth, the `state` parameter ties the callback to the original request — if they don't match, the request is rejected.

---

## Summary: What Supabase Does For You

Without Supabase, to implement Google OAuth you would need to:
- Register with Google and manage credentials
- Build the redirect logic
- Implement PKCE yourself
- Make server-to-server token exchange calls
- Verify JWT signatures
- Store and manage refresh tokens
- Handle token refresh
- Implement the `state` parameter for CSRF protection
- Create user accounts in your database

Supabase handles all of this. You write ~10 lines of code and call `signInWithOAuth()`. That's the value of using an auth provider.
