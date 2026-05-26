import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — FocusSharp",
  description: "FocusSharp terms of service.",
  alternates: { canonical: "https://focussharp.app/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-[#0a0a0e] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: January 2025</p>

          <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {[
              {
                title: "1. Acceptance of terms",
                body: "By using FocusSharp (focussharp.app), you agree to these terms. If you do not agree, please do not use the service.",
              },
              {
                title: "2. Use of the service",
                body: "FocusSharp provides a focus timer and time tracking tool for personal productivity. You may use the service for lawful purposes only. You must not attempt to reverse-engineer, scrape, or abuse the service.",
              },
              {
                title: "3. Free and paid plans",
                body: "The free plan provides access to core features with limitations (3 categories, 7-day history). Paid plans are billed via Stripe. You may cancel at any time. Refunds are handled on a case-by-case basis within 7 days of purchase.",
              },
              {
                title: "4. Data and privacy",
                body: "Your focus data is stored locally in your browser. We do not access or store this data on our servers. See our Privacy Policy for full details.",
              },
              {
                title: "5. Intellectual property",
                body: "FocusSharp and its design, logo, and branding are the intellectual property of Sandeep Amarnath / STAAR Solutions. You may not reproduce, copy, or create derivative works without permission.",
              },
              {
                title: "6. Disclaimer of warranties",
                body: "FocusSharp is provided \"as is\" without any warranty of any kind. We do not guarantee uptime, accuracy, or fitness for a particular purpose.",
              },
              {
                title: "7. Limitation of liability",
                body: "To the maximum extent permitted by law, FocusSharp and its creators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
              },
              {
                title: "8. Changes to terms",
                body: "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.",
              },
              {
                title: "9. Contact",
                body: "Questions? Email hello@focussharp.app",
              },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
