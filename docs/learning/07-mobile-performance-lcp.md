# Mobile Performance — Fixing LCP on the Landing Page

## What was wrong

PageSpeed Insights showed desktop at 95 but mobile at 70. The specific problem was a
**Largest Contentful Paint (LCP) of 6.0 seconds** on mobile.

LCP measures how long until the biggest visible element on the page appears. Google's threshold
for "good" is 2.5s. 6.0s is well into the red.

The LCP element was the circular demo timer in the hero section. It looked like this to the
browser on mobile:

1. HTML arrives from the server — timer slot is **empty**
2. Browser downloads JS bundle (~slow on throttled 4G)
3. React parses and executes
4. Timer finally renders

Steps 2 and 3 took 6 seconds. The user stared at a blank card the whole time.

---

## Why it was broken — the `"use client"` problem

The `HeroTimer` component was marked `"use client"` because it used `useState` and `useEffect`
to tick the demo countdown. In Next.js App Router, `"use client"` means:

> "Don't render this on the server. Send an empty shell. Let the browser render it after JS runs."

For something interactive like a form or a live chart, that's necessary. But for a demo timer
that just needs to *look* like a timer before the user presses anything — it's wasteful. The
visual content was being held hostage by the interactivity requirement.

---

## What we fixed — the static shell pattern

We split the component into two:

### 1. `HeroTimerStatic` — plain SVG, no JS

```tsx
function HeroTimerStatic() {
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ width: size, height: size }} className="relative inline-flex ...">
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle ... /> {/* track */}
          <circle ... strokeDashoffset={circumference} /> {/* empty progress */}
        </svg>
        <span className="text-4xl ...">25:00</span>
      </div>
      <button disabled className="... bg-indigo-600 text-white">Try it live</button>
    </div>
  );
}
```

This is a plain server component. No `"use client"`. The SVG math runs at build/request time
on the server. The output is static HTML that the browser can paint immediately — no JS needed.

### 2. `HeroTimerInteractive` — real client component

Same as the original `HeroTimer` but renamed. Has `useState`, `useEffect`, the interval — all
the interactive logic. Loaded *after* the page is already painted.

### 3. `HeroTimer` — the glue (server component)

```tsx
import dynamic from "next/dynamic";

const HeroTimerInteractive = dynamic(() => import("./HeroTimerInteractive"), {
  ssr: false,
  loading: () => <HeroTimerStatic />,
});

export default function HeroTimer() {
  return <HeroTimerInteractive />;
}
```

- `dynamic(..., { ssr: false })` — Next.js skips server-rendering `HeroTimerInteractive` entirely
- `loading: () => <HeroTimerStatic />` — while the JS for the interactive version loads, show the
  static shell instead
- The user sees the static timer from the very first HTML response. LCP is measured against *that*
  paint, not the hydrated version. When JS finally loads, the interactive version silently swaps in.

---

## Next.js concepts used

### `next/dynamic`

Next.js's code-splitting API. Like `React.lazy()` but with extra options:

```ts
dynamic(() => import('./Component'), {
  ssr: false,        // don't server-render this component
  loading: () => <Placeholder />,  // show this while the JS chunk loads
})
```

Use it when:
- A component is heavy (Recharts, a map, a rich text editor) and only needed on one page
- A component uses browser APIs that don't exist on the server (`window`, `document`)
- You want to defer rendering until after the initial paint (our case)

### `ssr: false`

Tells Next.js: "this component should never render on the server." The initial HTML will not
include it. The browser renders it after hydration. This is the right choice when the
component's server output would be wrong or empty anyway.

### The `loading` prop

The placeholder shown while the dynamic component's JS chunk is being downloaded. It renders
immediately (it's part of the parent's server output), and swaps out once the real component
is ready. This is where the static shell goes.

---

## Also fixed: PostHog blocking Time to Interactive

PostHog analytics (~100KB of JS) was initialising in a `useEffect` across every page load.
`useEffect` runs after paint, so it didn't block LCP — but the JS still had to be parsed and
compiled as part of the bundle, adding to **Total Blocking Time (TBT)**.

Fix: `requestIdleCallback`

```ts
useEffect(() => {
  const id = requestIdleCallback(
    () => { posthog.init(...) },
    { timeout: 3000 }
  )
  return () => cancelIdleCallback(id)
}, [])
```

`requestIdleCallback` tells the browser: run this only when there's nothing more important to
do (no painting, no input handling, no layout). The browser gets to paint the page first, then
initialises analytics whenever it has spare capacity.

`timeout: 3000` is the safety net — if the browser stays busy for 3 seconds, run it anyway.

We also merged `PostHogPageView` (which was in a separate component and wrapped in `<Suspense>`
in `layout.tsx`) directly into the provider. One less unnecessary component in the tree.

---

## Summary — what changed

| File | Change |
|------|--------|
| `HeroTimer.tsx` | Converted to server component. Uses `dynamic` to lazy-load the interactive version. |
| `HeroTimerInteractive.tsx` | New file. Contains the original interactive logic. |
| `PostHogProvider.tsx` | Deferred init to `requestIdleCallback`. Merged `PostHogPageView` in. |
| `layout.tsx` | Removed `PostHogPageView` import and `<Suspense>` wrapper. |

## What this fixes

- **LCP**: Hero timer paints from server HTML — no JS needed to see it
- **TBT**: PostHog deferred to idle time — less main thread work during load
- **Bundle**: `HeroTimerInteractive` is now in its own chunk, only loaded on the landing page
