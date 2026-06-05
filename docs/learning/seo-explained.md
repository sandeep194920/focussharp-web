# SEO Explained — For FocusSharp

A plain-English guide to every SEO thing in this project. Written for someone who has never touched SEO.

---

## What is SEO and why does it matter?

SEO stands for Search Engine Optimisation. It's the practice of making your website show up higher in Google's search results when people search for things related to what you do.

When someone types "focus timer" into Google, Google shows a ranked list of results. The higher you rank, the more people click your link. Most people never go past the first page. Nobody goes past the third.

Google decides rankings based on hundreds of factors, but the three biggest are:

1. **Content** — does your page actually answer what the person is searching for?
2. **Technical quality** — is your site fast, mobile-friendly, and correctly structured?
3. **Authority** — do other reputable websites link to you?

FocusSharp's technical quality is already good. Authority takes time (other sites need to discover you). Content is the gap — that's why we're writing blog posts.

---

## sitemap.xml — The map you hand to Google

**File:** `app/sitemap.ts`  
**Live URL:** `https://focussharp.app/sitemap.xml`

### What it is
A sitemap is literally a list of every page on your website, in a format Google understands (XML). It tells Google: "these are all the pages that exist on my site."

### Why you need one
Google's crawler (called "Googlebot") discovers pages by following links. But it might miss pages that aren't well-linked. A sitemap guarantees Google knows every page exists.

### What's in ours
```
/ (homepage)          — priority 1.0, crawl weekly
/app                  — priority 0.9
/pricing              — priority 0.8
/blog                 — priority 0.7
/blog/[each-post]     — priority 0.7, auto-added when you write a new post
/about                — priority 0.6
/privacy, /terms      — priority 0.3, crawl yearly
```

Priority is a hint to Google about what matters most. It doesn't guarantee ranking.

### What happens automatically
Every time you add a new `.mdx` file to `content/blog/`, its URL is automatically added to the sitemap at the next build. You don't need to manually update anything.

---

## robots.txt — Instructions for crawlers

**File:** `app/robots.ts`  
**Live URL:** `https://focussharp.app/robots.txt`

### What it is
A text file that tells search engine crawlers what they're allowed to index and what they should ignore.

### What ours says
```
Allow: /        → crawl everything
Disallow: /api/ → don't crawl our API routes (they're not pages)
Sitemap: https://focussharp.app/sitemap.xml
```

The `Disallow: /api/` line is important — without it, Google might try to crawl `/api/checkout` or `/api/webhooks/stripe`, which are server-only endpoints, not web pages.

### When to change it
Almost never. Only add `Disallow` rules for pages you actively don't want indexed (like a `/admin` panel, staging environments, or duplicate content pages).

---

## Meta title and description — Your Google listing

**File:** `app/layout.tsx` (root defaults) + each page's `metadata` export

### What they are
When your page shows up in Google search results, it looks like this:

```
FocusSharp — Focus Timer, Pomodoro & Deep Work Tracker
focussharp.app
Free focus timer and time tracking app. Set a target duration or go open...
```

The bold line is the **title**. The paragraph underneath is the **description**. These come directly from your metadata.

### How it works in Next.js
Every page file exports a `metadata` object:

```ts
// app/pricing/page.tsx
export const metadata: Metadata = {
  title: "Pricing — FocusSharp",
  description: "Simple pricing for FocusSharp...",
};
```

The root layout (`app/layout.tsx`) sets a template: `"%s | FocusSharp"`. So if a page sets `title: "Pricing"`, Google sees `"Pricing | FocusSharp"`. You don't have to write the brand name on every page.

### Rules of thumb
- **Title:** 50–60 characters. Include your target keyword. Don't keyword-stuff.
- **Description:** 120–160 characters. Describe what's on the page. Write for humans, not algorithms.
- Google sometimes ignores your description and writes its own from the page content. That's okay.

---

## Canonical URLs — Preventing duplicate content

**Every page has:** `alternates: { canonical: "https://focussharp.app/..." }`

### What the problem is
If Google finds the same content at multiple URLs — for example `https://focussharp.app/pricing` and `https://www.focussharp.app/pricing` — it might split the "ranking credit" between them, or penalise you for duplicate content.

### What a canonical tag does
It tells Google: "this is the one true URL for this page. If you find this content anywhere else, attribute it here."

### Why this matters for FocusSharp
Vercel can serve your site at multiple URLs (with/without `www`, with/without trailing slash). Canonicals make sure all SEO credit flows to the clean URL.

---

## JSON-LD / Structured Data — Rich results in Google

**Files:** `app/page.tsx` (SoftwareApplication schema), `app/pricing/page.tsx` (FAQPage schema), `app/blog/[slug]/page.tsx` (Article schema)

### What it is
JSON-LD is a way to describe your content in a structured format that Google can parse. It enables **rich results** — enhanced search listings that look different from normal results.

### Types we use

**SoftwareApplication (homepage)**
Tells Google this is an app. Can show star ratings, price, and platform info directly in search results.

```json
{
  "@type": "SoftwareApplication",
  "name": "FocusSharp",
  "applicationCategory": "ProductivityApplication",
  "offers": { "price": "0" }
}
```

**FAQPage (pricing page)**
The 5 FAQ items on the pricing page. When this is indexed, Google can show expandable Q&A directly in search results — no click required. Looks like this in search:

```
FocusSharp Pricing — focussharp.app
▼ Do I need an account to use FocusSharp?
  No. You can use the app right now without signing up...
▼ Can I cancel anytime?
```

**Article (each blog post)**
Tells Google this is an article with a specific author and publish date. Can enable "Top stories" carousel placement and shows the publish date in results.

### How to test it
Go to `search.google.com/test/rich-results`, paste a URL, and Google will tell you if your structured data is valid and what rich results it qualifies for.

---

## Open Graph tags — Social sharing previews

**File:** `app/layout.tsx` (root), `app/og/route.tsx` (image generator)

### What they are
Open Graph is a protocol (invented by Facebook) that tells platforms like Twitter, WhatsApp, LinkedIn, and Slack what to show when someone shares your link.

Without OG tags: your link shows as a plain URL.  
With OG tags: it shows a card with a title, description, and image.

### What we have
- A dynamic OG image generator at `/og` — it renders an image on the fly based on `?title=` and `?subtitle=` params
- Every page points to this generator with its own title/subtitle
- Blog posts generate a unique OG image per post automatically

### Important: OG tags don't affect Google rankings
Open Graph is purely for social sharing. It has zero effect on where you rank in Google search. Its value is click-through rate when someone shares your URL on social media.

---

## Long-tail keywords — How new apps actually get found

### The problem with short keywords
Searching for "timer" or "focus timer" returns results from apps with millions of users and years of backlinks. You can't compete for those terms directly — not yet.

### What long-tail means
Long-tail keywords are longer, more specific searches. Less volume, but far less competition.

**Short (impossible for now):** "focus timer" — millions of monthly searches, dominated by big apps  
**Long-tail (winnable):** "focus timer no signup" — hundreds of monthly searches, almost no competition

Someone searching "focus timer no signup" knows exactly what they want. If your page answers that question better than anyone else, you rank. And you convert, because the intent matches perfectly.

### The keywords FocusSharp targets
```
focus timer no signup
pomodoro timer category tracking
deep work timer app
flow state timer
study timer track by subject
focus timer for students
```

Each blog post targets one or two of these. Over time, as posts get indexed and linked, rankings build.

---

## Blog content — Why it's 80% of SEO

### Why Google ranks pages with text
Google's core job is matching search queries to useful content. A web app with buttons and a timer has very little text for Google to parse. A blog post that answers a specific question has hundreds of words of relevant content.

Blog posts:
1. Target keywords that app pages can't target naturally
2. Attract links from other sites (the #1 ranking factor)
3. Bring in readers who become users
4. Compound over time — a post written today can send traffic for years

### The two posts we wrote
1. `why-pomodoro-fails-deep-work` — targets "deep work timer", "pomodoro timer fails"
2. `focus-timer-no-signup` — targets "focus timer no signup", "free focus timer"

### How to add more posts
1. Create `content/blog/your-post-slug.mdx`
2. Add the frontmatter (title, description, date, tags, readingTime)
3. Write the content in Markdown
4. Deploy — the post appears on `/blog` and in the sitemap automatically
5. Submit the URL to Google Search Console (see below)

---

## Google Search Console — Telling Google you exist

### What it is
Google Search Console (GSC) is a free tool from Google. It's your direct line to Google's crawler. You can see what keywords you're ranking for, submit new pages for indexing, and diagnose any crawl errors.

### Step-by-step setup

**1. Go to search.google.com/search-console**

**2. Add a property**
- Click "Add property" → choose "Domain" (not URL prefix)
- Type: `focussharp.app`

**3. Verify ownership via DNS**
Google gives you a TXT record to add, like:  
`google-site-verification=xxxxxxxxxxxxxxxxxxxxxx`

To add it:
- Go to your Vercel dashboard → focussharp.app domain settings → DNS Records
- Add a new TXT record with the value Google gave you
- Back in GSC, click "Verify"
- It can take a few minutes for DNS to propagate

**4. Submit your sitemap**
- In GSC left sidebar → Sitemaps
- Paste: `https://focussharp.app/sitemap.xml`
- Click Submit

This tells Google's crawler to go read your sitemap and discover all your pages immediately, instead of waiting for Googlebot to stumble across them.

**5. Request indexing for each new blog post**
After you publish a new blog post:
- In GSC → top search bar → paste the full URL, e.g. `https://focussharp.app/blog/why-pomodoro-fails-deep-work`
- Hit Enter → click "Request Indexing"

This queues the page for crawling within hours instead of weeks.

### What to look at in GSC over time
- **Performance → Search results** — shows you what queries your pages are appearing for, and how many clicks
- **Coverage** — shows any pages with crawl errors
- **Core Web Vitals** — shows page speed issues that affect ranking

Check it monthly once you've published a few posts. Don't obsess over it daily — SEO changes slowly.

---

## Summary: the full picture

| Thing | What it does | Where it lives |
|---|---|---|
| `sitemap.xml` | Tells Google all your pages | `app/sitemap.ts` |
| `robots.txt` | Tells crawlers what to skip | `app/robots.ts` |
| Meta title/description | Your Google listing text | Each page's `metadata` export |
| Canonical URLs | Prevents duplicate content penalties | `alternates.canonical` in metadata |
| JSON-LD schemas | Enables rich results (FAQ, Article, App) | Inline `<script>` in page components |
| Open Graph tags | Social sharing card previews | `app/layout.tsx` + `/og` route |
| Blog posts | Actual content Google can rank | `content/blog/*.mdx` |
| Google Search Console | Submit pages, track rankings | search.google.com/search-console |

The technical pieces are done. The work now is: write one good blog post per month, submit it to GSC, and wait. SEO compounds — the posts you write today will still be sending traffic in 3 years.
