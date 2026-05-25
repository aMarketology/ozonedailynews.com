# Ozone Network News | Git + Supabase + Static JSON Framework

**How the three-layer data architecture gives every sub-domain 0-latency reads,
reliable fallbacks, and a reusable publishing framework across the entire ONN network.**

---

## The Core Problem This Architecture Solves

A news site has two competing requirements:

1. **Speed** — articles must load in milliseconds. A database round-trip on every page request adds 100-400ms latency, destroys Core Web Vitals, and tanks SEO.
2. **Reliability** — if Supabase has an outage at 2am when a breaking story is live, the site cannot go blank.

The ONN framework solves both by making **Git the primary source of truth** and **Supabase the write layer and legacy fallback** — never the read bottleneck.

---

## The Three-Layer Stack

```
LAYER 1 — Git (content/static/*.json)
  ↑ fastest: filesystem reads, 0 network, 0 latency, deployed with the build
  ↑ most reliable: no external dependency, works offline, survives Supabase outages

LAYER 2 — Supabase (PostgreSQL + RLS)
  ↑ write layer: admin editor writes here, webhook syncs back to Git
  ↑ fallback read: if content/static/ file is missing, article-service falls through to Supabase
  ↑ live data: reactions, comments, view counts, user auth — never in Git

LAYER 3 — Next.js ISR / force-dynamic
  ↑ serves Layer 1 at edge speed
  ↑ revalidates on deploy (ISR) or per-request (force-dynamic for breaking news)
```

The key insight: **Layer 1 is always read first.** Supabase is only hit when Layer 1 returns empty. This is enforced throughout `lib/article-service.ts` and `lib/registry-service.ts` via the local-first pattern.

---

## Layer 1 | Git Static JSON (The Speed Layer)

### Where it lives

```
content/static/
  articles/              ← NewsArticleDB — news, breaking, gaming, tech
  jack_articles/         ← JackArticleDB — investigations, premium long-form
  article_pages/         ← ArticlePageDB — evergreen, wiki-style, profiles
  creator_articles/      ← CreatorArticleDB — creator profiles
  wiki_articles/         ← WikiArticleDB — reference, glossary
  content_registry.json  ← master index: used by sitemap, JSON-LD, Top Stories
```

### Why Git is faster than any database

When the Next.js server renders a page, `readStaticDir()` in `lib/article-service.ts` (lines 13-25) reads directly from the local filesystem — the same disk the Node.js process is running on inside the Railway container:

```typescript
// lib/article-service.ts — lines 13-25
function readStaticDir<T>(table: string): T[] {
  const dir = path.join(STATIC_BASE, table);    // process.cwd()/content/static/{table}
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== '_index.json')
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as T)
    .filter((x): x is T => x !== null);
}
```

`fs.readFileSync` on a local SSD is measured in **microseconds** — roughly 1000x faster than a Supabase round-trip over the internet. No TCP handshake. No DNS. No query planner. No RLS evaluation. Zero network hops.

### The local-first fallback chain

Every data function in `lib/article-service.ts` uses this exact pattern:

```typescript
export async function getAllArticles(): Promise<ArticleFull[]> {
  // LAYER 1: local static files — always tried first
  const local = readStaticDir<Record<string, unknown>>('articles');
  if (local.length > 0) {
    return local.map(row => ({ /* map to ArticleFull */ }));
  }

  // LAYER 2: Supabase fallback — only reached if content/static/articles/ is empty
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('...')
    .order('created_at', { ascending: false });
  return data.map(row => ({ /* map to ArticleFull */ }));
}
```

The same pattern applies to:
- `getJackArticles()` → `content/static/jack_articles/` → Supabase `jack_articles` table
- `getAllEntries()` in `lib/registry-service.ts` → `content/static/content_registry.json` → Supabase `content_registry` table

`getCreatorArticles()` is the **only exception** — it reads Supabase directly (no static file fallback) because creator profiles are managed live via the admin editor and are excluded from the homepage carousel via `EXCLUDED_CATEGORIES`.

### The registry — master index for sitemaps and JSON-LD

`content/static/content_registry.json` is a flat JSON array. Every published article has one entry. The registry is what powers:

- `app/sitemap.ts` — calls `getAllEntries()` which reads the registry first
- `app/news-sitemap.xml/route.ts` — reads `content/static/articles/` and `jack_articles/` directly (bypasses registry for freshness)
- `SEOWrapper` and `NewsArticleSchema` — look up `getEntry(slug)` from registry for JSON-LD
- `PopularCarousel`, `RelatedArticles` — query `getLatestArticles()` and `getRelatedArticles()` from registry

The registry load chain in `lib/registry-service.ts` (lines 35-44):

```typescript
const LOCAL_REGISTRY_PATH = path.join(process.cwd(), 'content', 'static', 'content_registry.json');

function loadLocalRegistry(): ContentEntry[] | null {
  if (_localCache) return _localCache;           // in-memory cache after first read
  const raw = JSON.parse(fs.readFileSync(LOCAL_REGISTRY_PATH, 'utf8'));
  _localCache = raw.map(rowToEntry);             // shape normalisation
  return _localCache;
}
```

The `_localCache` variable means the registry file is read from disk **once per server process lifetime**, then served from memory on every subsequent call. In production this means the sitemap, JSON-LD, and related articles all resolve from RAM with zero I/O after the first request.

---

## Layer 2 | Supabase (The Write Layer)

### What Supabase is responsible for

| Responsibility | Supabase Table | Notes |
|---|---|---|
| Admin editor writes | `articles`, `jack_articles`, `article_pages` | Written via admin UI at `/admin/editor` |
| Live engagement data | `reactions`, `comments`, `saves` | Never in Git — changes too frequently |
| User auth | `auth.users` | Supabase Auth handles sessions |
| Breaking headlines ticker | `articles` where `breaking = true` | `getBreakingHeadlines()` reads Supabase directly |
| Creator profiles | `creator_articles` | Live-managed, Supabase only |
| Fallback content | All article tables | Hit only when `content/static/` is empty |

### The two Supabase clients

**Server client** (`lib/supabase/server.ts`) — used in Server Components, API routes, and `lib/article-service.ts`:

```typescript
// lib/supabase/server.ts — lines 40-55
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Returns a standard supabase-js client — no cookie handling needed
  // because this path is for reads only (RLS: anon can read published rows)
  const client = createSupabaseClient(url, key);
  return client;
}
```

**Browser client** (`lib/supabase/client.ts`) — used in `'use client'` components for reactions, saves, and the admin editor:

```typescript
// lib/supabase/client.ts
export function createBrowserClient()     // anonymous reads + anon-allowed writes
export function createAuthBrowserClient() // auth-aware: session sync via cookies
```

### RLS policy model (Row Level Security)

```sql
-- Published articles: public read, no auth required
CREATE POLICY "anon read published" ON articles
  FOR SELECT USING (status = 'published');

-- Writes: only service_role (server-side, never exposed to browser)
CREATE POLICY "service write" ON articles
  FOR ALL USING (auth.role() = 'service_role');

-- Reactions: anon insert allowed (fingerprint-based dedup in app layer)
CREATE POLICY "anon react" ON reactions
  FOR INSERT WITH CHECK (true);
```

This means the `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposed in the browser can only read published rows and insert reactions — it cannot delete, update, or read drafts. The `SUPABASE_SERVICE_ROLE_KEY` (server-only, never in `NEXT_PUBLIC_*`) is used exclusively in admin write paths.

### The Supabase → Git sync loop

When an editor publishes via `/admin/editor`, the write goes to Supabase first (instant UI feedback). Then a webhook or manual script syncs the row back to Git as a static JSON file:

```
[Admin Editor] → Supabase INSERT/UPDATE → webhook → sync-registry.ts → content/static/*.json → git commit → Railway deploy
```

`scripts/sync-registry.ts` handles the Git side:
1. Scans `app/**/page.tsx` for `metadata` exports (reads `openGraph.publishedTime`)
2. Compares slugs against existing `content_registry.json` entries
3. Writes new entries to `content_registry.json`
4. Category auto-detection via `CATEGORY_MAP` (lines 50-80 of `sync-registry.ts`) — maps slug prefixes to categories and default tags

```bash
npm run wiki:sync -- --write   # sync registry after publishing new articles
```

---

## Layer 3 | Next.js Rendering Strategy

### Static vs Dynamic per route type

| Route type | Rendering | Revalidation | Why |
|---|---|---|---|
| Hub pages (`/video-games`, `/health`) | `revalidate = 3600` ISR | Every 1h | Content changes rarely — static is fastest |
| Article pages (`NewsArticleDB`, `JackArticleDB`) | `force-dynamic` | On every request | Breaking news must be fresh; static JSON makes this fast anyway |
| Homepage (`app/page.tsx`) | `revalidate = 3600` | Every 1h | Carousel content changes slowly |
| Sitemaps (`sitemap.ts`) | `revalidate = 86400` | Daily | Dates come from registry, not filesystem mtime |
| News sitemap (`news-sitemap.xml`) | `force-dynamic` | Every request | Google News crawls every few minutes — must be live |
| RSS feed (`rss.xml`) | `revalidate = 3600` | Every 1h | RSS readers poll hourly |

`force-dynamic` on article pages does NOT mean slow — because the data layer reads from `content/static/` (filesystem, microseconds), not from Supabase (network, 100-400ms). The page renders dynamically but the data is already on disk.

### How canoncials are set (critical — caused the April 2026 impressions cliff)

Every `page.tsx` sets its own canonical via `metadata.alternates.canonical`. **Never set canonical in `app/layout.tsx`** — a shared layout canonical overrides every child page and tells Google every page on the site is a duplicate of the homepage.

```typescript
// Every page.tsx — correct pattern
export const metadata: Metadata = {
  alternates: { canonical: `https://www.ozonenetwork.news/your/path` },
};
```

`scripts/validate-canonicals.ts` runs at prebuild and fails the build if a hardcoded canonical is found in any layout file.

---

## The Reusable Framework for Sub-Domains

Every ONN sub-brand domain is a separate Railway service running the same Next.js codebase. The only difference between `sagenews.com` and `ozonenetwork.news` is **environment variables and content files**. No code forks. No divergent codebases to maintain.

### Step 1 — Fork the content store

Each Railway service gets its own `content/static/` directory scoped to that domain's articles. In practice this means each sub-brand has its own branch or monorepo subdirectory:

```
ozonedailynews (this repo, main branch)     → ozonenetwork.news
ozonedailynews (ozonedailynews branch)      → ozonedailynews.com  ← already live
sagenews-content (new repo or branch)       → sagenews.com
halonews-content (new repo or branch)       → halonews.com
```

The shared library code (`lib/`, `components/`, `scripts/`) is the same across all. Only `content/static/` differs.

### Step 2 — Override SITE_CONFIG via env vars

Update `lib/site-config.ts` to read from environment variables with the flagship as fallback:

```typescript
// lib/site-config.ts — update to env-driven
export const SITE_CONFIG = {
  name:           process.env.NEXT_PUBLIC_SITE_NAME      ?? "OzoneNews",
  legalName:      process.env.NEXT_PUBLIC_SITE_LEGAL     ?? "Ozone Network News LLC",
  publisherName:  process.env.NEXT_PUBLIC_SITE_PUBLISHER ?? "Ozone Network News",
  url:            process.env.NEXT_PUBLIC_SITE_URL       ?? "https://www.ozonenetwork.news",
  logo:           process.env.NEXT_PUBLIC_SITE_LOGO      ?? "https://www.ozonenetwork.news/ozonenews-logo.png",
  email:          process.env.NEXT_PUBLIC_SITE_EMAIL     ?? "editorial@ozonenetwork.news",
  twitter:        process.env.NEXT_PUBLIC_SITE_TWITTER   ?? "@ozonenetwork",
  sameAs: [
    process.env.NEXT_PUBLIC_SITE_TWITTER_URL ?? "https://twitter.com/ozonenetwork",
    process.env.NEXT_PUBLIC_SITE_LINKEDIN_URL ?? "https://www.linkedin.com/company/ozonenetwork",
  ],
};
```

Then set these in Railway per service — `SITE_CONFIG` flows automatically into every JSON-LD schema, OG tag, RSS feed, sitemap URL, and logo reference across the entire app with zero code changes.

### Step 3 — Scope the sitemap per domain

Each sub-brand's `app/sitemap.ts` only lists its own content. Update `VALID_SLUG_PREFIXES` to match the sub-brand's route structure:

```typescript
// sagenews.com — app/sitemap.ts
const VALID_SLUG_PREFIXES = [
  '/', '/health/', '/wellness/', '/longevity/', '/mental-health/', '/biohacking/',
  '/fda/', '/research/', '/nutrition/', '/authors/',
];
```

The flagship `ozonenetwork.news/sitemap.ts` includes all prefixes from all verticals, pointing to its own aggregated hub pages.

### Step 4 — Scope the news sitemap per domain

`app/news-sitemap.xml/route.ts` reads from `content/static/articles/` and `content/static/jack_articles/`. Since each Railway service has its own `content/static/` scoped to that domain, the news sitemap is automatically scoped — no code change needed.

### Step 5 — Supabase project per domain (recommended) OR shared project with `domain` column

**Option A — Separate Supabase project per domain (recommended for Phase 1):**
- Clean RLS boundaries
- Independent scaling
- No cross-domain data leakage risk
- Each Railway service gets its own `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Cost: Supabase free tier supports up to 2 projects free, then $25/project/month

**Option B — Shared Supabase project with `domain` column:**
- Add `domain TEXT NOT NULL DEFAULT 'ozonenetwork.news'` to all article tables
- Filter all queries by `domain` via RLS or query clause
- Single billing, shared auth system
- Risk: a RLS misconfiguration leaks SageNews content onto HaloNews

Recommendation: **Option A** for Phase 1 (SageNews, HaloNews). Switch to **Option B** for Phase 3+ when operational overhead of 8+ projects becomes unwieldy.

### Step 6 — Author profiles per domain

`lib/author-profiles.ts` is shared across all domains. Add sub-brand reporters here before their first article:

```typescript
// lib/author-profiles.ts — add per sub-brand launch
"dr-maya-chen": {
  slug:     "dr-maya-chen",
  name:     "Dr. Maya Chen",
  jobTitle: "Health Reporter, SageNews",
  email:    "m.chen@sagenews.com",
  sameAs: [
    "https://twitter.com/dramayachen",
    "https://www.linkedin.com/in/dr-maya-chen",
  ],
},
```

The `sameAs` arrays are what Google uses for E-E-A-T scoring — especially critical for health (SageNews) and finance (CloverNews) which are YMYL categories.

---

## The Sync Loop in Full

Here is the complete data flow from article write to Google index:

```
1. WRITE
   Editor opens /admin/editor
   → Fills in article fields
   → Hits "Publish"
   → createBrowserClient() (lib/supabase/client.ts)
   → INSERT into Supabase articles table
   → status: 'published', published_at: now()

2. SYNC TO GIT
   npm run wiki:sync -- --write
   → scripts/sync-registry.ts scans app/**/page.tsx
   → Reads openGraph.publishedTime from metadata exports
   → Writes new entry to content/static/content_registry.json
   → Also writes article JSON to content/static/articles/{slug}.json
     (manual step or via admin webhook)

3. COMMIT + DEPLOY
   git add -A && git commit -m "publish: [article title]"
   git push origin main
   → Railway detects push → triggers npm run build
   → Build runs prebuild pipeline:
       validate-public.ts     (blocks if robots.txt in /public)
       validate-canonicals.ts (blocks if hardcoded canonical in layout)
       sync-registry.ts       (final registry sync)
   → Next.js builds all static pages
   → Railway deploys new container

4. SERVE (0-latency)
   User requests article URL
   → Next.js server component
   → NewsArticleDB calls loadStaticRow(slug)
   → readStaticDir('articles') hits content/static/articles/{slug}.json
   → fs.readFileSync (microseconds, no network)
   → Page renders from local filesystem
   → Supabase never touched for the article body

5. LIVE DATA (engagement layer)
   Page loads in browser
   → ArticleViewTracker fires (client component)
   → createBrowserClient() increments view count in Supabase
   → ReactionBar reads/writes reactions via Supabase
   → DiscordComments loads via Discord widget (external, not Supabase)

6. GOOGLE CRAWL
   Google News crawler hits /news-sitemap.xml
   → app/news-sitemap.xml/route.ts (force-dynamic)
   → Reads content/static/articles/ directly (filesystem, no Supabase)
   → Returns XML with articles published in last 48h
   → Google indexes within minutes for breaking stories

7. LIFECYCLE
   npm run lifecycle:check  (run every 48h)
   → articles older than 48h: lifecycle: "news" → "review"
   → falls off news-sitemap, stays on main sitemap

   npm run lifecycle:promote (run every 7 days)
   → checks GSC API for clicks/impressions/position
   → ranked: lifecycle: "feature" — stays permanently, sitemap priority 0.9
   → unranked: stays "review" for editorial decision

   npm run lifecycle:prune  (run after editorial review)
   → deletes lifecycle:"pruned" JSON files from content/static/
   → strips from content_registry.json and _index.json
   → git commit + deploy → sitemaps regenerate clean
```

---

## Performance Benchmarks (Expected)

| Metric | Before (Supabase-first) | After (Git-first) | Improvement |
|---|---|---|---|
| Article TTFB | 250-450ms | 15-40ms | ~10x |
| Sitemap generation | 800ms-2s | 50-120ms | ~15x |
| News sitemap | 300-600ms | 20-50ms | ~10x |
| Cold start resilience | Fails if Supabase down | Works if Supabase down | Infinite |
| Supabase query count per page | 3-5 queries | 0 queries (Layer 1 hit) | 100% reduction |
| Core Web Vitals (LCP) | 2.8-4.2s | 0.9-1.6s | Pass LCP threshold |

The 0-query target is the most important. Google's Core Web Vitals assessment directly impacts search ranking. Sub-1s LCP requires that the server response itself be fast — which requires eliminating network I/O from the render path.

---

## Sub-Domain Strength Matrix

How the Git + Supabase architecture makes each sub-brand specifically stronger:

| Sub-brand | Domain | Layer 1 advantage | Supabase role |
|---|---|---|---|
| ozonedailynews.com | Creator/YouTube news | High-velocity article writes (~5/day) deploy fast via Railway auto-deploy on push | View counts, reader saves |
| objectivewire.org | Investigations | Long-form JackArticles serve instantly even at low traffic volume | FOIA document storage (Supabase Storage for PDFs) |
| sagenews.com | Health | Zero-latency is critical for YMYL — Google's health crawler is strict on CWV | FDA alert webhook → auto-publishes to static JSON |
| halonews.com | Cybersecurity | Breach articles are time-sensitive — push-to-deploy in under 3 minutes | CVE feed ingestion writes to Supabase, syncs to Git |
| clovernews.com | Finance | Rate/Fed news is time-sensitive — same fast deploy path | Live market data widgets (client-side, not in static JSON) |
| statusnews.com | Business/Markets | Earnings reports need instant publish — static JSON survives traffic spikes | Executive profile photos in Supabase Storage |
| micanews.com | Science | Research articles are evergreen — Layer 1 cache is permanent value | DOI links and study metadata stored in sources array |
| onyxnews.com | Luxury | High-res image-heavy pages — CDN serves images, static JSON serves text | Gallery images in Supabase Storage |
| basilnews.com | Food | Recipe and restaurant content is evergreen | Food recall API webhook → auto-insert to Supabase → sync to Git |
| grovenews.com | Local/Real estate | Local content has long tail — every article stays in Layer 1 indefinitely | Local event data, real estate API feeds |

---

## Breaking News Fast Path

For truly breaking stories (breach, indictment, FDA emergency), use this accelerated path that skips the admin UI entirely:

```bash
# 1. Write the article JSON directly (30 seconds)
cat > content/static/articles/halo-breach-company-date.json << 'EOF'
{
  "slug": "halo-breach-company-date",
  "title": "...",
  "published_at": "2026-05-25T14:30:00-05:00",
  "lifecycle": "news",
  ...
}
EOF

# 2. Add to registry (10 seconds)
npm run wiki:sync -- --write

# 3. Commit and push (Railway deploys in ~90 seconds)
git add -A && git commit -m "breaking: [headline]" && git push origin main

# Total time from write to live: under 3 minutes
```

Supabase is not in this path at all. The article is live the moment Railway finishes the build. Google News typically crawls the news sitemap within 5-15 minutes of a new URL appearing — meaning a breaking story can be in Google News within 20 minutes of the event.

---

## Environment Variables Reference

Variables required per Railway service. Set these in Railway → Service → Variables:

```bash
# Supabase (required — anon key is safe to be NEXT_PUBLIC)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # server-only, never NEXT_PUBLIC

# Site identity (override per sub-brand service)
NEXT_PUBLIC_SITE_NAME=SageNews
NEXT_PUBLIC_SITE_URL=https://www.sagenews.com
NEXT_PUBLIC_SITE_LOGO=https://www.sagenews.com/sagenews-logo.png
NEXT_PUBLIC_SITE_EMAIL=editorial@sagenews.com
NEXT_PUBLIC_SITE_TWITTER=@sagenews
NEXT_PUBLIC_SITE_TWITTER_URL=https://twitter.com/sagenews
NEXT_PUBLIC_SITE_LINKEDIN_URL=https://www.linkedin.com/company/sagenews

# Lifecycle auto-promotion (optional — enables GSC rank checking)
GSC_SITE_URL=https://www.sagenews.com/
GSC_API_KEY=your_google_api_key

# Build override (emergency — skip prebuild validators)
OzoneNews_OVERRIDE=false
```

---

## File Reference Map

| What you want to change | File to edit |
|---|---|
| Site name, URL, logo, social handles | `lib/site-config.ts` |
| Article read logic (local-first fallback) | `lib/article-service.ts` |
| Registry read / sitemap query logic | `lib/registry-service.ts` |
| Supabase server client | `lib/supabase/server.ts` |
| Supabase browser client | `lib/supabase/client.ts` |
| Author E-E-A-T profiles + sameAs URLs | `lib/author-profiles.ts` |
| Main sitemap URL filtering | `app/sitemap.ts` → `VALID_SLUG_PREFIXES` |
| News sitemap 48h window | `app/news-sitemap.xml/route.ts` → `NEWS_WINDOW_HOURS` |
| Article lifecycle management | `scripts/lifecycle-manager.ts` |
| Registry sync from page.tsx metadata | `scripts/sync-registry.ts` |
| Category → tag auto-detection | `scripts/sync-registry.ts` → `CATEGORY_MAP` |
| All article static JSON | `content/static/{table}/{slug}.json` |
| Master registry index | `content/static/content_registry.json` |

---

*Last updated: May 25, 2026*
*See also: `Docs/DOMAINS.md` (domain architecture), `Docs/NEWSNETWORK.md` (sub-brand editorial plan), `Docs/OZONEDAILYNEWS.md` (CMS publishing standards)*
