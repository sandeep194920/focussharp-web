import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-[#0a0a0e] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <Link
            href="/blog"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ← All posts
          </Link>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
