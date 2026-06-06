# FocusSharp — Full Tech Stack Reference

Every technology used to build FocusSharp, what it does, why we chose it, and where to learn more.
Use this as a checklist when explaining the project in interviews or conversations.

---

## Frontend

| Technology | What it does | Why we chose it |
|---|---|---|
| **Next.js 14** | React framework with App Router, SSR, file-based routing | Industry standard, Vercel-native, great SEO support |
| **TypeScript** | Typed JavaScript | Catches bugs at compile time, better DX |
| **Tailwind CSS** | Utility-first CSS framework | Fast styling, no CSS files, dark mode via class strategy |
| **Framer Motion** | Animation library for React | Smooth, physics-based animations with minimal code |
| **Recharts** | Chart library built on D3 | Simple API, React-native, used for donut + bar charts in stats |
| **Zustand** | Lightweight state management | Simpler than Redux, easy localStorage persistence via `persist` middleware |

---

## Backend & Infrastructure

| Technology | What it does | Why we chose it |
|---|---|---|
| **Supabase** | Backend-as-a-service — auth, Postgres database, RLS | Free tier, built-in auth, real-time, replaces Firebase |
| **Supabase Auth** | Email/password + Google OAuth | Built into Supabase, no extra service needed |
| **Supabase RLS** | Row-level security — users only see their own data | Database-level security, no auth checks needed in API routes |
| **Next.js API Routes** | Serverless backend endpoints | Co-located with frontend, no separate server needed |
| **Vercel** | Deployment + hosting + CDN | Zero-config Next.js deployment, free tier generous |

---

## Payments

| Technology | What it does | Why we chose it |
|---|---|---|
| **Stripe** | Payment processing — subscriptions + one-time | Industry standard, reliable, great developer API |
| **Stripe Checkout** | Hosted payment page | No PCI compliance burden, handles cards/Apple Pay/Link |
| **Stripe Webhooks** | Event notifications (payment succeeded, cancelled, refunded) | How the app knows when to grant/revoke Pro access |
| **Stripe Customer Portal** | Self-serve billing management | Users can cancel/upgrade without contacting support |

---

## Email

| Technology | What it does | Why we chose it |
|---|---|---|
| **Resend** | Transactional email API | Modern, developer-first, simple API, free tier 3k emails/month |
| **staarsolutions.ca** | Verified sending domain | Emails come from our own domain, not a shared one |

Emails sent:
- Welcome email on Pro upgrade
- Subscription ended notification
- Refund confirmation to customer
- New Pro signup notification to founder

---

## Analytics & Monitoring

| Technology | What it does | Why we chose it |
|---|---|---|
| **PostHog** | Product analytics + session replay | Open source, free tier, great for understanding user behaviour |
| **Sentry** | Error tracking + performance monitoring | Catches runtime errors in prod, free tier sufficient |
| **Vercel Analytics** | Web vitals + page views | Zero-config, built into Vercel |

---

## SEO

| Technology | What it does | Why we chose it |
|---|---|---|
| **Next.js Metadata API** | Page titles, descriptions, Open Graph tags | Built-in, no extra library needed |
| **JSON-LD** | Structured data for Google (SoftwareApplication schema) | Helps Google understand what the app is |
| **next/og** | Dynamic Open Graph image generation | Auto-generates social preview images |
| **sitemap.ts / robots.ts** | Auto-generated sitemap and robots.txt | Next.js built-in, keeps SEO in sync with routes |

---

## Developer Tooling

| Technology | What it does | Why we chose it |
|---|---|---|
| **Supabase CLI** | Database migrations, local dev | Version-controls schema changes as SQL files in git |
| **ESLint** | JavaScript/TypeScript linting | Catches code quality issues |
| **Inter font** | Primary typeface | Clean, Apple-adjacent, free via Google Fonts |

---

## Key Architecture Decisions

1. **Guest = stateless** — no data saved for unauthenticated users. Sign up to own your data.
2. **Supabase = single source of truth** — no localStorage for real data, only theme/sound prefs.
3. **Stripe webhooks = feature gating** — Pro access is granted/revoked by webhook events, not client-side.
4. **RLS everywhere** — database-level security means API routes don't need manual auth checks on reads.
5. **No backend server** — everything runs serverless via Next.js API routes on Vercel.

---

## What Each Service's Free Tier Covers

| Service | Free tier |
|---|---|
| Supabase | 500MB database, 50k MAU, 2 projects |
| Vercel | Unlimited deployments, 100GB bandwidth |
| Stripe | No monthly fee — 2.9% + $0.30 per transaction only |
| Resend | 3,000 emails/month, 1 domain |
| PostHog | 1M events/month |
| Sentry | 5k errors/month |
