# FocusSharp — Feature Backlog & Ideas

> Prioritised list of future improvements. Reference this when planning sprints.
> Linked from [CLAUDE.md](./CLAUDE.md).

---

## 🔥 High priority

- [x] **Stripe checkout integration** — wired up `/api/checkout`, `/api/webhooks/stripe`, `/api/portal`. Stripe prod keys set in Vercel.
- [x] **Email waitlist backend** — `/api/waitlist` saves email to Supabase `waitlist` table (upsert on conflict). No SMTP needed; frontend shows confirmation message. No outbound email for now.
- [x] **Sentry error tracking** — `@sentry/nextjs` integrated, DSN set in env vars.
- [x] **Supabase URL Configuration** — Site URL set to `https://focussharp.app`, redirect URL `https://focussharp.app/api/auth/callback` added.
- [x] **`NEXT_PUBLIC_APP_URL`** — set to `https://focussharp.app` in Vercel env vars.
- [ ] **Notification API** — browser notification when a timed break ends (requires
      permission prompt, should be opt-in).
- [ ] **Session history list** — a `/app/history` page listing all past sessions with
      date, category, duration, and completion status. Filterable by category.
- [ ] **Mobile PWA** — add `manifest.json`, service worker, and "Add to Home Screen"
      support so the web app feels native on iOS Safari.

---

## 🛠 Core product improvements

- [ ] **Keyboard shortcuts** — `Space` to start/pause, `Esc` to end early. Especially
      useful on desktop for power users.
- [ ] **Sound effects** — optional subtle chime when session completes and break ends.
      User-toggleable in settings.
- [ ] **Focus goals** — let users set a daily focus goal (e.g. 4 hours/day) and show
      progress toward it in the stats and on the timer page.
- [ ] **Custom session notes** — optional free-text note attached to a session (e.g.
      "finished chapter 3"). Stored in session record, shown in history.
- [ ] **Recurring session templates** — save "25 min Deep Work" as a one-tap template
      so users don't have to re-pick category + duration each time.
- [ ] **Stats export** — CSV export of all sessions for power users and data portability.
- [ ] **iCloud / CloudKit sync** — when the native apps launch, sync sessions across
      web and native via CloudKit (requires auth). Web fallback: manual JSON import/export.

---

## 🎨 Design & UX

- [ ] **Haptic feedback on mobile** — use the Vibration API for a subtle pulse on
      session start, pause, and completion.
- [ ] **Animated ring fill** — add a subtle glow or shimmer to the circular progress ring
      when a session completes.
- [ ] **Onboarding flow** — first-time user walkthrough: pick your first category, set a
      duration, start. 3-step overlay, dismissible, never shown again.
- [ ] **Empty state illustrations** — custom minimal SVG illustrations for the empty
      stats page, no-session history, and category list.
- [ ] **Widget-style home screen shortcut** — a large "Start [last category]" button on
      `/app` that remembers the last used category and duration for one-tap sessions.

---

## 📊 Analytics & Business Metrics

- [ ] **Business metrics dashboard** — use Supabase SQL queries directly for now (no extra
      tool needed). Key queries: total users, paid users, sessions per day, revenue. Graduate
      to Metabase or PostHog once post-launch volume justifies it.
      ```sql
      -- Quick metrics cheatsheet
      SELECT COUNT(*) FROM profiles;                          -- total users
      SELECT COUNT(*) FROM profiles WHERE is_pro = true;     -- paid users
      SELECT COUNT(*) FROM sessions WHERE completed_at > extract(epoch from now() - interval '7 days') * 1000; -- sessions this week
      ```
- [ ] **Frontend event tracking** — add `session_start`, `session_complete`, `break_start`,
      `category_created`, `upgrade_click` events to Vercel Analytics (already wired in
      `app/layout.tsx`) or Google Analytics 4.
- [ ] **Email confirmation + SMTP** — turn "Confirm email" back on in Supabase before
      public launch. Set up Resend (free up to 3,000 emails/month) as the SMTP provider
      so confirmation and notification emails deliver reliably. (Deferred — waitlist is
      save-only for now; revisit when sending launch emails to the list.)
- [x] **Email user on membership change** — Resend sends welcome email on Pro upgrade and
      cancellation notice on `customer.subscription.deleted`. Wired in `/api/webhooks/stripe`.
- [x] **Email user on refund** — Resend sends refund confirmation on `charge.refunded` webhook.
      Wired in `/api/webhooks/stripe`.
- [x] **Notify founder on new Pro signup** — Resend notifies sandeepamarnath@staarsolutions.ca
      on every `checkout.session.completed` event. Wired in `/api/webhooks/stripe`.
- [x] **Notify founder on waitlist signup** — Resend notifies founder on every new waitlist
      entry. Wired in `/api/waitlist`.

---

## 📈 Growth & SEO

- [ ] **Blog posts** — write 4–6 SEO articles targeting `focus timer`, `pomodoro timer`,
      `deep work timer`, `study timer app`, etc. Use MDX for authoring.
- [ ] **Open Graph image generation** — use `next/og` to generate dynamic OG images per
      page for better social sharing previews.
- [ ] **Testimonials with avatars** — replace placeholder testimonials with real user
      quotes and gravatars once early users provide feedback.
- [ ] **Google Analytics 4 event tracking** — track `session_start`, `session_complete`,
      `break_start`, `category_created`, and `upgrade_click` events.
- [ ] **Product Hunt launch** — prepare assets: tagline, description, GIF demo,
      maker comment. Target a Monday launch.

---

## 🍎 Native app prep

- [ ] **SwiftUI design tokens** — export Tailwind color/spacing tokens to a shared
      `DesignTokens.json` that the Swift project can consume.
- [ ] **CloudKit schema design** — plan the CKRecord schema for `Category` and `Session`
      to match the existing Zustand store types.
- [ ] **App Store metadata** — draft App Store title, subtitle, description, keywords,
      and screenshots plan (iPhone 15 Pro + Apple Watch Ultra 2).
- [ ] **watchOS complication** — design the watch face complication showing today's total
      focus time and the active category color.
- [ ] **Mac menu bar widget** — Swift `NSStatusItem` with a mini countdown and start/stop.

---

## 🔒 Security & reliability

- [ ] **Rate limiting on API routes** — add `@upstash/ratelimit` to Stripe checkout
      and webhook endpoints.
- [ ] **Error boundary** — wrap the `/app` timer in a React error boundary so a JS
      error doesn't lose an in-progress session.
- [x] **Session recovery** — done. The `timer` slice (including `sessionStart`/
      `breakStart`) is now persisted to localStorage and rehydrated via a cross-tab
      `storage` event listener (`lib/store.ts`), so reopening/reloading a tab
      mid-session recomputes elapsed time immediately and all tabs in the same
      browser share one active session (a second tab no longer starts a duplicate).
- [ ] **`tickOpenSession` timestamp-based recompute** — unlike `tickTimer`/`tickBreak`,
      `tickOpenSession` increments `secsElapsed` by a flat `+1` per tick instead of
      recomputing from `sessionStart`. Causes ~1s undercount per pause/resume cycle
      and means a freshly reopened tab during a flow session is briefly stale until
      the next tick. Low priority/cosmetic — align with the timestamp-based pattern
      (would need a `secsElapsedBase` field set on start/resume).
- [ ] **Content Security Policy header** — add a strict CSP once AdSense is integrated
      (AdSense requires `unsafe-inline` for scripts — plan accordingly).

---

## 💡 Wild ideas (low priority / research)

- [ ] **Pause & Park** — park the current running session (freezes the timer, saves context)
      and start a fresh one. On return, resume the parked session. One active timer at a time —
      no multi-tasking, just context-switching with intent. Pro/Lifetime feature.

- [ ] **Most active time of day** — show users their peak focus hours in the stats page
      (e.g. "You focus best between 9–11am"). Requires enough session history to be
      meaningful; better as a "week 3+" feature once users have built a habit.


- [ ] **AI session insights** — weekly "you focus best on Tuesday mornings" insights
      generated from session patterns (privacy-safe, computed client-side).
- [ ] **Shared focus rooms** — real-time "focus together" rooms where users can see
      each other's timers running (no chat, no noise — just presence).
- [ ] **Integrations** — Notion, Linear, Toggl export. Auto-log FocusSharp sessions
      as Toggl time entries.
- [ ] **Focus calendar view** — a GitHub-style heatmap calendar showing focus intensity
      per day over the past year.
