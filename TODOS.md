# FocusSharp — Feature Backlog & Ideas

> Prioritised list of future improvements. Reference this when planning sprints.
> Linked from [CLAUDE.md](./CLAUDE.md).

---

## 🔥 High priority

- [ ] **Stripe checkout integration** — wire up `/api/checkout` and `/api/webhooks/stripe`
      for Pro monthly, annual, and Lifetime plans. Unlock `isPro` on successful payment.
- [ ] **Email waitlist backend** — capture emails from the native app waitlist form and
      blog subscribe form (Resend / Mailchimp / Supabase).
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
- [ ] **Session recovery** — if the user closes the tab mid-session, restore the elapsed
      time on next open (store `sessionStart` timestamp in localStorage separately).
- [ ] **Content Security Policy header** — add a strict CSP once AdSense is integrated
      (AdSense requires `unsafe-inline` for scripts — plan accordingly).

---

## 💡 Wild ideas (low priority / research)

- [ ] **AI session insights** — weekly "you focus best on Tuesday mornings" insights
      generated from session patterns (privacy-safe, computed client-side).
- [ ] **Shared focus rooms** — real-time "focus together" rooms where users can see
      each other's timers running (no chat, no noise — just presence).
- [ ] **Integrations** — Notion, Linear, Toggl export. Auto-log FocusSharp sessions
      as Toggl time entries.
- [ ] **Focus calendar view** — a GitHub-style heatmap calendar showing focus intensity
      per day over the past year.
