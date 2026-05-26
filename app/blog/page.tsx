import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import EmailCapture from "@/components/ui/EmailCapture";

export const metadata: Metadata = {
  title: "Blog — FocusSharp",
  description:
    "Tips on deep work, focus techniques, time tracking, and productivity — from the FocusSharp team.",
  alternates: { canonical: "https://focussharp.app/blog" },
};

// Scaffold: future blog posts will be pulled from MDX or a CMS
const COMING_SOON_POSTS = [
  {
    title: "Why the Pomodoro Technique Fails for Deep Work",
    tags: ["Deep Work", "Productivity"],
    eta: "Coming soon",
  },
  {
    title: "How to Use Category Tracking to Find Your Peak Hours",
    tags: ["Time Tracking", "Focus"],
    eta: "Coming soon",
  },
  {
    title: "Flow State vs Pomodoro: Which One Is Right for You?",
    tags: ["Flow", "Focus Techniques"],
    eta: "Coming soon",
  },
  {
    title: "The Science Behind the Open Break",
    tags: ["Breaks", "Neuroscience"],
    eta: "Coming soon",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-[#0a0a0e] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
            Blog
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10">
            Deep work, focus techniques, and time tracking insights.
          </p>

          <div className="flex flex-col gap-4">
            {COMING_SOON_POSTS.map((post) => (
              <div
                key={post.title}
                className="card p-5 flex items-start justify-between gap-4 opacity-60"
              >
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {post.title}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                  {post.eta}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 card p-6 text-center bg-gray-50 dark:bg-gray-900/50">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Get notified when we publish
            </p>
            <p className="text-sm text-gray-400 mb-4">
              We&apos;re writing about focus, flow, and time tracking. No fluff.
            </p>
            <div className="max-w-sm mx-auto">
              <EmailCapture buttonLabel="Subscribe" note="" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
