# Analytics & Error Tracking: PostHog + Sentry

## Why PostHog over Amplitude?

Both are product analytics tools but they target different stages:

| | PostHog | Amplitude |
|---|---|---|
| Free tier | 1M events/month | 50K MAU |
| Session replay | Built-in | Paid add-on |
| Self-hostable | Yes | No |
| Complexity | Low | High |

Amplitude is built for large product teams running A/B tests across dozens of features. At FocusSharp's stage, PostHog gives everything needed — funnels, session replay, event explorer — without the overhead.

## Why Sentry?

Sentry catches JavaScript errors and sends them to a dashboard with full stack traces. Without it, you only find out about errors when users complain. With it, you see them the moment they happen, with the exact line of code that failed.

The key difference from `console.error`: Sentry errors are **permanent and searchable** across all users, not just your own browser session.

---

## How the PostHog setup works in Next.js App Router

Next.js App Router uses React Server Components by default. PostHog is a browser SDK — it can only run client-side. This creates a challenge: the root `layout.tsx` is a Server Component, so you can't call `posthog.init()` there directly.

The solution is a Client Component wrapper:

```
app/layout.tsx (Server Component)
  └── <PHProvider> (Client Component — "use client")
        └── posthog.init() runs in useEffect (browser only)
        └── <PostHogProvider> makes posthog available via React context
              └── <PostHogPageView> (Client Component)
                    └── listens to pathname changes, fires $pageview
```

### Why `capture_pageview: false`?

PostHog's auto pageview fires on initial load only — it doesn't know about Next.js client-side navigation (which doesn't do a full page reload). We disable the auto capture and use `PostHogPageView` instead, which listens to the Next.js router's `pathname` changes via `usePathname()`.

### Why `<Suspense>` around `<PostHogPageView>`?

`useSearchParams()` must be inside a `<Suspense>` boundary in Next.js App Router, otherwise the entire route opts out of static rendering. Wrapping with `<Suspense fallback={null}>` keeps static page generation working.

### `person_profiles: 'identified_only'`

This means PostHog only creates a persistent person profile when `posthog.identify()` is called (i.e., when a user signs in). Anonymous visitors are tracked but don't consume your "persons" quota. Better for privacy and quota management.

---

## How Sentry covers client, server, and edge

Modern Next.js (App Router) has three JavaScript runtimes:

| Runtime | Where it runs | What it handles |
|---|---|---|
| **Browser** | User's browser | React rendering, user interactions |
| **Node.js** | Vercel serverless functions | API routes (`/api/*`) |
| **Edge** | Vercel edge network | Middleware |

Sentry needs separate `init()` calls for each because they're separate processes.

### File structure

```
instrumentation-client.ts   ← browser init (replaces old sentry.client.config.ts)
instrumentation.ts          ← server + edge init via Next.js instrumentation hook
```

The `instrumentation.ts` file is a Next.js convention — it runs once when each runtime boots. We check `process.env.NEXT_RUNTIME` to know which runtime we're in and import Sentry dynamically.

### Why dynamic imports in `instrumentation.ts`?

```ts
const { init } = await import('@sentry/nextjs')
```

`instrumentation.ts` is a shared file that gets bundled for both Node.js and Edge. If we used a static import, both runtimes would try to import the same bundle. Dynamic imports let each runtime load the correct Sentry bundle at runtime.

---

## How Sentry source maps work

In development, your TypeScript is compiled on-the-fly and stack traces point to the right lines. In production, Next.js minifies and bundles everything — a stack trace would show `e.js:1:4821`, which is useless.

Source maps solve this: they're files that map minified code back to the original TypeScript. `withSentryConfig` in `next.config.mjs` adds a webpack plugin that:
1. Generates source maps during `npm run build`
2. Uploads them to Sentry (using `SENTRY_ORG` + `SENTRY_PROJECT`)
3. Deletes them from the public build output (so they're not exposed to users)

Result: production errors in Sentry show your original TypeScript lines.

---

## The `lib/analytics.ts` abstraction

```ts
export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  posthog.capture(event, props)
}
```

Three reasons for this wrapper:

1. **Server-side safety**: `lib/store.ts` is a `"use client"` file but Zustand can technically run server-side in some contexts. The `typeof window === 'undefined'` guard prevents PostHog (a browser-only SDK) from crashing on the server.

2. **Centralised event names**: All `track()` calls are in one codebase location. If you ever swap PostHog for something else, you change one file.

3. **Easy to mock in tests**: You can replace `track` with a jest spy without touching PostHog's internals.

---

## Events tracked

| Event | When | Key properties |
|---|---|---|
| `session_started` | Timer or flow session begins | `duration_mins`, `category_name`, `type` |
| `session_completed` | Timer reaches zero naturally | `duration_mins`, `category_name` |
| `session_ended_early` | User ends session manually | `elapsed_secs`, `planned_mins`, `category_name` |
| `session_paused` | User pauses | `elapsed_secs` |
| `session_resumed` | User resumes | — |
| `break_started` | Break begins | `break_type`, `duration_mins` |
| `break_skipped` | User skips break | — |
| `category_created` | New category added | `color` |
| `sign_in` | Supabase auth completes | — |
| `sign_out` | User signs out | — |

## Identity linking

When a user signs in, we call `posthog.identify(user.id, { email })`. This links all anonymous events from that session to the identified person profile. On sign-out, `posthog.reset()` clears the identity so the next anonymous session starts fresh.
