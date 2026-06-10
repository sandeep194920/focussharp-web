# Engineering Challenges & How I Solved Them

A record of real technical roadblocks encountered while building FocusSharp — written so I
can explain them clearly in interviews. Each one covers the problem, why it was tricky, what
I tried, and the final decision.

---

## 1. localStorage + Supabase Sync Conflict (State Management Bug)

### The problem
FocusSharp stores all app state (categories, sessions, timer) in `localStorage` via Zustand's
`persist` middleware. When we added Supabase auth and cloud sync, we introduced a `syncOnLogin`
function that ran every time a user signed in. Its job: fetch the user's data from Supabase and
reconcile it with whatever was already in localStorage.

The merge logic looked like this:

```ts
// Remote wins on conflict; local-only records get pushed up
const remoteIds = new Set(remoteCats.map((c) => c.id));
const localOnly = localCats.filter((c) => !remoteIds.has(c.id));
const merged = [...remoteCats, ...localOnly];
set({ categories: merged });
localOnly.forEach((c) => _pushCategory(c)); // push guest data to DB
```

**The bug:** Every new browser/device starts with hardcoded default categories:

```ts
const defaultCategories = [
  { id: "cat-1", name: "Deep Work", ... },
  { id: "cat-2", name: "Reading", ... },
  { id: "cat-3", name: "Admin", ... },
];
```

These IDs (`cat-1`, `cat-2`, `cat-3`) were never in Supabase. So on every sign-in, the merge
treated them as "local-only" user data, appended them to the real remote categories, and pushed
them up to the database. The user would see their real custom categories *plus* the default ones
reappearing — even after they had deleted them.

### Why it was tricky
The merge logic was *intentionally correct* for a real use case: a guest who creates categories
before signing up should have those categories preserved. The bug wasn't in the merge algorithm —
it was in a hidden assumption: **that guests could create categories in the first place.**

The defaults looked like user-created data because they had the same shape. The fix wasn't
obvious until we questioned the product decision underneath it.

### What I considered

**Option A — Filter out default IDs during merge:**
```ts
const DEFAULT_IDS = new Set(["cat-1", "cat-2", "cat-3"]);
const localOnly = localCats.filter((c) => !remoteIds.has(c.id) && !DEFAULT_IDS.has(c.id));
```
Works but fragile — hardcoded IDs in business logic, doesn't scale if defaults change.

**Option B — Gate category edits behind `!!user`, simplify merge:**
Guests can't create categories, so no local-only data to push. Replace merge with a straight
remote replace. This fixed the category bug but sessions still lived in localStorage —
meaning sign-out still showed stale signed-in data.

**Option C (chosen — final architecture) — Guests are fully stateless:**
After deeper thinking about the product model, the right answer was: guests shouldn't have
persistent data at all. They can try the timer, but nothing is saved. Sign up to own your data.

This eliminated the entire problem class:
- No merge needed (nothing to merge)
- No sync needed on sign-out (nothing to restore)
- Supabase is the single and only source of truth for signed-in users
- localStorage only holds theme and sound preferences

### The final fix
Four changes:

1. **Single guest category** — replaced 3 default categories with one (`id: "cat-default"`),
   making it unambiguous that this is a placeholder, not user data.

2. **Store mutations gated** — `addCategory`, `updateCategory`, `deleteCategory`, and
   `addSession` all return early if `!user`. Timer still works for guests but nothing is saved.

3. **`syncOnLogin` simplified** — no merge at all. Just fetch from Supabase and replace
   in-memory state:
```ts
set({ sessions: remoteSessions }); // straight replace, no merge
```

4. **`partialize` stripped** — removed `categories` and `sessions` from Zustand's localStorage
   persist. Only `theme`, `soundEnabled`, `isPro` are persisted. Data lives in Supabase.

5. **Stale localStorage cleanup** — one-time migration on page load strips any old
   `categories`/`sessions` keys from existing users' localStorage.

### What I learned
- **Product decisions and technical decisions are tightly coupled.** Every sync bug traced
  back to an unenforced product boundary — "what can a guest actually do?"
- **Merge logic is a smell.** Any time you're merging two sources of truth, ask whether
  you actually need two sources. The answer here was no.
- **"Guest mode" is a product decision, not a technical one.** Once we decided guests are
  stateless, the entire data layer simplified dramatically — no merge, no conflict, no sync.
- **localStorage as persistent state is deceptively tricky** once a backend exists. Data
  that seems harmless at launch becomes ghost data the moment sync is involved.

### How to explain this in an interview
*"I built a focus timer with localStorage for offline use, then added Supabase for cloud sync.
When I wired up login sync, users started seeing deleted categories reappear. The root cause
was that hardcoded default category IDs in localStorage were indistinguishable from real
user-created data — the merge logic kept treating them as guest data and pushing them back
to the database on every sign-in.*

*My first instinct was to filter out the default IDs — that would have fixed the immediate bug.
But I stepped back and asked a product question: should guests be able to create data at all?
The answer was no. Guests should be able to try the timer, but signing up is the moment you
own your data.*

*That product decision collapsed the entire technical problem. No guest data means no merge.
No merge means Supabase is the single source of truth. I removed categories and sessions from
localStorage entirely — they only live in memory while you're signed in, fetched fresh from
Supabase on every login. Sign out clears memory. Sign back in restores everything. Clean,
scalable, no edge cases."*

---

## 2. Flash of Unstyled Content (FOUC) in Dark Mode

### The problem
FocusSharp supports light/dark/system themes stored in localStorage. On page load, React
hydrates on the client — but by then the browser has already painted the page with the default
(light) styles. Users on dark mode would see a white flash for ~100ms before the correct theme
applied.

### The fix
A small blocking `<script>` injected in the root `<head>` before any React code runs:

```html
<script>
  (function() {
    try {
      var t = localStorage.getItem('focussharp-theme');
      if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
</script>
```

This runs synchronously before the browser paints, so the correct class is already on `<html>`
before any CSS is applied. No flash.

### What I learned
- React hydration happens too late for theme initialisation. Some things must run before React.
- Inline blocking scripts are generally bad for performance — but for theme detection they are
  the correct tool. The script is tiny (<200 bytes) and only runs once.
- Next.js App Router makes this easy via the root `layout.tsx` — you can inject raw `<script>`
  tags in the `<head>` before the React tree.

### How to explain in an interview
*"Dark mode via CSS classes has a timing problem: localStorage is only readable in the browser,
but React renders on the server and hydrates on the client. By the time JS runs, the browser has
already painted. I fixed it with a tiny inline blocking script in the `<head>` that reads
localStorage and sets the class on `<html>` before any paint — the only reliable way to avoid
the flash without a server-side session."*

---

## 3. Timer Accuracy with setInterval

### The problem
The focus timer counts down using `setInterval` firing every second. But `setInterval` is not
precise — it can drift by tens or hundreds of milliseconds per tick, especially when the tab is
backgrounded or the device is under load. Over a 40-minute session, drift can accumulate.

### The fix
Instead of trusting the tick count, the timer stores `sessionStart: Date.now()` when the
session begins and calculates elapsed time on every tick:

```ts
tickTimer: () => {
  const elapsed = Math.floor((Date.now() - timer.sessionStart) / 1000);
  const newSecs = Math.max(0, timer.totalSecs - elapsed);
  ...
}
```

The interval is only used as a "wake up and check" signal — the actual time is always derived
from wall-clock difference. This means even if ticks are delayed or skipped, the display
snaps to the correct value on the next tick.

### What I learned
- Never use tick count as a source of truth for time. Clocks exist for this.
- `setInterval` is a polling mechanism, not a timer. The distinction matters.
- This pattern (store start time, derive elapsed on each frame) is the same one used in
  game loops and animation frames.

### How to explain in an interview
*"I used setInterval for the timer UI but quickly realised that counting ticks is unreliable —
browsers throttle intervals in background tabs. The fix was to store the session start timestamp
and compute elapsed time as `Date.now() - startTime` on each tick. The interval just triggers
the re-render; the time itself comes from the wall clock. It's the same pattern used in game
loops."*

---

## 4. Mobile LCP of 6.0s — Hero Timer Blocked by JavaScript

### The problem

PageSpeed Insights showed desktop scoring 95 but mobile only 70. The Largest Contentful Paint
(LCP) on mobile was 6.0 seconds — well over Google's 2.5s "good" threshold.

The LCP element was the circular demo timer in the hero section. It was a `"use client"` React
component. That means the server sent an empty `<div>` to the browser, and the timer only
appeared after the browser had downloaded, parsed, and executed the entire JS bundle. On a
throttled mobile connection, that takes 6 seconds.

### Why it was tricky

The component worked perfectly — it just rendered too late. Nothing was broken. The problem was
architectural: we were using a client-side component for something that could be shown statically
from the server. The interactivity (the start/pause button) wasn't needed immediately. The visual
(the ring and the 25:00 display) was the thing users needed to see first.

The tricky part is that `"use client"` is contagious — once a component uses hooks like `useState`,
it has to be a client component. You can't make it server-rendered without splitting it into two.

### What I considered

**Option A — Refactor to remove useState and make it server-rendered:**
Not possible — the timer needs `useState` and `useEffect` to tick.

**Option B — Add a skeleton/spinner as placeholder while JS loads:**
Would have reduced CLS (layout shift) but not LCP — the timer still wouldn't paint until JS ran.
The LCP element would just be the spinner, not the actual content.

**Option C (chosen) — Static server shell + lazy-loaded interactive version:**
Split into two components:
- `HeroTimerStatic` — plain SVG with hardcoded `25:00`, no JS. Rendered by the server, included
  in the initial HTML. Paints immediately.
- `HeroTimerInteractive` — the real `"use client"` component with state and intervals.

Use `next/dynamic` with `ssr: false` and `loading: () => <HeroTimerStatic />`:

```tsx
const HeroTimerInteractive = dynamic(() => import("./HeroTimerInteractive"), {
  ssr: false,
  loading: () => <HeroTimerStatic />,
});
```

The browser sees the static SVG timer in the first HTML response. LCP is measured against that
paint. The interactive version silently swaps in after JS loads — the user barely notices.

### Also fixed: PostHog blocking the main thread

PostHog analytics (~100KB) was initialising synchronously in a `useEffect` on every page. Even
though `useEffect` runs after paint, the JS still had to be parsed and compiled as part of the
initial bundle, adding to Total Blocking Time (TBT).

Fix: defer init with `requestIdleCallback`:

```ts
requestIdleCallback(() => {
  posthog.init(key, options)
}, { timeout: 3000 })
```

The browser only runs this when the main thread is idle — after painting, layout, and user input
are handled. The `timeout: 3000` ensures it runs within 3 seconds even on a very busy page.

Also consolidated `PostHogPageView` (which was in a separate file and wrapped in `<Suspense>` in
`layout.tsx`) into the provider itself, reducing one unnecessary component boundary.

### The final fix — three files changed

1. `HeroTimer.tsx` — converted from a client component to a server component that lazy-loads
   `HeroTimerInteractive` and shows `HeroTimerStatic` while loading.
2. `HeroTimerInteractive.tsx` — new file containing the original interactive logic, now only
   loaded after hydration.
3. `PostHogProvider.tsx` — merged `PostHogPageView` in, deferred init to `requestIdleCallback`.

### The one-liner for interviews

*"The hero timer on the landing page was a client component, which meant it couldn't render until
JavaScript ran — that caused a 6-second LCP on mobile. I split it into a static server-rendered
SVG shell that paints immediately, and a lazy-loaded interactive version that hydrates silently
in the background. That dropped the LCP element from JS-dependent to HTML-dependent."*

---

## 5. Silent Session Data Loss — Expired Auth Token + Fire-and-Forget API Calls

### The problem
Users (including me) completed focus sessions that never appeared in the stats page. The sessions
looked like they completed normally — the timer rang, the UI moved to the break screen — but
nothing was saved to the database. No error was shown anywhere.

### Why it was tricky
Three separate issues combined to make this completely invisible:

1. **No `onAuthStateChange` listener.** Supabase auth tokens have an expiry. The Supabase client
   refreshes them automatically in the background — but only if something is listening for the
   `TOKEN_REFRESHED` event and updating the app's auth state accordingly. Without a listener,
   the token would silently expire mid-session. The API would start returning 401s, but the UI
   still showed the user as logged in because the store's `user` object was never cleared.

2. **Fire-and-forget with silent catch.** The `_pushSession` function that POSTs sessions to the
   API used `.catch(() => {/* silent */})`. Any failure — 401, network error, Supabase down —
   was swallowed completely. No log, no retry, no user feedback.

3. **No retry or queue.** Once a session POST failed, it was gone. There was no pending queue,
   no localStorage fallback for logged-in users, nothing.

```ts
// Before — silent failure
_pushSession: (session) => {
  fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  }).catch(() => {/* silent */}); // <-- swallows 401s, network errors, everything
},
```

### The fix

**1. Added `onAuthStateChange` listener in the app layout.**

First, some context on how Supabase tokens work:

When you sign in, Supabase gives your browser two things:
- An **access token** — proves you're logged in. Expires after 1 hour.
- A **refresh token** — used only to get a new access token when the old one expires.

After 1 hour, the Supabase client automatically uses the refresh token to silently get a new
access token. You never see this happen. But our app's store (which holds the `user` object)
had no idea this was happening — it was set once on page load and never updated.

So the situation was:
- 0 min: You sign in. Store has `user`. Token is valid. Writes work.
- 60 min: Token expires. Supabase gets a new one silently.
- 61 min: You complete a session. The store still has `user` so the code tries to save.
  But the API is now using a stale cookie — it returns 401. Session is dropped silently.

The fix is `onAuthStateChange` — a listener that Supabase calls every time auth state changes:
token refreshed, token expired, user signed out. We use it to keep the store's user in sync
with what Supabase actually knows.

```ts
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED" && session?.user) {
    // Supabase just got a new token — update the store to match
    setUser({ id: session.user.id, email: session.user.email ?? "", ... });
  }
  if (event === "SIGNED_OUT") {
    // Token expired and couldn't be refreshed — clear the user from the store
    // so the UI reflects reality (user is no longer authenticated)
    setUser(null);
  }
});
return () => subscription.unsubscribe(); // clean up when component unmounts
```

**2. Replaced silent catch with console.error:**

```ts
_pushSession: (session) => {
  fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  }).catch((err) => { console.error("[_pushSession]", err); });
},
```

At minimum, failures are now visible in DevTools and captured by Sentry.

### What I learned
- **Always listen to `onAuthStateChange`.** A Supabase app without it is broken by design —
  tokens expire and the client has no way to know unless something is listening.
- **Silent catches are data loss waiting to happen.** `.catch(() => {})` on a write operation
  is almost never correct. At minimum log the error. For critical data, queue and retry.
- **"Logged in" in the UI ≠ "auth token is valid."** The store holds a user object in memory.
  The token is a separate thing that lives in a cookie. They can go out of sync. The listener
  keeps them in sync.
- **Test auth expiry explicitly.** In development, manually expire the token (clear the cookie,
  or shorten the JWT expiry in Supabase settings) and verify writes still work.

### How to explain in an interview
*"I had a bug where completed focus sessions were silently not saving to the database. The UI
showed the user as logged in, sessions appeared to complete normally, but nothing appeared in
the stats. The root cause was two things: I had no `onAuthStateChange` listener, so when the
Supabase auth token expired mid-session, the API started returning 401s but the UI had no idea.
And the API call used `.catch(() => {})`, so every 401 was swallowed silently.*

*The fix was to add the auth state listener so token refreshes keep the store in sync, and to
replace silent catches with proper error logging. The broader lesson: for any write operation
that matters, never swallow errors — at minimum log them. For critical data like session records,
the right pattern is to queue failed writes and retry rather than drop them."*

---

## 6. Sessions Still Not Saving — The Real Bug Was Missing Database Columns

### The problem
After fixing the auth listener in challenge 5, sessions were still not saving to the database.
Same symptom: timer completed, "Session complete" showed on screen, but nothing in the stats
and nothing in the Supabase table.

### The investigation
Opening DevTools → Network tab and completing a session revealed the POST to `/api/sessions`
was firing and returning **500**. The error response from Supabase:

```
Could not find the 'cat_color' column of 'sessions' in the schema cache
```

### Why it happened
The `sessions` table was created early in the project by manually clicking through the
Supabase dashboard Table Editor. At that point, the schema only had the basic columns:
`id`, `user_id`, `cat_id`, `duration_mins`, `completed_at`, `note`.

Later, the app code was updated to store richer session data — `cat_name`, `cat_color`,
`started_at`, `completed`, `type` — but the database schema was never updated to match.
The migration file also didn't reflect the real prod schema because the table was created
manually, not through a migration.

### Why it was invisible
The `.catch(() => {})` on `_pushSession` swallowed the 500 error completely. No console
log, no UI feedback, nothing. The session appeared to complete from the user's perspective
but the database was silently rejecting every insert.

### The fix
Ran this directly in the Supabase prod SQL Editor:

```sql
alter table public.sessions
  add column cat_name   text,
  add column cat_color  text,
  add column started_at bigint,
  add column completed  boolean not null default true,
  add column type       text    not null default 'focus';
```

Sessions started saving immediately.

### What I learned
- **Silent catches hide the real bug.** We spent time investigating auth token expiry
  because `.catch(() => {})` gave us zero signal. The actual error was a simple missing
  column. If it had logged the error, this would have been a 2-minute fix.
- **Manual schema changes in the dashboard don't create migration files.** Any change
  made through the Supabase Table Editor or dashboard bypasses the migrations system.
  Always use `supabase migration new` + SQL, never the dashboard UI for schema changes.
- **Dev and prod schemas can silently diverge.** If prod was set up manually and dev
  uses migrations, they will drift. The only source of truth is what's actually in the
  prod database — verify with the Table Editor when debugging unexpected API errors.
- **Always check the Network tab first.** Before theorising about root causes, open
  DevTools, reproduce the bug, and read the actual error response. The answer is usually
  right there.

### How to explain in an interview
*"I had a bug where focus sessions weren't saving. I initially suspected an auth token
issue — there was no `onAuthStateChange` listener which is a real problem — but sessions
were still failing after fixing that. Opening the Network tab showed the POST was returning
500 with 'Could not find the cat_color column'. The prod database schema was missing several
columns because the table had been created manually through the Supabase dashboard early in
the project, and the schema was never updated when the app code evolved.*

*The fix was a one-line ALTER TABLE. But the real lesson was that a silent `.catch(() => {})`
on the API call had hidden this error completely — we were debugging auth theory when the
answer was sitting in the network response the whole time. Never swallow errors on writes."*

---

## 7. "Works on Mac, Crashes on Phone" — Unguarded localStorage Call Crashed the Whole App

### The problem
After adding two improvements to the timer — (1) catching up the countdown immediately on
mount instead of waiting up to 1 second for the first tick, and (2) a cross-tab dedupe guard
so two open tabs don't both log the same completed session — the app worked perfectly on
desktop Chrome and Safari. On an iPhone, opening `focussharp.app` showed:

```
Application error: a client-side exception has occurred
(see the browser console for more information)
```

A full white screen. Nothing rendered, not even the navbar.

### Why it happened
The dedupe guard added a direct `localStorage.getItem` / `localStorage.setItem` call inside
`tickTimer()`:

```ts
const dedupeKey = `focussharp-session-completed-${timer.sessionStart}`;
if (localStorage.getItem(dedupeKey)) { ... }
localStorage.setItem(dedupeKey, "1");
```

Separately, the timer page was changed to call `tickTimer()` **immediately on mount** if the
persisted timer state says a session is already running (so reopening the app mid-session
doesn't show a stale time for up to a second):

```ts
useEffect(() => {
  if (timer.phase === "running") {
    tickTimerRef.current(); // <-- runs synchronously on first render
    intervalRef.current = setInterval(() => tickTimerRef.current(), 1000);
  }
  ...
}, [timer.phase, timer.breakType]);
```

Put together: **as soon as the app loads with a running session restored from localStorage,
`tickTimer()` fires during the very first `useEffect`, which calls `localStorage.setItem`
synchronously.**

On desktop this is harmless — `localStorage` is always available. But on iPhone Safari,
`localStorage` access can throw a `SecurityError` or `QuotaExceededError` in certain
contexts: Private Browsing mode (older iOS versions), low-storage devices, or webviews with
storage restrictions (e.g. opening a link from another app). When `localStorage.setItem`
throws inside a `useEffect` on first render, React has no error boundary around it — the
whole component tree unmounts and Next.js shows the generic "Application error: a
client-side exception has occurred" white screen.

### Why it was tricky
Both changes were correct and tested individually. Neither one *looks* dangerous in
isolation — `localStorage` "always works" is a habit from years of desktop-first
development. The bug only appears when **all three conditions line up**: (1) a session is
actively running and persisted, (2) the page is reloaded/reopened so the mount-time tick
fires, and (3) the browser's storage is restricted. None of these are visible from reading
either diff alone — only from tracing the data flow from "tab opens" → "effect fires" →
"store action runs" → "raw browser API call."

### The fix
Wrap the localStorage dedupe check in try/catch and fall back to normal (non-deduped)
completion if storage isn't available:

```ts
try {
  if (localStorage.getItem(dedupeKey)) {
    set((s) => ({ timer: { ...s.timer, phase: "break", ... } }));
    return;
  }
  localStorage.setItem(dedupeKey, "1");
} catch {
  // localStorage unavailable — proceed without dedupe
}
```

Losing the cross-tab dedupe in the rare case storage is blocked is a fine tradeoff — a
duplicate session log is far better than a fully broken app.

### What I learned
- **Any `localStorage`/`sessionStorage` call outside of Zustand's `persist` middleware needs
  a try/catch.** `persist` already handles storage errors internally; raw calls added to
  store actions do not.
- **Code that runs during the first `useEffect` on mount is the highest-risk place for this
  kind of bug.** There's no error boundary yet, the user hasn't interacted with anything,
  and a thrown error there takes down the entire page — not just one feature.
- **"Works on my machine" for browser APIs often really means "works on desktop."** Mobile
  Safari (especially Private Browsing, low storage, or in-app webviews like Instagram/Slack
  browsers) has meaningfully different storage availability than desktop Chrome/Safari.
  Always test storage-touching changes on a phone before shipping.
- **Two small, individually-correct changes can combine into a crash.** Reviewing each diff
  in isolation wouldn't have caught this — the bug only exists at the intersection of "tick
  on mount" and "tick writes to localStorage."

### How to explain in an interview
*"I shipped two small timer improvements — instant catch-up on mount, and a cross-tab
dedupe using localStorage — and the app started crashing completely on iPhone while working
fine on desktop. The root cause was that the dedupe check called `localStorage.setItem`
directly, with no try/catch, and the 'tick on mount' change meant this now ran synchronously
during the first render whenever a session was already in progress. On Safari, localStorage
can throw in restricted contexts like Private Browsing — and an uncaught throw during the
first `useEffect` has no error boundary, so it crashes the entire app to a white screen.*

*The fix was a simple try/catch with a graceful fallback. The bigger lesson was that any raw
browser storage API call needs defensive handling, especially in code paths that run on
mount before the user has done anything — and that mobile Safari's storage behaviour is
genuinely different from desktop, not just slower."*
