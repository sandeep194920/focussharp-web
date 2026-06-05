import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://focussharp.app";
  const now = new Date();

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/app`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts,
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
