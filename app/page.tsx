import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HeroTimer from "@/components/landing/HeroTimer";
import EmailCapture from "@/components/ui/EmailCapture";
import CheckoutButton from "@/components/ui/CheckoutButton";

export const metadata: Metadata = {
  title: "FocusSharp — Free Focus Timer, Flow Timer & Pomodoro App",
  description:
    "Free focus timer and flow timer app. Run timed Pomodoro sessions or open-ended flow sessions. Track deep work, study time, and focus sessions by category. No signup required.",
  alternates: { canonical: "https://focussharp.app" },
};

const FEATURES = [
  {
    icon: "⏱",
    title: "Focus Timer",
    desc: "Set a target duration — 25, 40, 60, 90 min — or start a Flow session and focus until you're done. No pressure, no timer ringing at you.",
  },
  {
    icon: "🏷",
    title: "Category Tracking",
    desc: "Tag every session — Deep Work, Reading, Admin, Exercise. See exactly where your time goes.",
  },
  {
    icon: "☕",
    title: "Smart Breaks",
    desc: "Choose a timed break (5/10/15 min), an open break with no timer, or skip straight to the next session.",
  },
  {
    icon: "📊",
    title: "Beautiful Stats",
    desc: "Donut charts, bar charts, category breakdowns. Today, this week, last 30 days — always in context.",
  },
  {
    icon: "🌙",
    title: "Dark Mode",
    desc: "Gorgeous light and dark themes that follow your system, or lock to your preference.",
  },
  {
    icon: "☁️",
    title: "Your Data, Your Way",
    desc: "Try the timer instantly — no account needed. Sign up free to save your sessions, customize categories, and access your history on any device.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally a focus timer that gets out of the way. No badges, no streaks — just clean tracking.",
    name: "Alex M.",
    role: "Software Engineer",
  },
  {
    quote: "I use it for studying. The category breakdown shows me how much time I actually spend on each subject.",
    name: "Priya S.",
    role: "Medical Student",
  },
  {
    quote: "Replaced my Pomodoro app with this. The break flow is brilliant — I love the open break option.",
    name: "Jordan K.",
    role: "Freelance Designer",
  },
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FocusSharp",
    applicationCategory: "ProductivityApplication",
    applicationSubCategory: "Time Management",
    operatingSystem: "Web, iOS (coming soon), macOS (coming soon)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "FocusSharp is a free focus timer and flow timer app for deep work, studying, and flow states. Run Pomodoro sessions or open-ended flow sessions. Track time by category.",
    url: "https://focussharp.app",
    featureList: [
      "Focus timer with Pomodoro and timed session modes",
      "Flow timer — open-ended count-up mode for deep work",
      "Focus flow timer combining structured and open sessions",
      "Deep work analytics and category time tracking",
      "Category tracking for deep work, study sessions, and more",
      "Smart breaks — timed, open, or skip",
      "Session history and stats with charts",
      "No account required — works instantly in the browser",
    ],
    author: {
      "@type": "Person",
      name: "Sandeep Amarnath",
      url: "https://staarsolutions.ca",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-white dark:bg-[#0a0a0e] pt-16 pb-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Free to use · No signup to try
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5">
                  Focus timer &amp; flow timer
                  <br />
                  <span className="text-indigo-600 dark:text-indigo-400">
                    built for deep work.
                  </span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Run a Pomodoro session, a timed focus block, or an open-ended flow session — no pressure, no rings at you. Track every session by category and see where your focus actually goes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link
                    href="/app"
                    className="btn-primary text-base px-6 py-3.5 text-center"
                  >
                    Start focusing — it&apos;s free
                  </Link>
                  <Link
                    href="/pricing"
                    className="btn-secondary text-base px-6 py-3.5 text-center"
                  >
                    See Pro plans
                  </Link>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-gray-400 dark:text-gray-400">
                    Try it instantly · Sign up free to save your sessions
                  </p>
                  <p className="text-sm">
                    <Link href="/app?auth=signup" className="text-indigo-500 dark:text-indigo-400 hover:underline font-medium">
                      Create a free account to track your focus →
                    </Link>
                  </p>
                </div>
              </div>
              {/* Live timer demo */}
              <div className="flex justify-center">
                <div className="card p-8 w-full max-w-xs shadow-lg">
                  <HeroTimer />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AD_SLOT: replace with AdSense code when approved (below-fold, free users only) */}

        {/* Keywords for SEO */}
        <section className="bg-gray-50 dark:bg-[#0d0d12] border-y border-gray-100 dark:border-gray-800 py-4 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Pomodoro Timer",
                "Study Timer",
                "Deep Work Timer",
                "Flow Timer",
                "Open Timer",
                "Stopwatch",
                "Focus App",
                "Time Tracker",
                "Category Time Tracking",
                "No Signup Timer",
              ].map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-500 dark:text-gray-400"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-white dark:bg-[#0a0a0e]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight mb-3">
                Everything you need to track focus
              </h2>
              <p className="text-gray-500 dark:text-gray-300 max-w-xl mx-auto">
                No clutter, no streaks, no badges. Just a beautifully minimal
                timer and the data to understand how you spend your focus time.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="card-hover p-6"
                >
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-base text-gray-500 dark:text-gray-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Focus Flow Timer explainer — targets "focus flow timer", "flowtime vs pomodoro", "deep work analytics" */}
        <section className="py-20 px-4 bg-white dark:bg-[#0a0a0e]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight mb-3">
                Pomodoro timer vs. flow timer — pick what fits your session
              </h2>
              <p className="text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
                Not every focus session fits a 25-minute box. FocusSharp gives you both modes — a classic timed focus timer for structured work, and an open-ended flow timer for when you just need to go deep.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="card p-6">
                <div className="text-2xl mb-3">⏱</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                  Focus timer (Pomodoro mode)
                </h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
                  Set a target — 25, 40, 60, or 90 minutes — and a circular ring counts down. Great for tasks where time-boxing keeps you accountable. The classic Pomodoro technique, without the clutter.
                </p>
              </div>
              <div className="card p-6">
                <div className="text-2xl mb-3">∞</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                  Flow timer (open-ended mode)
                </h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
                  Don&apos;t know how long you&apos;ll go? Start a flow session and focus until you&apos;re done. The timer counts up. Stop when you surface. Your full session is logged automatically.
                </p>
              </div>
            </div>
            <div className="card p-8 bg-gray-50 dark:bg-[#0d0d12]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg text-center">
                Deep work analytics — see where your focus actually goes
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed text-center max-w-2xl mx-auto mb-6">
                Every session is tagged to a category — Deep Work, Study, Writing, Admin, whatever fits your life. At the end of the day you get a real breakdown: how many hours of focused work, split by category, shown as charts. Not streaks. Not badges. Actual data.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                {[
                  { stat: "Today", desc: "Total focus time vs your goal" },
                  { stat: "7 days", desc: "Daily focus pattern and streaks" },
                  { stat: "30 days", desc: "Category breakdown over time" },
                ].map((s) => (
                  <div key={s.stat} className="card p-4 bg-white dark:bg-[#0a0a0e]">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{s.stat}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Break flow highlight */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-[#0d0d12]">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="label-sm mb-3">Key differentiator</div>
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-4">
                  Built for how you
                  <br />
                  <span className="text-indigo-600 dark:text-indigo-400">
                    actually focus
                  </span>
                </h2>
                <p className="text-gray-500 dark:text-gray-300 leading-relaxed mb-6">
                  Most timers force you into rigid cycles. FocusSharp gives you
                  control — before the session and after it.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "∞", title: "Flow Session", desc: "Don't know how long you'll focus? Just start. The ring fills as you go. Stop when you're done." },
                    { icon: "☕", title: "Open break", desc: "No break timer. Come back when you're ready. No guilt." },
                    { icon: "⚡", title: "Skip break", desc: "In the zone? Jump straight into the next session." },
                  ].map((b) => (
                    <div key={b.title} className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{b.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-base">
                          {b.title}
                        </p>
                        <p className="text-base text-gray-500 dark:text-gray-300">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6 space-y-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Duration
                </p>
                <div className="flex gap-2 flex-wrap">
                  {["25m", "40m", "60m", "90m"].map((t) => (
                    <div
                      key={t}
                      className={`chip text-center ${t === "40m" ? "chip-active" : ""}`}
                    >
                      {t}
                    </div>
                  ))}
                  <div className="chip text-center">Open</div>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-1">
                  After session
                </p>
                <div className="flex gap-2">
                  {["5m", "10m", "15m"].map((t) => (
                    <div
                      key={t}
                      className={`chip text-center ${t === "10m" ? "chip-active" : ""}`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div className="card p-3 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Open break
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    I&apos;ll decide when I&apos;m back
                  </p>
                </div>
                <button className="btn-secondary w-full text-sm py-2">
                  Skip break
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="py-20 px-4 bg-white dark:bg-[#0a0a0e]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-gray-500 dark:text-gray-300 mb-8">
              Start free. Upgrade when you&apos;re ready for more.
            </p>
            <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                {
                  name: "Free",
                  price: "$0",
                  features: ["Try timer instantly", "Free account to save sessions", "3 categories", "7-day history"],
                  cta: "Get started",
                  plan: "free" as const,
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "$2.99",
                  sub: "/month",
                  annual: "or $19.99/year",
                  features: ["Unlimited categories", "Full history", "Cloud sync", "Native apps (coming soon)"],
                  cta: "Get Pro",
                  plan: "monthly" as const,
                  highlight: true,
                },
                {
                  name: "Lifetime",
                  price: "$49",
                  sub: "one-time",
                  badge: "Early Bird",
                  features: ["Everything in Pro", "All future platforms", "Pay once, own forever"],
                  cta: "Get lifetime access",
                  plan: "lifetime" as const,
                  highlight: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`card p-6 text-left relative ${
                    plan.highlight
                      ? "ring-2 ring-indigo-500 dark:ring-indigo-400"
                      : ""
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                      Most popular
                    </div>
                  )}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                      {plan.badge}
                    </div>
                  )}
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.sub && (
                      <span className="text-sm text-gray-400">{plan.sub}</span>
                    )}
                  </div>
                  {"annual" in plan && plan.annual && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                      {plan.annual}
                    </p>
                  )}
                  <ul className="space-y-1.5 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton
                    plan={plan.plan}
                    className={plan.highlight ? "btn-primary w-full text-sm text-center block" : "btn-secondary w-full text-sm text-center block"}
                  >
                    {plan.cta}
                  </CheckoutButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — targets featured snippets for "flowtime vs pomodoro", "focus flow timer", "what is a flow timer" */}
        <section className="py-20 px-4 bg-white dark:bg-[#0a0a0e]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight text-center mb-10">
              Frequently asked questions
            </h2>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What is a focus flow timer?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "A focus flow timer is an open-ended countdown timer that counts up instead of down. Instead of setting a fixed duration, you start the timer and work until you naturally surface. It is based on the Flowtime technique — a flexible alternative to Pomodoro that adapts to how long your focus naturally lasts.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What is the difference between Flowtime and Pomodoro?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Pomodoro sets a fixed 25-minute focus block followed by a 5-minute break, repeated in cycles. Flowtime (also called flow timer) lets you work for as long as you are in flow and take breaks proportional to how long you worked. Pomodoro is great for time-boxing tasks. Flowtime is better for deep work that needs uninterrupted concentration.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is FocusSharp free to use?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. FocusSharp is free to use with no account required. You can run focus timer and flow timer sessions instantly. A free account lets you save your session history. Pro plans unlock unlimited categories, full history, and cloud sync.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How does FocusSharp track deep work?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Every focus session in FocusSharp is tagged to a category you define — for example Deep Work, Study, Writing, or Admin. At the end of the day you see a breakdown of total focused time by category, shown as charts. This gives you real deep work analytics rather than just a count of sessions.",
                      },
                    },
                  ],
                }),
              }}
            />
            <div className="space-y-4">
              {[
                {
                  q: "What is a focus flow timer?",
                  a: "A focus flow timer counts up instead of down. You start it and work until you naturally surface — no alarm, no pressure. It is based on the Flowtime technique, a flexible alternative to Pomodoro that adapts to your natural concentration span.",
                },
                {
                  q: "Flowtime vs Pomodoro — which is better?",
                  a: "Pomodoro works well for time-boxing tasks into fixed 25-minute blocks. Flowtime (open-ended flow timer) is better for deep work that requires long, uninterrupted concentration — writing, coding, studying. FocusSharp supports both: pick a duration for Pomodoro-style sessions, or tap Flow to start an open-ended session.",
                },
                {
                  q: "Is FocusSharp free?",
                  a: "Yes. No account needed to try it — open the app and start focusing. Sign up free to save your sessions across devices. Pro adds unlimited categories and full history.",
                },
                {
                  q: "How does FocusSharp track deep work?",
                  a: "Every session gets tagged to a category — Deep Work, Study, Writing, Admin, whatever fits you. Your stats page shows a chart of focus time by category for today, this week, and the last 30 days. Real data, not streaks.",
                },
              ].map((faq) => (
                <details key={faq.q} className="card p-5 group">
                  <summary className="font-medium text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
                  </summary>
                  <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed mt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-[#0d0d12]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight text-center mb-10">
              What people are saying
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="card p-6">
                  <div className="text-amber-400 text-sm mb-3">★★★★★</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {t.name}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Study timer section — targets "study timer", "study timer for students", "study timer with breaks" */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-[#0d0d12]">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="label-sm mb-3">For students</div>
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-4">
                  Study timer that tracks
                  <br />
                  <span className="text-indigo-600 dark:text-indigo-400">every subject separately</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-300 leading-relaxed mb-6">
                  Tag each study session by subject — Maths, Physics, Essay Writing, Revision. After a week you&apos;ll see exactly which subjects you&apos;re neglecting and which ones are getting too much time. Most students are surprised by what the data shows.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "📚", title: "Study by subject", desc: "Tag sessions to any subject. See your breakdown by day, week, and month." },
                    { icon: "⏸", title: "Flexible study breaks", desc: "Take a timed break, an open break with no countdown, or skip and keep going." },
                    { icon: "📊", title: "See your real study hours", desc: "Not session count — actual focused hours, broken down by what you studied." },
                  ].map((b) => (
                    <div key={b.title} className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{b.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-base">{b.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <a href="/app" className="btn-primary inline-block text-sm px-5 py-2.5">
                    Start studying — free
                  </a>
                </div>
              </div>
              <div className="card p-6 space-y-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Today&apos;s study sessions</p>
                {[
                  { subject: "Mathematics", duration: "1h 20m", color: "bg-indigo-500" },
                  { subject: "Physics", duration: "45m", color: "bg-violet-500" },
                  { subject: "Essay Writing", duration: "55m", color: "bg-emerald-500" },
                ].map((s) => (
                  <div key={s.subject} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color} flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{s.subject}</span>
                        <span className="text-xs text-gray-400">{s.duration}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full`}
                          style={{ width: s.subject === "Mathematics" ? "80%" : s.subject === "Physics" ? "45%" : "55%" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-1">Total: 3h 00m focused study today</p>
              </div>
            </div>
          </div>
        </section>

        {/* Native app coming soon */}
        <section className="py-20 px-4 bg-white dark:bg-[#0a0a0e]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <span>📱</span>
              Native apps coming soon
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight mb-4">
              FocusSharp. Everywhere you focus.
            </h2>
            <p className="text-gray-500 dark:text-gray-300 max-w-xl mx-auto mb-10">
              The web app is live now. Native apps are in development —
              same minimal design, built for the devices you already use.
            </p>
            <div className="grid sm:grid-cols-3 gap-5 max-w-2xl mx-auto mb-10">
              {[
                { icon: "📱", platform: "iPhone", desc: "Full-featured focus timer with haptics and lock screen widget." },
                { icon: "⌚", platform: "Apple Watch", desc: "Glanceable timer on your wrist. Start and stop sessions from your watch." },
                { icon: "💻", platform: "Mac", desc: "Always visible in your menu bar while you work." },
              ].map((p) => (
                <div key={p.platform} className="card p-5 text-center">
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {p.platform}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Email waitlist */}
            <div className="card p-6 max-w-md mx-auto">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Get notified at launch
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                Be first to know when the native apps are ready.
              </p>
              <EmailCapture source="landing" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-indigo-600 dark:bg-indigo-700">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-3">
              Start your first focus session
            </h2>
            <p className="text-indigo-200 mb-8">
              No signup to try. Sign up free to save your sessions and track your progress.
            </p>
            <Link
              href="/app"
              className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-base"
            >
              Open FocusSharp — free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
