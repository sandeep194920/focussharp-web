import { notFound } from "next/navigation";
import { getAllPosts, getPostContent } from "@/lib/blog";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostContent(params.slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: `https://focussharp.app/blog/${params.slug}` },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      url: `https://focussharp.app/blog/${params.slug}`,
      images: [
        {
          url: `/og?title=${encodeURIComponent(post.meta.title)}&subtitle=${encodeURIComponent(post.meta.description)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostContent(params.slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    dateModified: post.meta.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://focussharp.app/blog/${params.slug}`,
    },
    image: `https://focussharp.app/og?title=${encodeURIComponent(post.meta.title)}&subtitle=${encodeURIComponent(post.meta.description)}`,
    author: {
      "@type": "Person",
      name: "Sandeep Amarnath",
      url: "https://staarsolutions.ca",
    },
    publisher: {
      "@type": "Organization",
      name: "FocusSharp",
      url: "https://focussharp.app",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="max-w-2xl mx-auto px-4 py-12">
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.meta.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            {post.meta.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {new Date(post.meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {post.meta.readingTime}
          </p>
        </header>
        <div className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={post.content} />
        </div>
        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Try the app these articles are written about —
          </p>
          <a
            href="/app"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            Start a focus session →
          </a>
        </footer>
      </article>
    </>
  );
}
