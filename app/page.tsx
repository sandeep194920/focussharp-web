import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HeroTimer from "@/components/landing/HeroTimer";
import EmailCapture from "@/components/ui/EmailCapture";

export const metadata: Metadata = {
  title: "FocusSharp — Focus Timer, Pomodoro & Deep Work Tracker",
  description:
    "Free focus timer and time tracking app. Set a target duration or go open — focus until you're done. Track deep work, study sessions, and flow states by category. No signup required.",
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
    desc: "Use it without an account — data stays in your browser. Sign up free to back it up to the cloud and access it on any device.",
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
    operatingSystem: "Web, iOS (coming soon), macOS (coming soon)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "FocusSharp is a minimal focus timer and time tracking app for deep work, studying, and flow states.",
    url: "https://focussharp.app",
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
                  Free to use · No signup required
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5">
                  The focus timer
                  <br />
                  <span className="text-indigo-600 dark:text-indigo-400">
                    built for flow.
                  </span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  Track deep work, study sessions, and flow states by category.
                  Clean. Minimal. No gamification — just pure focus data.
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
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
                  No account required · Data stays in your browser · Sign up free to sync across devices
                </p>
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
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
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
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
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
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {b.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Start free. Upgrade when you&apos;re ready for more.
            </p>
            <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                {
                  name: "Free",
                  price: "$0",
                  features: ["3 categories", "7-day history", "Web app", "Optional account to sync"],
                  cta: "Get started",
                  href: "/app",
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "$2.99",
                  sub: "/month",
                  annual: "or $19.99/year",
                  features: ["Unlimited categories", "Full history", "Cloud sync", "Native apps (coming soon)"],
                  cta: "Get Pro",
                  href: "/pricing",
                  highlight: true,
                },
                {
                  name: "Lifetime",
                  price: "$49",
                  sub: "one-time",
                  badge: "Early Bird",
                  features: ["Everything in Pro", "All future platforms", "Pay once, own forever"],
                  cta: "Get lifetime access",
                  href: "/pricing",
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
                  <Link
                    href={plan.href}
                    className={plan.highlight ? "btn-primary w-full text-sm text-center block" : "btn-secondary w-full text-sm text-center block"}
                  >
                    {plan.cta}
                  </Link>
                </div>
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
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              ))}
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
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Be first to know when the native apps are ready.
              </p>
              <EmailCapture />
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
              No signup. No setup. Just open the app and start.
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
