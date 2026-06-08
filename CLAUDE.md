# FocusSharp — CLAUDE.md

## Project overview

FocusSharp (focussharp.app) is a minimal focus timer and time tracking web app. It is the web
precursor to a native iOS/watchOS/macOS app being built in Swift/SwiftUI.

**Design philosophy:** Apple-ecosystem feel — clean, minimal, lots of white space. Think
"what would this look like as an Apple Watch app?" That is the design bar. No gamification,
no streaks, no badges.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark mode via `.dark` class) |
| State | Zustand with localStorage persistence |
| Animation | Framer Motion |
| Charts | Recharts |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

## Project structure

```
app/
  layout.tsx          # Root layout — Inter font, dark mode script, Vercel Analytics
  page.tsx            # Landing page (/) — SEO-optimised, JSON-LD
  sitemap.ts          # Auto sitemap for SEO
  robots.ts           # robots.txt
  app/
    layout.tsx        # App shell — sticky header + bottom nav
    page.tsx          # Timer page (/app) — circular ring, category picker, break flow
    stats/page.tsx    # Stats (/app/stats) — donut chart, bar chart, breakdowns
    categories/page.tsx # Categories (/app/categories) — CRUD, color picker
  pricing/page.tsx    # Pricing page — Free/Pro/Lifetime, FAQ, Stripe placeholders
  about/page.tsx      # About — story, principles, creator credit, easter egg
  blog/page.tsx       # Blog scaffold — coming soon posts, email subscribe
  privacy/page.tsx    # Privacy policy
  terms/page.tsx      # Terms of service
components/
  ui/
    Navbar.tsx        # Marketing navbar (used on landing/pricing/about/blog)
    Footer.tsx        # Marketing footer — "Designed & Developed by Sandeep Amarnath"
    ThemeToggle.tsx   # Light/dark toggle
  timer/
    CircularProgress.tsx  # SVG circular countdown ring
  landing/
    HeroTimer.tsx     # Interactive live timer demo on the landing page
lib/
  store.ts            # Zustand store — all app state, timer logic, persistence
  utils.ts            # Pure helpers — formatTime, aggregateByCategory, aggregateByDay, etc.
```

## Timer behaviour (implemented)

- **Timed sessions** — 25/40/60/90 min quick chips + slider (5–120 min). Circular ring counts down.
- **Flow session** — `durationMins = 0` triggers count-up mode. Ring fills slowly (capped visually at 120 min).
- **Minimum session length** — sessions under 1 minute are never logged (filtered in `endSessionEarly` and `endOpenSession`).
- **End Session flow** — under 1 min: shows amber warning ("won't be counted") with Keep going / End anyway. Over 1 min: ends and logs immediately, no confirmation needed.
- **Category resets after each session** — `activeCatId` is cleared in `endBreak` and `skipBreak` so the user must deliberately pick for the next session.
- **Stats default** — opens on "Today" view, not 7-day.

## Key design decisions

- **Dark mode** uses Tailwind's `class` strategy. A blocking `<script>` in the root layout
  reads localStorage before hydration to prevent FOUC.
- **Timer tick** runs via `setInterval` inside the `/app` page component. The store exposes
  `tickTimer()` and `tickBreak()` which the component calls every second.
- **Session logging** happens automatically: on natural completion (`tickTimer` drains to 0),
  on early end (`endSessionEarly`), and on break transitions.
- **Free tier limits** are enforced in the store (`FREE_CATEGORY_LIMIT = 3`,
  `FREE_HISTORY_DAYS = 7`). The `isPro` flag in the store gates features; Pro billing is
  wired via Stripe (see `.env.local.example`).
- **Ad slots** are marked with `// AD_SLOT:` comments in layout/stats. Ads never show
  during an active timer. Pro users never see ads.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_LIFETIME`
- `NEXT_PUBLIC_GA_ID` (optional)
- `NEXT_PUBLIC_ADSENSE_ID` (optional)
- `NEXT_PUBLIC_APP_URL`

## Running locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

## Deployment

Deploy to Vercel. Set env vars in the Vercel project dashboard. `vercel.json` handles security
headers. `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
automatically via Next.js.

## SEO targets

The app targets: `focus timer`, `pomodoro timer`, `study timer app`, `deep work timer`,
`flow timer`, `time tracking by category`, `focus app for students`, `pomodoro app no signup`.
JSON-LD `SoftwareApplication` schema is injected on the landing page.

## Future native apps

iOS, watchOS, and macOS apps are planned in Swift/SwiftUI. The web app is designed to
mirror what those native apps will look like. An email waitlist capture is on the landing
page for native app launch notifications.

## Future work

See [TODOS.md](./TODOS.md) for a prioritised backlog of features and improvements.

---

## Documentation philosophy

All learning docs live in `docs/learning/`. These are not just notes — they are a personal
knowledge base Sandeep builds as he learns. Every doc should feel like a senior developer
sitting next to you and explaining something from scratch, not a textbook.

### Who we write for
Sandeep is an experienced developer but newer to this specific stack (Supabase, Next.js App
Router, Stripe, OAuth). He wants to deeply understand WHY things work, not just HOW to use
them. He will re-read these docs later, in interviews, and when building future apps.

### Writing style — ELI10 (Explain Like I'm 10)
- Use plain English first. Introduce the technical term after the concept is clear.
- Use analogies before code. Wristband at a concert, backstage pass, hotel key card — these
  land before JWT ever does.
- Never assume the reader knows what something is. Define it in one sentence before using it.
- Short sentences. No filler words. No "it is worth noting that".
- When something is genuinely uncertain or unknown, say so honestly. Don't fake confidence.

### What goes where
- **`docs/learning/`** — deep-dive explanations of concepts and systems. Full flow,
  ELI10, diagrams, why things work the way they do. Written AFTER a feature is built.
  One topic per file.
- **`docs/learning/engineering-challenges.md`** — real bugs and hard problems encountered
  while building. What happened, why it was tricky, what was considered, what was chosen.
  Written for interview preparation.
- **`docs/learning/README.md`** — index of all learning docs. One line per doc. Always
  kept up to date when a new doc is added.
- **`TODOS.md`** — prioritised feature backlog. Not a learning doc.
- **`CLAUDE.md`** (this file) — instructions for Claude. Project context, conventions,
  documentation philosophy. Updated when a new working convention is established.

### What a good learning doc contains
1. **The big picture first** — one paragraph on what this doc explains and why it matters
2. **Plain English explanation** — no code yet, just concepts and analogies
3. **ASCII diagrams** — use these liberally to show flows, relationships, before/after states
4. **Code** — only after the concept is clear. Annotated with comments explaining the why.
5. **The full flow** — step by step, from user action to server response and back
6. **Rules / takeaways** — what to always do in future projects based on this learning
7. **Honest uncertainties** — if something is unclear or unverified, say so explicitly

### What a good learning doc does NOT contain
- The specific bug story from this project — that goes in engineering-challenges.md
- Marketing language or oversimplification that sacrifices accuracy
- "It is important to note that" or any similar filler
- Assumed knowledge without a one-line definition first

### Diagrams
Use ASCII diagrams for:
- Before/after states of a bug fix
- Data flow between systems (browser, cookie, Zustand store, Supabase server)
- Step-by-step sequences (sign in flow, token refresh flow)

Keep diagrams wide enough to be readable but don't overengineer them. A clear rough diagram
beats a precise one that takes 10 minutes to parse.

### When to write a learning doc
After every meaningful new concept is introduced during a build session. If Sandeep asks
"wait how does X work?" or "I didn't understand that" — that's the signal to write a doc.
Don't wait until the end of the project. Write it while the context is fresh.
