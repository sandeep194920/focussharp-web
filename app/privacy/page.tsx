import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — FocusSharp",
  description: "FocusSharp privacy policy. Your focus data stays in your browser.",
  alternates: { canonical: "https://focussharp.app/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-[#0a0a0e] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: January 2025</p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Overview</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                FocusSharp is designed with privacy as a default. Your focus sessions, categories,
                and stats are stored locally in your browser using localStorage. We do not collect,
                transmit, or store your focus data on any server.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data we collect</h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span><strong className="text-gray-800 dark:text-gray-200">Analytics:</strong> Anonymous page view data via Vercel Analytics (no personal identifiers).</span></li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span><strong className="text-gray-800 dark:text-gray-200">Email (optional):</strong> If you join our waitlist or newsletter, we collect your email address only.</span></li>
                <li className="flex gap-2"><span className="text-red-400 mt-0.5">✗</span><span>We do NOT collect your focus sessions, category names, or usage patterns.</span></li>
                <li className="flex gap-2"><span className="text-red-400 mt-0.5">✗</span><span>We do NOT use advertising trackers on the app itself.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Local storage</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                All app data (categories, sessions, settings) is stored exclusively in your
                browser&apos;s localStorage under the key &ldquo;focussharp-storage&rdquo;. Clearing your browser
                data will delete this. We have no copy of it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Google AdSense (Free tier)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                The free tier of FocusSharp may display ads served by Google AdSense on non-timer
                pages. Google AdSense may use cookies and tracking pixels as described in Google&apos;s
                Privacy Policy. Ads are never shown during an active timer session. Pro users see
                no ads.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payments</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Payments are processed securely by Stripe. We do not store your payment card
                details. Stripe&apos;s privacy policy applies to payment processing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions about this policy? Reach us at{" "}
                <a href="mailto:hello@focussharp.app" className="text-indigo-500 hover:underline">
                  hello@focussharp.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
