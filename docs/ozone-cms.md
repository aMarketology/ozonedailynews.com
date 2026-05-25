# Why Duda's Built-In SEO Is So Strong — And How to Replicate It in JavaScript

> Internal reference document for OzoneNews engineering.
> Last updated: February 21, 2026

---

## Part 1: Why Duda's Built-In SEO Was Strong

Duda is a website builder that handles SEO **automatically at the infrastructure level**. Here's what it did for OzoneNews out of the box:

### 1. Server-Side Rendering by Default

Duda serves fully rendered HTML to crawlers. Google, Bing, Perplexity — they all receive complete page content on the first request. No JavaScript execution needed.

### 2. Automatic Structured Data

Duda injects `JSON-LD` schema markup for:

- `Organization` schema on every page
- `Article` / `NewsArticle` schema on blog posts
- `BreadcrumbList` on every page
- `WebSite` with `SearchAction` for sitelinks
- `LocalBusiness` if configured

None of this required manual work. It was injected into every page automatically.

### 3. Automatic Sitemap + Robots.txt

Every time a page was published, Duda:

- Regenerated `sitemap.xml` with the correct `<lastmod>` timestamp
- Pinged Google Search Console automatically
- Maintained a proper `robots.txt`

### 4. Canonical URLs on Every Page

Duda auto-generated `<link rel="canonical">` on every page, preventing duplicate content issues.

### 5. Meta Tags with Fallbacks

If a meta description was missing, Duda would auto-generate one from the first ~160 characters of content. Same for OG tags and Twitter cards.

### 6. Page Speed Optimization

- Automatic image compression and WebP conversion
- Lazy loading on images
- CSS/JS minification
- CDN delivery globally
- Core Web Vitals optimized out of the box

### 7. Internal Linking Structure

Duda's navigation system automatically created crawlable internal links. The header, footer, and breadcrumbs were all server-rendered `<a>` tags — not JavaScript-rendered links.

### 8. Proper HTTP Headers

- `200` for live pages
- `301` redirects managed in a UI
- `404` for missing pages (not soft 404s)
- Proper `Cache-Control` headers

---

## Part 2: What OzoneNews Lost When Switching to Next.js

Our current setup is missing several critical SEO systems that Duda handled automatically:

### ✅ FIXED — Sitemap with Real Dates

`lib/content-registry.ts` now drives `app/sitemap.ts`. Every registered entry has a real `publishDate` and `modifiedDate` — no more deploy-timestamp faking.

### ✅ FIXED — Structured Data on Key Pages

`SEOWrapper` (`components/SEOWrapper.tsx`) injects `NewsArticle` + `BreadcrumbList` JSON-LD on any page that wraps with it — driven entirely by the content registry.

### ✅ FIXED — Real Author Attribution with Profile URLs

`ContentEntry` now has an optional `authorSlug` field. `SEOWrapper` automatically resolves the author's profile URL (`/authors/{slug}`) and emits it in the JSON-LD `author.url` and `sameAs` fields — enabling Google News author verification for **Conan Boyle** and other named contributors.

Named author entries in the registry so far:
- **Conan Boyle** (`authorSlug: 'conan-boyle'`) — Neurophos, NASA, Blitzy, IronSpring, Anthropic/Claude article

For entries using generic desk names (e.g. "OzoneNews Tech Desk"), no author URL is emitted — intentional, since desks don't have profile pages.

### ❌ INCOMPLETE — Only 38 of 251 Pages in the Registry

The site has **251 `page.tsx` files** but the content registry only has **38 entries**. The `/site-index` therefore shows 38 pages. Every unregistered page is also invisible to the sitemap and gets no `SEOWrapper` structured data.

**Priority: register all content pages.** Skip admin/api/feeds routes.

### ⚠️ DUPLICATE JSON-LD ON ~30 PAGES

Pages that were built before `SEOWrapper` existed use inline `<NewsArticleSchema>` components AND are wrapped in `<SEOWrapper>`. This emits two `NewsArticle` JSON-LD blocks per page. Google tolerates it but it's noise.

Fix: remove the inline `<NewsArticleSchema ... />` call from any page that already uses `<SEOWrapper>`.

Affected pages (sample):
- `news/anthropic-claude-sonnet-4-6-saas-selloff`
- `trump/japan-36-billion-us-energy-critical-minerals`
- `apple/news/apple-video-podcasts-youtube`
- `copyright/elemental-atlus-royalties`
- `video-games/mha/ultra-rumble/season-15/strike-overhaul`
- ~25 others

### ❌ No Automatic Meta Fallbacks

If a page is missing a `description` in its `metadata` export, Next.js renders nothing. Duda would have auto-generated one. Unregistered pages with no `description` in their `metadata` export are at risk.

### ❌ No Google Ping on Publish

Duda pinged Google every time content was published. Our site only gets re-crawled when Google decides to visit. Script exists at `scripts/ping-google.ts` but is not wired to a deploy hook.

---

## Part 3: How to Build SEO-Optimized Websites in JavaScript (Next.js)

### System 1: Content Management Layer (Content Registry)

The single most important missing piece. A central source of truth for all content metadata:

```typescript
// lib/content-registry.ts

export interface ContentEntry {
  slug: string;           // URL path like "/winter-olympics/usa/breezy-johnson"
  title: string;          // Page title
  description: string;    // Meta description (max 160 chars)
  publishDate: string;    // ISO date: "2026-02-11"
  modifiedDate: string;   // ISO date: last edit
  category: string;       // Primary category
  tags: string[];         // Topic tags
  author: string;         // Author name
  priority: number;       // Sitemap priority 0.0-1.0
  changeFrequency: 'daily' | 'weekly' | 'monthly'; // Sitemap hint
}

export const contentRegistry: ContentEntry[] = [
  {
    slug: '/winter-olympics/usa/breezy-johnson',
    title: 'Breezy Johnson - Team USA Downhill Gold Profile',
    description: 'Profile of Breezy Johnson, who secured Team USA first gold at Milan Cortina 2026.',
    publishDate: '2026-02-11',
    modifiedDate: '2026-02-11',
    category: 'Sports',
    tags: ['Winter Olympics', 'Team USA', 'Alpine Skiing'],
    author: 'OzoneNews Team',
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  // ... every article registered here
];
```

### System 2: Proper Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { contentRegistry } from '@/lib/content-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.OzoneNews.org';

  return contentRegistry.map((entry) => ({
    url: `${baseUrl}${entry.slug}`,
    lastModified: new Date(entry.modifiedDate),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
```

### System 3: Automatic Structured Data on Every Page

Create a component that wraps every article page:

```typescript
// components/SEOWrapper.tsx
import { contentRegistry, ContentEntry } from '@/lib/content-registry';

export function SEOWrapper({ slug, children }: { slug: string; children: React.ReactNode }) {
  const entry = contentRegistry.find(e => e.slug === slug);
  if (!entry) return <>{children}</>;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: entry.title,
    description: entry.description,
    datePublished: entry.publishDate,
    dateModified: entry.modifiedDate,
    author: { '@type': 'Person', name: entry.author },
    publisher: {
      '@type': 'Organization',
      name: 'OzoneNews',
      url: 'https://www.OzoneNews.org',
    },
    mainEntityOfPage: `https://www.OzoneNews.org${entry.slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: slug.split('/').filter(Boolean).map((segment, i, arr) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      item: `https://www.OzoneNews.org/${arr.slice(0, i + 1).join('/')}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
```

### System 4: Google Indexing API (Ping on Deploy)

```typescript
// scripts/ping-google.ts
// Run as a post-deploy hook on Vercel

import { contentRegistry } from '../lib/content-registry';

async function pingGoogle() {
  // Ping sitemap
  await fetch(
    `https://www.google.com/ping?sitemap=https://www.OzoneNews.org/sitemap.xml`
  );

  // For faster indexing, use Google Indexing API
  // Requires Google Search Console API credentials
  const recentArticles = contentRegistry.filter(entry => {
    const published = new Date(entry.publishDate);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return published > dayAgo;
  });

  for (const article of recentArticles) {
    console.log(`Requesting indexing: ${article.slug}`);
    // POST to Google Indexing API here
  }
}

pingGoogle();
```

### System 5: Automatic Internal Linking

```typescript
// components/RelatedArticles.tsx
import Link from 'next/link';
import { contentRegistry } from '@/lib/content-registry';

export function RelatedArticles({ currentSlug, category, tags }: {
  currentSlug: string;
  category: string;
  tags: string[];
}) {
  const related = contentRegistry
    .filter(entry => entry.slug !== currentSlug)
    .map(entry => ({
      ...entry,
      relevance:
        (entry.category === category ? 3 : 0) +
        entry.tags.filter(t => tags.includes(t)).length,
    }))
    .filter(e => e.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);

  return (
    <nav aria-label="Related articles">
      <h3>Related Coverage</h3>
      <ul>
        {related.map(article => (
          <li key={article.slug}>
            <Link href={article.slug}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## Part 4: SEO Architecture Comparison (Feb 21 2026)

| System | Duda (automatic) | OzoneNews (current) | Status |
|--------|------------------|---------------------:|--------|
| Sitemap with real `lastmod` | ✅ | ✅ Content registry drives sitemap | Done |
| Structured data every page | ✅ | ⚠️ ~38/251 pages via SEOWrapper | Partial — need to register all pages |
| Breadcrumbs every page | ✅ | ⚠️ Auto-generated by SEOWrapper for registered pages only | Partial |
| Named author with profile URL | ✅ | ✅ `authorSlug` → `/authors/conan-boyle` in JSON-LD | Done |
| Meta description fallback | ✅ | ❌ Missing on unregistered pages | Not built |
| Canonical URLs | ✅ | ⚠️ Partial — set per page in `metadata` exports | Partial |
| Google ping on publish | ✅ | ❌ Script exists, not wired to deploy hook | Not wired |
| Real publish dates | ✅ | ✅ Registry stores real ISO dates | Done |
| Image optimization | ✅ | ⚠️ Next.js `<Image>` used on some pages | Partial |
| Core Web Vitals | ✅ Auto-optimized | ⚠️ Untested | Needs audit |
| Duplicate JSON-LD | N/A | ❌ ~30 pages have both `NewsArticleSchema` + `SEOWrapper` | Needs cleanup |

---

## Part 5: Priority Implementation Order (Updated Feb 21 2026)

| # | Task | Status | Impact |
|---|------|--------|--------|
| 1 | Content Registry — central metadata for all URLs | ✅ Done (`lib/content-registry.ts`) | Highest |
| 2 | Fix Sitemap — use registry dates for `<lastmod>` | ✅ Done (`app/sitemap.ts`) | High |
| 3 | SEOWrapper — structured data + breadcrumbs | ✅ Done (`components/SEOWrapper.tsx`) | High |
| 4 | Named author attribution with profile URL | ✅ Done (`authorSlug` in ContentEntry + SEOWrapper) | High |
| **5** | **Register all 251 pages in the content registry** | **❌ Only 38/251 done** | **Highest** |
| 6 | Remove duplicate `<NewsArticleSchema>` from SEOWrapper pages | ❌ Pending | Medium |
| 7 | Post-deploy Google ping | ❌ Script exists, not wired | Medium |
| 8 | Meta description fallback system | ❌ Not built | Medium |
| 9 | Related articles on every page | ✅ `getRelatedArticles()` exists, used on some pages | Low |
| 10 | Google Search Console Indexing API | ❌ Not built | Low |

### Next Immediate Action: Fill the Registry

Every unregistered page is invisible to Google's sitemap signal and gets no JSON-LD. With 213 pages missing, this is the single biggest SEO gap remaining.

Template for each entry:
```typescript
{
  slug: '/section/article-slug',
  title: 'Article Title | OzoneNews',
  description: 'Max 160 char meta description.',
  publishDate: '2026-MM-DD',
  modifiedDate: '2026-MM-DD',
  category: 'Tech' | 'Finance' | 'News' | 'YouTube' | 'Video Games' | 'Entertainment' | 'Sports',
  tags: ['tag1', 'tag2'],
  author: 'Conan Boyle',      // use real name when known
  authorSlug: 'conan-boyle',  // links to /authors/conan-boyle for Google author verification
  priority: 0.7,
  changeFrequency: 'weekly',
}
```

---

## Key Takeaway

> **Duda's SEO strength was never about being "better" — it was about being automatic.**
> Every page got structured data, breadcrumbs, canonical URLs, and real timestamps without
> the developer doing anything. In Next.js, you must build these systems yourself. The
> content registry is the foundation — everything else flows from it.

---

*Document authored by OzoneNews Engineering, February 2026.*
