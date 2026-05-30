import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Pricing — FocusSharp",
  description:
    "Simple pricing for FocusSharp. Free forever, or upgrade to Pro for unlimited categories, full history, and all future platforms.",
  alternates: { canonical: "https://focussharp.app/pricing" },
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Everything you need to get started.",
    features: [
      { text: "3 categories", included: true },
      { text: "7-day session history", included: true },
      { text: "Focus timer (5–120 min)", included: true },
      { text: "Break flow (timed, open, skip)", included: true },
      { text: "Stats dashboard", included: true },
      { text: "Dark mode", included: true },
      { text: "Optional account to sync across devices", included: true },
      { text: "Unlimited categories", included: false },
      { text: "Full session history", included: false },
      { text: "Native apps (coming soon)", included: false },
    ],
    cta: "Start for free",
    ctaHref: "/app",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$2.99",
    priceSub: "/month",
    annualNote: "or $19.99/year — save 44%",
    description: "For anyone who wants the full picture.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited categories", included: true },
      { text: "Full session history (no expiry)", included: true },
      { text: "Cloud sync across all your devices", included: true },
      { text: "Native apps when they launch (iOS, Watch, Mac)", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Pro",
    ctaHref: "#stripe-checkout-monthly", // Stripe placeholder
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Lifetime",
    price: "$49",
    priceSub: "one-time",
    description: "Pay once, own it forever — every platform, every future update.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "All future platforms (iOS, Watch, Mac)", included: true },
      { text: "Lifetime updates at no extra cost", included: true },
      { text: "Priority support forever", included: true },
    ],
    cta: "Get lifetime access",
    ctaHref: "#stripe-checkout-lifetime", // Stripe placeholder
    highlight: false,
    badge: "🐦 Early Bird — price goes up at 200 users",
  },
];

const FAQ = [
  {
    q: "Do I need an account to use FocusSharp?",
    a: "No. You can use the app right now without signing up — your data is saved in your browser's local storage. Just know that if you clear your browser cache or switch devices, that data won't follow you. Create a free account to back it up to the cloud.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancelling stops your subscription from renewing, and you keep Pro access until the end of your current billing period. Monthly plans are billed month-to-month, so there's little to lose trying. Annual plans are billed for the full year upfront and are not refunded if cancelled mid-year, so they're best if you're already sure.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is never deleted. If you downgrade from Pro to Free, you'll still see your last 7 days of history, and all older sessions are preserved — they'll come back if you re-upgrade.",
  },
  {
    q: "Does the Lifetime plan include the native apps?",
    a: "Yes. One payment unlocks FocusSharp on web now, and gives you access to the iOS, Apple Watch, and Mac apps when they launch — at no extra cost.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We use Stripe for secure payments. We accept all major credit and debit cards, Apple Pay, and Google Pay.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-[#0a0a0e] min-h-screen">
        {/* Header */}
        <section className="pt-16 pb-12 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no dark patterns.
          </p>
        </section>

        {/* Plans */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`card p-6 flex flex-col relative ${
                    plan.highlight
                      ? "ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-xl"
                      : ""
                  }`}
                >
                  {plan.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
                        plan.highlight
                          ? "bg-indigo-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.priceSub && (
                        <span className="text-gray-400 text-sm">{plan.priceSub}</span>
                      )}
                    </div>
                    {"annualNote" in plan && plan.annualNote && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                        {plan.annualNote}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`mt-0.5 flex-shrink-0 ${
                            f.included
                              ? "text-emerald-500"
                              : "text-gray-300 dark:text-gray-700"
                          }`}
                        >
                          {f.included ? "✓" : "✗"}
                        </span>
                        <span
                          className={
                            f.included
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-400 dark:text-gray-600"
                          }
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaHref}
                    className={`w-full text-center text-sm py-3 ${
                      plan.highlight ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Stripe integration note */}
                  {plan.ctaHref.startsWith("#stripe") && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-2">
                      Powered by Stripe · Secure checkout
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Annual toggle note */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm">
                <span>💡</span>
                Annual Pro plan: <strong>$19.99/year</strong> — save $15.89 vs monthly
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-[#0d0d12]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {FAQ.map((item) => (
                <div key={item.q} className="py-5">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    {item.q}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stripe setup note for developers */}
        {/*
          STRIPE INTEGRATION TODO:
          1. Install: npm install stripe @stripe/stripe-js
          2. Add to .env.local: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
          3. Create products in Stripe Dashboard:
             - Monthly Pro: $2.99/month (recurring)
             - Annual Pro: $19.99/year (recurring)
             - Lifetime: $49 (one-time)
          4. Create /api/checkout/route.ts to create Stripe Checkout sessions
          5. Create /api/webhooks/stripe/route.ts for subscription events
          6. Replace #stripe-checkout-* hrefs with actual checkout flow
        */}
      </main>
      <Footer />
    </>
  );
}
