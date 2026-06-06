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
