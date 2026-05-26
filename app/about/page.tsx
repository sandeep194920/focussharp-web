import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "About — FocusSharp",
  description:
    "Learn about FocusSharp — a minimal focus timer built by Sandeep Amarnath to track deep work and study sessions with clarity.",
  alternates: { canonical: "https://focussharp.app/about" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-[#0a0a0e] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-16">
          {/* Hero */}
          <div className="mb-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-2xl font-bold">F</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-3">
              About FocusSharp
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              A focus timer built for people who want clean data about where
              their time actually goes — without the noise.
            </p>
          </div>

          {/* Story */}
          <div className="prose dark:prose-invert prose-gray max-w-none mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              The story
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              I built FocusSharp because every focus app I tried had too much
              going on. Streaks, badges, gamification, complex setups. I wanted
              something that felt like a premium watch — precise, minimal, and
              out of the way.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              The key question I kept asking: what would this look like as an
              Apple Watch app? That design constraint became the product
              philosophy. If it doesn&apos;t fit on a watch face, it&apos;s probably
              clutter.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              FocusSharp is the web precursor to native iOS, watchOS, and macOS
              apps coming soon. The web app is fully functional today and your
              data will sync across devices when the native apps launch.
            </p>
          </div>

          {/* Principles */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Design principles
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: "✦", title: "No gamification", desc: "No streaks. No badges. No leaderboards. Just data." },
                { icon: "✦", title: "Respect your attention", desc: "Never interrupt an active session. Ever." },
                { icon: "✦", title: "Private by default", desc: "Data lives in your browser. No account required." },
                { icon: "✦", title: "Apple-grade design", desc: "Built to the standard of what this will be on native platforms." },
              ].map((p) => (
                <div key={p.title} className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-indigo-500 mt-0.5">{p.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {p.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creator */}
          <div className="card p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">SA</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Sandeep Amarnath
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Designer & Developer
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Building FocusSharp along with the upcoming native Swift/SwiftUI apps
                  for iOS, watchOS, and macOS.
                </p>
                <a
                  href="https://staarsolutions.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  staarsolutions.ca →
                </a>
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Built with
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 14",
                "TypeScript",
                "Tailwind CSS",
                "Zustand",
                "Framer Motion",
                "Recharts",
                "Vercel",
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Easter egg — subtle */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-300 dark:text-gray-700 select-none">
              ✦ Built with FocusSharp — tracked: 847 hours of deep work ✦
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
