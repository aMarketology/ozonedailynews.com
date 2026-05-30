# Git-Backed Headless CMS | OzoneNews Architecture Guide
**Document type:** Architecture + Admin User Guide + Multi-Repo Playbook
**Last updated:** May 30, 2026
**Applies to:** ozonedailynews.com and all 8 downstream niche repos

---

## What This Is

A headless CMS where the database is GitHub itself. No WordPress, no Contentful, no Sanity. Editors write JSON files or use `/admin`. Content is committed to Git, Vercel deploys automatically (~15-30s), pages go live via ISR within 60 seconds of the next request.

```
Editor writes/uploads article
        ↓
JSON written to content/static/[store]/[slug].json
UUID copy written to content/articles/[uuid].json
        ↓
Supabase routing_table: url_path → content_id (UUID)
content_registry.json updated
        ↓
git commit + push → Vercel auto-deploy (~20s)
        ↓
ISR: page regenerates on first request (revalidate=60)
        ↓
Live. Full Git history. Zero downtime. Zero DB dependency for reads.
```

---

## System Components

### 1. Content Stores (Git — source of truth)

| Path | Article Type | Component |
|---|---|---|
| `content/static/articles/[slug].json` | NewsArticle (standard) | `NewsArticleDB` |
| `content/static/jack_articles/[slug].json` | Long-form / Breaking | `JackArticleDB` |
| `content/static/sterling_articles/[slug].json` | Analysis / Deep dive | `SterlingArticleDB` |
| `content/static/article_pages/[slug].json` | Hub / Topic page | `ArticlePageDB` |
| `content/static/wiki_articles/[slug].json` | Wiki / Evergreen | `WikiArticle` |
| `content/static/creator_articles/[slug].json` | Author profile | `CreatorArticleDB` |
| `content/articles/[uuid].json` | ID-addressed mirror (routing layer) | — |

### 2. Routing Layer (Supabase — URL management)

| Table | Purpose |
|---|---|
| `routing_table` | url_path → content_id. Decouples public URLs from Git filenames. |
| `redirects` | old_path → new_path 301/302. Auto-written when a URL is changed. |

**Core principle:** A Git file (`content/articles/[uuid].json`) is **permanent and immutable**. A URL (`/science/space/my-article`) is just a pointer in Supabase. Change the URL any time via `POST /api/cms/reroute` — Git file never moves, 301 is auto-created.

### 3. Registry (`content/static/content_registry.json`)

Central index of all published content. Used by:
- `app/sitemap.ts` — Google News sitemap
- `app/[...slug]/page.tsx` → `generateStaticParams()` — static pre-rendering
- `components/articles/` — "Related articles" widgets
- `scripts/alfasa-sentinel.ts` — quality gate

**Run after every new article:**
```bash
npx ts-node --project tsconfig.scripts.json scripts/sync-registry.ts --write
```

### 4. Catch-All Route (`app/[...slug]/page.tsx`, revalidate=60)

Handles every article URL. Resolution order:
1. Supabase `routing_table` → content_id → `content/articles/[uuid].json`
2. Joined slug → `content/static/articles/[joined-slug].json`
3. Last segment → `content/static/articles/[last-segment].json`
4. URL field scan across all static articles
5. Supabase `articles` table fallback

Reads `article_type` from resolved JSON and switches renderer:
- `jack_article` → `<JackArticleDB>`
- `article_page` → `<ArticlePageDB>`
- `creator_article` → `<CreatorArticleDB>`
- `wiki_article` → `<WikiArticle>`
- `news_article` (default) → `<NewsArticle>`

### 5. Middleware (`middleware.ts` — Edge)

Runs before any route handler. Reads `redirects` table via plain REST fetch (Edge-compatible, no SDK). Issues 301/302 before Next.js page code fires.

---

## Publishing Workflow

### Standard news article
```bash
# 1. Write content/static/articles/[slug].json  (article_type: "news_article")
# 2. Sync registry
npx ts-node --project tsconfig.scripts.json scripts/sync-registry.ts --write
# 3. Commit
git add -A && git commit -m "publish: [Title]" && git push
```

### JackArticle (long-form / breaking / investigation)

Requires THREE files + a routing_table row:

```
content/static/jack_articles/[slug].json   ← full content (JackArticleDB reads this)
content/static/articles/[slug].json        ← homepage feed stub (content_html: "")
content/articles/[uuid].json               ← UUID mirror for routing_table
```

Generate deterministic UUID from the URL path:
```ts
import { v5 as uuidv5 } from 'uuid';
const NS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const uuid = uuidv5('/science/space/my-article', NS);
```

### Via Admin UI (`/admin`)

`POST /api/cms/publish` runs E-E-A-T gate → commits slug + UUID JSON to GitHub → calls `upsertRoute()` in Supabase → calls `revalidatePath()` to bust ISR immediately.

---

## E-E-A-T Quality Gate

Enforced in both `scripts/alfasa-sentinel.ts` and `/api/cms/publish/route.ts`:

| Rule | Requirement |
|---|---|
| Author | `author_name` + `author_slug`. Slug must be in `KNOWN_AUTHORS`. |
| Timestamp | Full ISO-8601 with timezone (`2026-05-30T14:00:00-05:00`) |
| Word count | 300+ words in `content_html` |
| Em/en dashes | Zero tolerance. Use `|` or comma. |
| Description | `metadata.description` 130-155 characters |
| Canonical | `metadata.alternates.canonical` full HTTPS URL |
| Headings | At least one `<h2>` in `content_html` |
| AI boilerplate | 10 banned phrases ("In conclusion", "Delve into", etc.) |

---

## Homepage Feed (`app/page.tsx`, revalidate=60)

```
articles[0]     → Hero (full-width, large image, breaking ticker if breaking:true)
articles[1-4]   → Secondary stack (right column)
articles[5-16]  → Grid (4-column)
```

- `breaking: true` → red **Breaking** badge
- `trending: true` → orange **Trending** badge
- All card links use `url` field pathname (handles nested canonicals like `/science/space/[slug]`)

---

## Multi-Brand / Multi-Repo Architecture

This repo is the master template. 8 niche repos clone from it.

### Brand → Git Branch Map (in `/api/cms/publish/route.ts`)

```ts
const BRAND_BRANCH: Record<string, string> = {
  ozone:     'master',
  basil:     'basil',
  obsidian:  'obsidian',
  honey:     'honey',
  onyx:      'onyx',
  clover:    'clover',
  content:   'content',
  objective: 'objective',
};
```

### What each niche repo inherits (zero changes needed)
- All CMS components and article renderers
- `lib/article-service.ts`, `lib/routing-service.ts`
- `middleware.ts`, `app/[...slug]/page.tsx`
- `scripts/sync-registry.ts`, `scripts/alfasa-sentinel.ts`

### What each niche repo customizes

| Item | Change |
|---|---|
| `lib/site-config.ts` | Site name, URL, logo, publisher name |
| `BRAND_BRANCH` in publish route | Add the niche brand slug |
| `KNOWN_AUTHORS` in publish route | Add niche-specific author slugs |
| `app/page.tsx` nav categories | Reflect the niche topic set |
| `content/static/` | Start empty, add niche content |
| Supabase | Separate project OR shared with `brand_slug` filter |

### Supabase strategy recommendation

**Shared project, brand_slug column on all tables.** The `routing_table` already has `brand_slug`. Add it to `articles`, `redirects` in the shared schema. One Supabase billing seat, one set of env vars, `brand_slug` isolates data per brand. Use RLS policies to filter by brand.

---

## Known Issues

| Issue | Severity | Fix |
|---|---|---|
| `lifecycle: "evergreen"` fails Supabase enum | Low | Add `"evergreen"` to `lifecycle_state` enum in schema migration |
| `getBreakingHeadlines()` reads Supabase only | Low | Breaking articles added via Git won't appear unless also in `articles` table. Homepage uses `hero.breaking` flag instead. |
| `generateStaticParams` skips jack_article URLs | Medium | Handled by ISR on first hit via routing_table. Pre-render by adding URLs to registry. |
| `JackArticleDB` resolves by slug, not UUID | Low | Works correctly. UUID file is only for routing_table → catch-all resolution. |

---

## Pre-Launch Checklist (run before cloning to each niche repo)

### CMS integrity
- [ ] All article JSON files have `article_type` set explicitly
- [ ] `content_registry.json` count matches `content/static/articles/` count
- [ ] Run: `npx ts-node --project tsconfig.scripts.json scripts/sync-registry.ts --write`
- [ ] Run: `npx ts-node --project tsconfig.scripts.json scripts/validate-canonicals.ts`
- [ ] All article `url` fields match their actual canonical URLs
- [ ] `routing_table` has rows for all articles using nested URL paths

### Infrastructure
- [ ] Vercel project linked to GitHub repo, auto-deploy on push enabled
- [ ] `routing-migration.sql` run against Supabase project
- [ ] All env vars set in Vercel dashboard (see below)
- [ ] `revalidate = 60` confirmed on `app/page.tsx` and `app/[...slug]/page.tsx`

### Editorial / Legal
- [ ] `/about`, `/editorial-standards`, `/corrections`, `/contact` pages exist
- [ ] All four linked as blue underlined text in global footer "Newsroom Policies" row
- [ ] `KNOWN_AUTHORS` in publish route includes all active author slugs
- [ ] At least one published article per category the site covers

---

## Environment Variables

```bash
# Public (safe to expose to browser — prefix NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-only (NEVER use NEXT_PUBLIC_ prefix on these)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GITHUB_TOKEN=github_pat_...       # Fine-grained PAT, contents:write on this repo only
GITHUB_OWNER=aMarketology
GITHUB_REPO=ozonedailynews.com    # Change per niche repo
GITHUB_DEFAULT_BRANCH=master      # Change per niche branch
```

---

## Scripts Reference

| Script | Command | Purpose |
|---|---|---|
| `sync-registry` | `npx ts-node --project tsconfig.scripts.json scripts/sync-registry.ts --write` | Register new articles in content_registry.json |
| `alfasa-sentinel` | `npx ts-node --project tsconfig.scripts.json scripts/alfasa-sentinel.ts` | E-E-A-T quality audit across all content |
| `validate-canonicals` | `npx ts-node --project tsconfig.scripts.json scripts/validate-canonicals.ts` | Check all canonical URLs |
| `validate-eeat` | `npx ts-node --project tsconfig.scripts.json scripts/validate-eeat.ts` | Full E-E-A-T audit |
| `backfill-articles` | `npx ts-node --project tsconfig.scripts.json scripts/backfill-articles.ts` | One-time: migrate legacy articles to UUID storage |
