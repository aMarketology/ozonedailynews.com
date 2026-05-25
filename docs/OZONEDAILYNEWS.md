# OzoneNews | Master Reference Guide

**Legal entity:** Ozone Network News LLC (ONN)
**Production:** Railway → `ozonenetwork.news` | **Repo:** `aMarketology/ozonedailynews`
**Stack:** Next.js 15, React 19, Tailwind CSS, static JSON on-prem content store

---

## What OzoneNews Is

OzoneNews is a verified news platform. The editorial mission is accuracy over speed, primary sources only, and transparent corrections. It is not a blog, aggregator, or opinion site. Every article must be verifiable, sourced, and written for real search intent.

---

## Post March 2026 Core Update Rules

Binding on every publish. Full plan: `Docs/OZONE_NETWORK_LAUNCH.md`

1. **Information Gain** — every article must contain at least one original quote, contrarian take, custom chart/screenshot, or hand-written "Why This Matters" section. Generic AI rewrites of existing articles will be suppressed by Google.
2. **Banned LLM transition phrases (build fails on any occurrence):**
   - "In conclusion"
   - "It is important to note"
   - "It is important to remember"
   - "Furthermore, it is crucial"
   - "In today's fast-paced world"
   - "In the ever-evolving landscape"
   - "It is worth noting that"
   - "Moreover, it should be noted"
   - "Navigating the complex"
   - "Delve into"
   - "In summary"
3. **Author footprint** — every byline author must have an external `sameAs` profile (Twitter or LinkedIn) on their `/authors/[slug]` page. Authors with no external footprint must use the "OzoneNews Editorial Team" house byline.
4. **Author schema is a Person, not a string** — `NewsArticle.author` must be `{ "@type": "Person", "name": "...", "url": "...", "sameAs": [...] }` with at least one real external URL.
5. **Timestamps use full ISO 8601 with timezone offset** — `2026-05-18T18:00:00-05:00` preferred over bare `Z`. Date-only is banned.
6. **News sitemap is 48 hours and 1,000 URLs max** — articles older than 48h fall off the news sitemap but stay on the main sitemap.
7. **NewsMediaOrganization schema** lives in `app/layout.tsx` and links to `publishingPrinciples`, `correctionsPolicy`, `actionableFeedbackPolicy`, `ethicsPolicy`. All four trust pages must exist and be visible blue-underlined links in the global footer.
8. **Four trust pages** — `/about`, `/editorial-standards`, `/corrections`, `/contact`. All four must be linked from the global footer in a dedicated "Newsroom Policies" row.

---

## Content Lifecycle System

Every article passes through four lifecycle states. This keeps the site lean, the news-sitemap fresh, and SEO signals concentrated on ranked content.

```
PUBLISH → [news] 48h on news-sitemap → [review] editorial decision → [feature] permanent
                                                                    ↘ [pruned] deleted from disk
```

| State | Age | news-sitemap.xml | sitemap.xml | Action |
|---|---|---|---|---|
| `news` | 0-48h | Yes | Yes | None |
| `review` | 2-7 days | No | Yes | Run `npm run lifecycle:promote` |
| `feature` | 7d+ ranked | No | Yes, priority 0.9 | Permanent |
| `pruned` | 7d+ no rank | No | No | Run `npm run lifecycle:prune` to delete |

### Scripts

```bash
npm run lifecycle:check    # flag news → review (run every 48h)
npm run lifecycle:promote  # auto-promote ranked articles (needs GSC env vars) or print manual list
npm run lifecycle:prune    # permanently delete all lifecycle:"pruned" articles from disk + registry
```

### GSC Auto-Promotion Thresholds

Any one of the following triggers a `feature` promotion:
- `clicks >= 5`
- `impressions >= 100`
- `position <= 30`

### Environment Variables for Auto-Promotion

```
GSC_SITE_URL=https://www.ozonenetwork.news/
GSC_API_KEY=your_google_api_key_here
```

Without these, `--promote` runs in manual mode and prints a review list. Set `lifecycle: "feature"` or `lifecycle: "pruned"` in the JSON manually.

### Lifecycle Script Location

`scripts/lifecycle-manager.ts`

```
Run daily via Railway cron or manually:
  npx ts-node scripts/lifecycle-manager.ts --check
  npx ts-node scripts/lifecycle-manager.ts --promote
  npx ts-node scripts/lifecycle-manager.ts --prune
```

---

## OStandard | Always Enforced

### Core Rules

- **No em dashes (`—`) EVER.** Not in titles, headings, metadata, prose, JSX strings, Supabase fields, or code comments. Use `|` in headings. Use `,` in prose. Non-negotiable, checked by the build guard.
- **No en dashes (`–`) ever.** Use `-` or rewrite the sentence.
- **No `&` in H1/H2/H3 headings or article body prose.** Use `,` or rewrite. `&` is allowed in `metadata.title` and `openGraph.title` only.
- **Headings use `|`** as a separator, never `:` followed by a dependent clause.
- Subheadings must be niche and specific. `"Background"` and `"Overview"` are banned.
- Meta description: 130-155 chars, contains primary keyword, no generic phrases.
- `metadata.title` format: `Primary Keyword | Specific Detail` — no brand suffix, max 60 chars, no em dashes, `&` allowed.
- Every article slug must be lowercase, hyphen-only, no stop words.
- `tags` must be an array of 4-8 real proper nouns (no generic terms).
- `category` must be one of: `News`, `Tech`, `Finance`, `Entertainment`, `World`, `Politics`, `Science`, `Sports`, `Culture`, `Crypto`, `Gaming`.
- `published_at` must be a full ISO-8601 timestamp (e.g. `2026-03-28T14:00:00Z`).

### Em Dash Zero-Tolerance Reference

| Context | Wrong | Correct |
|---|---|---|
| Heading separator | `Title — Subtitle` | `Title \| Subtitle` |
| Prose parenthetical | `The update — which ships Friday — adds X` | `The update, which ships Friday, adds X` |
| Prose break | `It launched — and immediately crashed` | `It launched, and immediately crashed` |
| Quote/attribution footer | `— Jack Sterling` | `, Jack Sterling` |
| OG/Twitter description | `New feature — here's what changed` | `New feature, here is what changed` |
| Article subtitle/description | `Record sales — 5M in 48h` | `Record sales, 5M in 48 hours` |

---

## Article Component Routing

Every article belongs to exactly one static JSON store:

| Component | Static JSON Store | Use For |
|---|---|---|
| `NewsArticleDB` | `content/static/articles/` | News, breaking, gaming, tech, features, analysis |
| `JackArticleDB` | `content/static/jack_articles/` | Research reports, investigations, premium long-form |
| `ArticlePageDB` | `content/static/article_pages/` | Profiles, wiki-style, evergreen reference guides |
| `CreatorArticleDB` | `content/static/creator_articles/` | Creator profiles, influencer features, athlete bios |
| `AlysaArticleDB` | `content/static/alysa_articles/` | Winter Olympics / athlete-specific legacy profiles |

All fetching is server-side. Every `page.tsx` must export `dynamic = 'force-dynamic'`.

---

## NewsArticle | Gold Standard

**Reference:** `/entertainment/news/fortnite-moves-into-movies`
**Live:** `https://www.ozonenetwork.news/entertainment/news/fortnite-moves-into-movies`
**Store:** `content/static/articles/` | **Component:** `NewsArticleDB`

### Why It Is the Standard

1. **Layout** — 80/20 grid: main article body left (80%), `RelatedArticles` sticky sidebar right (20%).
2. **Animated thumbnail** — `thumbnail_src` set in the static JSON renders inside the gradient header with the "genie float" animation (golden flare sweep, subtle bob). Preferred header style for news/tech/gaming articles.
3. **Full engagement stack** — every article gets: `ReactionBar`, `DiscordComments`, `NewsletterSignupInline`, `ArticleViewTracker`, `TagsSection`, and an author card footer. Automatic. Do not remove them.
4. **Metadata quality** — 18 targeted keywords, full `openGraph` block with `publishedTime` + `section`, `twitter` card, canonical URL.
5. **Content depth** — specific named figures, data tables, H2 headings with numbers and `|` separators, internal links to hub pages.
6. **Internal linking** — minimum 4 internal links. Must include: hub backlink, 2 cluster sibling links, 1 author page link. All links blue and underlined.

### `page.tsx` Stub Pattern

```tsx
import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/NewsArticleDB';

export const dynamic = 'force-dynamic';

const SLUG = '/your/path/here';

export const metadata: Metadata = {
  title: 'Primary Keyword | Specific Detail',   // max 60 chars, no brand suffix, no em dashes
  description: '130-155 chars. Primary keyword in first 60 chars. No generic phrases.',
  keywords: ['keyword 1', 'keyword 2'],
  alternates: { canonical: `https://www.ozonenetwork.news${SLUG}` },
  openGraph: {
    title: 'Article Title Without Brand Suffix',
    description: 'Slightly different from meta description, emphasize data/hook.',
    type: 'article',
    url: `https://www.ozonenetwork.news${SLUG}`,
    siteName: 'OzoneNews',
    authors: ['Author Name'],
    publishedTime: '2026-03-12T00:00:00Z',
    modifiedTime: '2026-03-12T00:00:00Z',
    section: 'Entertainment',
    tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter-optimized headline (hook-first)',
    description: 'Data-led, punchy, one key stat or claim.',
  },
};

export default function YourPage() {
  return <NewsArticleDB slug="your-path-slug" />;
}
```

### Required `articles` Static JSON Fields

| Field | Rule |
|---|---|
| `title` | Full headline. No em dashes. `\|` for separators. |
| `subtitle` | One sentence. Data-led or hook-led. Ends without period. |
| `category` | Valid category value (see OStandard) |
| `status` | `'published'` |
| `breaking` / `trending` / `exclusive` | `true` only when genuinely applicable |
| `topic_tag` | One of the valid `TopicTagType` values (e.g. `"gaming"`, `"entertainment"`, `"ai"`) |
| `content_html` | Full HTML body wrapped in `<div class="prose prose-lg max-w-none">` |
| `publish_date` | Display string: `"March 12, 2026"` |
| `published_at` | ISO-8601: `2026-03-12T00:00:00Z` |
| `author_name` | Display name |
| `author_slug` | Kebab-case, links to `/authors/[slug]` |
| `read_time` | String, e.g. `"7 min read"` |
| `thumbnail_src` | Real hosted image URL, triggers animated genie header |
| `thumbnail_alt` | Descriptive alt text for the thumbnail |
| `tags` | Array of 4-8 proper nouns |
| `url` | Full canonical path: `/entertainment/news/fortnite-moves-into-movies` |
| `lifecycle` | `'news'` (default, can be omitted on publish) |

---

## JackArticle | Gold Standard

**Reference:** `/crypto/news/anchorage-usat-expands-to-celo-network`
**Live:** `https://www.ozonenetwork.news/crypto/news/anchorage-usat-expands-to-celo-network`
**Store:** `content/static/jack_articles/` | **Component:** `JackArticleDB`

### Why It Is the Standard

1. **Layout** — `layout="news"` with `accentColor` matched to topic (green for crypto/finance, blue for tech, orange for policy).
2. **Full sub-component stack** — `JackStats`, `JackCardGrid`, `JackCard`, `JackCallout`, `JackSideBlock`, `JackProcess`, `JackIndicatorGrid`, `JackQuote`, `JackSection` (numbered).
3. **Timeline** — 5-7 item chronological `timeline` array showing the story arc.
4. **Sources** — numbered `sources` array with real URLs. Every factual claim must be traceable.
5. **Related articles** — 4-6 manually curated `relatedArticles` with accurate `categoryColor`.
6. **Author** — always `Jack Sterling` (slug: `jack-sterling`), department varies by beat.
7. **Breadcrumbs** — 3 levels: hub, sub-hub, article.
8. **Internal linking** — minimum 5 internal links. External source links open in `_blank` with `rel="noopener noreferrer"`. All links blue and underlined.

### `page.tsx` Stub Pattern

```tsx
import type { Metadata } from 'next';
import { JackArticleDB } from '@/components/JackArticleDB';

export const dynamic = 'force-dynamic';

const SLUG = '/your/path/here';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`;
const OG_IMAGE = 'https://www.ozonenetwork.news/your-image.png';

export const metadata: Metadata = {
  title: 'Primary Keyword | Specific Detail',
  description: '130-155 chars. Primary keyword in first 60 chars.',
  keywords: ['keyword 1'],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'OG Title',
    description: 'OG description',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['Jack Sterling'],
    publishedTime: '2026-04-02T16:00:00Z',
    modifiedTime: '2026-04-02T16:00:00Z',
    section: 'Crypto',
    images: [{ url: OG_IMAGE, width: 1200, height: 675, alt: 'Alt text' }],
    tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter headline',
    description: 'Punchy stat.',
    images: [OG_IMAGE],
  },
};

export default function YourPage() {
  return <JackArticleDB slug="your-path-slug" />;
}
```

---

## CreatorArticle | Gold Standard

**Store:** `content/static/creator_articles/` | **Component:** `CreatorArticleDB`

### Why It Is the Standard

1. **Layout** — 2/3 article body + 1/3 sticky sidebar. The sidebar IS the Wikipedia-style infobox.
2. **Wikipedia-style infobox** — portrait image with name/subtitle overlay, row table: Born, Nationality, Based in, Occupation, social handles (linked with `href`), business email, agency, follower counts.
3. **Hero CTA buttons** — Instagram, TikTok, YouTube linked from the gradient header. `variant: 'secondary'` with emoji icons.
4. **Photo gallery mid-article** — `CreatorImageGallery` placed AFTER the quote block, NOT at the top.
5. **Keyword-rich H2s** — every `CreatorSection heading` includes the subject's full name as primary keyword. Generic headings like `"Background"` or `"Overview"` are banned.
6. **Full sub-component stack** — `CreatorSection`, `CreatorStat` (3 stats at top), `CreatorCalloutBox`, `CreatorQuote`, `CreatorImageGallery`, `CreatorTable`.
7. **15-18 keywords** — includes `[name] age`, `[name] age 2026`, `[name] Instagram`, `[name] TikTok`, `[name] real name`, `[name] 2026`.
8. **Internal linking** — minimum 3 internal links. Social handle links in the infobox rows must use `<a href>` with `target="_blank" rel="noopener noreferrer"`.

### `page.tsx` Stub Pattern

```tsx
import type { Metadata } from 'next';
import { CreatorArticleDB } from '@/components/CreatorArticleDB';

export const dynamic = 'force-dynamic';

const SLUG = '/influencer/your-creator';
const PAGE_URL = `https://www.ozonenetwork.news${SLUG}`;
const IMAGE_URL = '/influncer/yourCreator.jpg';

export const metadata: Metadata = {
  title: 'Creator Name | Age, TikTok, Instagram, Bio 2026',
  description: '130-155 chars. Name + age + platforms + location.',
  keywords: [
    'Creator Name',
    'Creator Name age',
    'Creator Name age 2026',
    'Creator Name Instagram',
    'Creator Name TikTok',
    /* 15-18 total */
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Creator Name | Age, TikTok, Instagram & Bio 2026',
    description: 'Full profile: age, platforms, social handles, career history.',
    type: 'article',
    url: PAGE_URL,
    siteName: 'OzoneNews',
    authors: ['OzoneNews Influencer Desk'],
    section: 'Influencer',
    tags: ['Creator Name', 'Influencer', 'City', 'Platform'],
    publishedTime: '2026-04-02T12:00:00Z',
    modifiedTime: '2026-04-02T12:00:00Z',
    images: [{ url: `https://www.ozonenetwork.news${IMAGE_URL}`, width: 1200, height: 675, alt: 'Creator Name portrait' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Name | Platform Followers, Bio',
    description: 'Name, age, social handles, and creator career.',
  },
};

export default function Page() {
  return <CreatorArticleDB slug="influencer-your-creator" />;
}
```

### `content_html` Section Order (Gold Standard)

1. `<CreatorSection heading="Who Is [Name]">` — 2-paragraph bio
2. `<div>` with 3 `<CreatorStat>` cards (primary platform followers, secondary platform, age)
3. `<CreatorSection heading="[Name] [Platform] | Followers + City">` — platform origin story
4. `<CreatorSection heading="[Name] Content | Topic, Topic, Topic">` — content style
5. `<CreatorCalloutBox heading="Content Categories">` — labeled list
6. `<CreatorSection heading="[Name] [Monetization] | Dual-Platform Model">` — platform economics
7. `<CreatorQuote>` — direct quote with attribution
8. `<CreatorImageGallery>` — 2-3 photos with captions (HERE, not at the top)
9. Notable event sections (lecture, relationship, incident) — one `CreatorSection` each
10. `<CreatorCalloutBox>` for safety/controversy context (`color="red"` if serious)
11. `<CreatorSection heading="[Name] Social Media | Official Accounts 2026">` with `<ul>` of linked handles
12. `<CreatorSection heading="[Name] Social Media Accounts | 2026 Follower Counts">` + `<CreatorTable>`
13. `<CreatorSection heading="[Name] 2026 | Creator Profile Summary">` — closing context

---

## Slug Format Rules

- `app/california/my-article/page.tsx` → slug: `california-my-article`
- `app/trump/foo/page.tsx` → slug: `trump-foo`
- Slugs match the full path joined with dashes, no leading slash, all lowercase.
- The slug in `page.tsx` and the slug in the static JSON filename must be identical.

---

## Publishing Workflow

**All article content is stored on-prem as static JSON files in `content/static/`.** Do not write to Supabase for new articles.

1. Write the `page.tsx` stub with full `metadata` and the correct `*DB` component pointing at the slug.
2. Write the static JSON content file at `content/static/{type}/{slug}.json`.
3. Update `content/static/{type}/_index.json` to include the new entry.
4. Add a `content_registry` entry — run `npm run wiki:sync -- --write` or add manually.
5. Set `lifecycle: "news"` in the JSON (or omit — it defaults to `news` behavior).

**`wiki:publish` is paused** — write stubs and static JSON manually using the gold standard patterns above.

### Critical Rules

- **Never use any `*DB` component with a slug that has no matching static JSON file.** The page will 404.
- Every new page must have a `content_registry` entry. Missing entry = invisible to Google (no sitemap, no JSON-LD, no Top Stories).
- Do not write Supabase rows for new articles. Static JSON is the source of truth.
- After writing new JackArticles, run `npm run jack:enrich` to populate breadcrumbs and related articles.

---

## Interlinking Rules

### Minimum Link Counts

| Article Type | Min Internal Links | Min External Source Links |
|---|---|---|
| `NewsArticle` | 4 | 1 |
| `JackArticle` | 5 | 3 (numbered `sources` array) |
| `ArticlePage` / `WikiArticle` | 3 | 1 |
| `CreatorArticle` | 3 | 2 (social handles + official sources) |
| `AlysaArticle` | 3 | 1 |

### Required Link Types (All Article Types)

1. **Hub backlink** — every sub-article must link to its parent hub within the first 3 paragraphs.
2. **Cluster cross-links** — link to 2-3 sibling articles in the same cluster.
3. **Author page link** — link to `/authors/[slug]` at least once per article.
4. **Pillar hub links** — on first mention of a priority topic, link to the pillar hub.
5. **No orphan pages** — every new page must be linked from at least one existing page.

### Link Styling — Non-Negotiable

Every link in article prose must be blue and underlined:

```tsx
// Internal (Next.js Link)
<Link href="/video-games/gta-6" className="text-blue-600 hover:text-blue-800 underline">
  GTA 6 release date hub
</Link>

// External source / citation
<a
  href="https://source.com/article"
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 hover:text-blue-800 underline"
>
  Reuters report
</a>
```

Inside `content_html` raw HTML strings, use `class=` not `className=`:

```html
<a href="/video-games/gta-6" class="text-blue-600 hover:text-blue-800 underline">GTA 6 hub</a>
<a href="https://source.com" target="_blank" rel="noopener noreferrer"
   class="text-blue-600 hover:text-blue-800 underline">original source</a>
```

Never:
- Render linked text as unstyled or black
- Use bare `<a href>` with no class inside JSX or `content_html`
- Omit `target="_blank" rel="noopener noreferrer"` on external links

---

## SEO Requirements (Every Publish)

- `metadata.title` — keyword + specific detail, max 60 chars, no brand suffix, no em dashes
- `metadata.description` — 130-155 chars, primary keyword in first 60 chars
- `canonical` URL set in `alternates`
- `openGraph` block with title, description, image (1200x675), `publishedTime`, `section`
- `NewsArticleSchema` component matching the `content_registry` entry exactly
- `SEOWrapper` wrapping the page, slug pointed at registry
- Breadcrumb at 3-4 levels
- H2 headings — one per major section, keyword-rich
- 4-6 internal links to related OzoneNews pages
- `imageUrl`, `imageWidth`, `imageHeight` in the registry entry (required for Google Top Stories)

### Canonical URL Rules

- **Never add `<link rel="canonical">` to `app/layout.tsx` or any shared layout.** A hardcoded layout canonical overrides every page's self-canonical and tells Google all pages are duplicates of the homepage. This caused the April 2026 impressions cliff.
- Every `page.tsx` sets its own canonical via `metadata.alternates.canonical`.
- `scripts/validate-canonicals.ts` runs at `prebuild` and fails the build if a hardcoded canonical is detected in any layout file.

### Public Directory Rules

- **Never place `robots.txt` or `sitemap.xml` in `/public`.** Next.js serves `/public` before App Router handlers, silently overriding the dynamic handler.
- `app/robots.ts` is the single source of truth for robots rules.
- `scripts/validate-public.ts` runs at `prebuild` and fails if `public/robots.txt` or `public/sitemap.xml` exist.
- Emergency override: `OzoneNews_OVERRIDE=true npm run build`

### Schema / JSON-LD Rules

- All URLs in JSON-LD must use `https://www.ozonenetwork.news` (with www). Non-www URLs cause a canonical mismatch.
- Author fallback URL resolves to `/authors/[slug]`, not `/team/[slug]`.
- `lib/seo.ts` has been deleted. Do not recreate it. Use `@/lib/seo-utils` or `@/lib/generate-article-metadata`.

### NewsMediaOrganization Trust URLs (all 9 required)

Set in `components/articles/NewsArticleSchema.tsx`, rendered via `app/layout.tsx`:

- `publishingPrinciples`
- `correctionsPolicy`
- `actionableFeedbackPolicy`
- `ethicsPolicy`
- `verificationFactCheckingPolicy`
- `diversityPolicy`
- `unnamedSourcesPolicy`
- `masthead`
- `ownershipFundingInfo`

---

## SEO Priority Pillars

| Pillar | Hub URL | Target Keyword |
|---|---|---|
| Gaming | `/video-games/gta-6` | "GTA 6" (5M+/mo) |
| Gaming | `/video-games/switch2` | "Nintendo Switch 2" (2M+/mo) |
| Tech / AI | `/open-ai` | "OpenAI" (3M+/mo) |
| Tech / AI | `/google` | "Google news" (2M+/mo) |
| Tech / AI | `/apple` | "Apple news" (1M+/mo) |
| Tech / AI | `/nvidia` | "Nvidia news" (800K+/mo) |
| Finance | `/finance` | "finance news" (500K+/mo) |
| Entertainment | `/entertainment` | streaming, studio deals |
| Seasonal | `/winter-olympics` | "2026 Winter Olympics" |
| Seasonal | `/world-cup` | "2026 World Cup" |

Sub-articles within a cluster must link to the hub, and the hub must link to all sub-articles. Internal linking is the highest-leverage SEO tactic.

---

## Prebuild Pipeline

Runs automatically before every `next build`:

1. `validate-public.ts` — blocks if conflicting static files exist in `/public`
2. `validate-canonicals.ts` — blocks if hardcoded canonical found in layouts; warns on missing page canonicals
3. `sync-registry.ts --write` — syncs `content_registry` with filesystem

---

## Homepage Article Pipeline

Sources articles from three stores merged in order:

1. `content/static/articles/*.json` via `getAllArticles()`
2. `content/static/jack_articles/*.json` via `getJackArticles()`
3. `content/static/content_registry.json` via `getAllEntries()`

All three are merged, deduplicated by `href`, and sorted newest-first by `publishDate`. Articles with no valid `publishDate` sort to the bottom and will NOT appear in the carousel.

### Critical Rules

- Every `NewsArticle` MUST have an individual JSON file at `content/static/articles/[slug].json`. The `_index.json` metadata file is not read by `getAllArticles()` and does not serve content.
- `readStaticDir()` in `lib/article-service.ts` must filter `_index.json` — it is a JSON array, not an article object, and parsing it as an article produces a phantom `"Invalid Date"` ghost entry in the carousel.
- Every `JackArticle` JSON must have `article_url` AND `publish_date` fields set.
- Every `page.tsx` must have `openGraph.publishedTime` in its metadata. This is what `sync-registry.ts` uses to set `publish_date` in `content_registry.json`.
- `getCreatorArticles()` queries Supabase (not static files) and is excluded from the homepage via `EXCLUDED_CATEGORIES`.

---

## Data Tables in Articles

Use `<PrismTable>` from `@/components/PrismTable` instead of raw HTML `<table>` elements inside article prose:

```tsx
import { PrismTable } from '@/components/PrismTable';

<PrismTable
  accent="blue"
  headers={['Feature', 'Description']}
  rows={[
    ['Row label', 'Row description text'],
    [<><span className="block font-black">Title</span><span className="block text-xs">Subtitle</span></>, 'Description'],
  ]}
  caption="Optional caption below table"
/>
```

Available accents: `purple`, `blue`, `red`, `green`, `orange`, `cyan`, `yellow`.

Raw `<table>` is acceptable only inside `<JackSection>` sub-components within JackArticles where PrismTable layout conflicts with the JackArticle column width.

---

## General Code Standards

- TypeScript strict mode is on — no `any` types without justification.
- All static JSON reads go through the `loadStaticRow()` helpers in each `*DB` component.
- Server components fetch data; client components handle interaction only.
- Never hardcode Supabase URLs or keys — use env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) only for legacy read fallbacks.
- Tailwind only — no inline `style={{}}` unless absolutely necessary.
- File names: kebab-case for pages/routes, PascalCase for components.
- `content_html` bodies must be wrapped in `<div class="prose prose-lg max-w-none">`.
- Blockquote footers use `, Name, Title` format — never start with `—`.

---

## Author Profiles

Centralized in `lib/author-profiles.ts`. All reporters and the house byline. Each entry has `sameAs: [twitter, linkedin]` arrays. When real accounts are created, update slugs in this single file and every article picks them up automatically.

| Author | Slug | Beat |
|---|---|---|
| Jack Sterling | `jack-sterling` | Policy, Legal, Tech, Finance |
| Tina Boyle | `tina-boyle` | Entertainment, Gaming |
| Max DeLeonardis | `max-deleonardis` | Gaming, Sports |
| OzoneNews Editorial Team | `ozonews-editorial-team` | House byline (no Person `sameAs` required) |

---

## Git / Deploy Rules

- **Never `git push` unless the user explicitly says to push.**
- **Never commit after every change.** Batch all changes into a single commit at the end of a writing session.
- Never deploy to Railway unless the user explicitly says "deploy" or "push to Railway".

---

## Editorial Principles

1. **Accuracy over speed** — verify before publishing, never chase breaking news without sourcing.
2. **Primary sources only** — cite origins, not aggregators. Every claim must be traceable.
3. **Transparent corrections** — errors corrected publicly, timestamped, original text preserved.
4. **Clear separation** — news vs. opinion labeled, sponsored content disclosed.
5. **Named authors** — all articles must have a byline with a valid `author_slug`.

---

*Last updated: May 25, 2026*
