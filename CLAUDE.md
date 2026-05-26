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
