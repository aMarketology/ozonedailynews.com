# Ozone Network News | Build Progress
**Last updated:** May 27, 2026
**Legal entity:** Ozone Network News LLC (ONN)
**Shared codebase repo:** `aMarketology/ozonedailynews.com` (master branch = ozonedailynews.com)

---

## Network Domain Status

| Domain | Niche | Status |
|---|---|---|
| `ozonenetwork.news` | Flagship — Gaming, Finance, Startups | Live (separate repo) |
| `ozonedailynews.com` | Science, Space, Sustainability | Live |
| `objectivewire.org` | Investigations, Civic Watchdog | Live |
| `basilnews.com` | Personal Finance, Job Listings | Purchased — not deployed |
| `honeynewspaper.com` | Human-Centered Journalism, Ethics, Environment | Purchased May 26, 2026 |
| `cloverheadlines.com` | Luxury Lifestyle, Fashion, Travel | Purchased May 26, 2026 |
| `obsidianpaper.com` | Cybersecurity, Privacy, Data Security | Purchased May 26, 2026 |
| `onyxtimes.org` | Premium Institutional Newspaper, World, Politics | Purchased May 26, 2026 |
| `contentnewsnow.com` | Content Creators, YouTube | Purchased May 26, 2026 |
| `halonews.com` | Retired — niche moved to obsidianpaper.com | Do not deploy |
| `grovenews.com` | Retired — niche moved to onyxtimes.org | Do not purchase |
| `sagenews.com` | Retired — niche moved to honeynewspaper.com | Do not purchase |

---

## Git-Backed Headless CMS | Build Status

The CMS turns Supabase into a private draft workspace. Editors write in `/admin`, click Publish, and the article commits as a static JSON file to GitHub. The live site reads flat files only — zero database calls in production.

### Completed

- [x] **Supabase schema** — `articles`, `jack_articles`, `article_pages`, `creator_articles`, `wiki_articles`, `content_registry` tables created
- [x] **CMS migration** — `review` status, `brand_slug` column, `profiles` table, RLS policies
- [x] **Editor profile** — `max@amarketology.com` granted `is_editor = true`, `brand_slugs = {ozone}`
- [x] **API: `GET/POST /api/cms/articles`** — list and create drafts (auth-gated)
- [x] **API: `GET/PUT/DELETE /api/cms/articles/[slug]`** — read, update, delete single draft
- [x] **API: `POST /api/cms/publish`** — Git Bridge: E-E-A-T gate + GitHub Contents API commit + Supabase status update. Re-publish of live articles is now allowed (overwrites static JSON).
- [x] **E-E-A-T gate** — enforces all editorial rules before any commit lands in GitHub
- [x] **GitHub PAT** — fine-grained token with `contents:write` on this repo stored in `.env`
- [x] **Admin UI: `/admin/layout.tsx`** — server-side auth guard, redirects non-editors
- [x] **Admin UI: `/admin/articles`** — article list with status filters; Edit, Publish/Republish, Delete, View Live buttons shown for ALL articles regardless of status
- [x] **Admin UI: `/admin/articles/new`** — full article form, all schema fields including `article_type` dropdown (5 content templates)
- [x] **Admin UI: `/admin/articles/edit/[slug]`** — loads draft or published article, publish button wired, blue info banner for live articles
- [x] **`app/auth/callback/route.ts`** — OAuth + email confirmation redirect handler
- [x] **`proxy.ts`** — Next.js 16 session sync (replaces middleware.ts), cookies visible to server
- [x] **Login page** — switched to `createAuthBrowserClient()` so sessions land in cookies
- [x] **`[...slug]` catch-all route** — handles all article URLs dynamically; routes to `NewsArticle`, `JackArticleDB`, `ArticlePageDB`, `CreatorArticleDB`, or `WikiArticle` based on `article_type` field in JSON
- [x] **`article_type` field** — added to `AdminArticleForm`, `buildPayload()`, and `InitialData` interface. Committed to every static JSON on publish.
- [x] **`JackArticleFull` type** — added to `lib/types.ts`; `getJackArticleBySlug` added to `lib/article-service.ts`
- [x] **Backfill script** — `scripts/backfill-articles.ts` and `npm run backfill`. All 10 existing static JSONs imported into Supabase as `status = published`.
- [x] **Production build** — `npm run build` passes clean, 51 pages, 0 TypeScript errors
- [x] **Deployed** — commit `519bafa` pushed to master, Railway auto-deploy triggered
- [x] **Admin panel confirmed live** — `/admin/articles` returning `200`, all 10 articles visible

---

## Current Article Inventory

10 articles backfilled into Supabase (`status = published`). All serving live via `[...slug]` catch-all.

| Slug | Category | Author |
|---|---|---|
| `google-news-flash-attention-3-vs-turboquant-vs-paged-kv-cache-llm-optimization` | Tech | Simon Minter |
| `google-news-google-samsung-ai-smart-glasses-fall-2026` | Tech | Simon Minter |
| `google-news-turboquant-llm-kv-cache-compression` | Tech | Simon Minter |
| `google-waymo-waymo-500000-rides-per-week-10-cities-2026` | Tech | Simon Minter |
| `intel-18a-high-volume-manufacturing` | Tech | Simon Minter |
| `nasa-news-black-hole-jet-power-measured-cygnus-x1-curtin-university` | Science | Simon Minter |
| `nasa-news-jwst-wasp-94ab-daily-cloud-cycle-hot-jupiter-weather-2026` | Science | Simon Minter |
| `tech-meta-instagram-drops-encrypted-dms` | Tech | Simon Minter |
| `tech-news-87-percent-ai-agent-pull-requests-security-flaws-dryrun-report-2026` | Tech | Simon Minter |
| `tech-news-gitlab-restructuring-may-2026-workforce-agentic-ai-pivot` | Tech | Simon Minter |

---

## Key Architectural Decisions (Locked)

| Decision | Rationale |
|---|---|
| Static JSON as source of truth | Zero DB calls in production, Google Core Web Vitals, Top Stories eligibility |
| Supabase = draft scratchpad only | Editors write privately, never exposed to public read path |
| `[...slug]` catch-all route | One route handles all 9 brands and all URL depths, no per-article page stubs |
| `article_type` field in JSON | Determines which layout component renders — routed in catch-all switch |
| One Supabase project for all brands | `brand_slug` column routes each article to the correct Git branch on publish |
| Raw `fetch()` vs Octokit | Keeps bundle slim, only needs 2 GitHub API calls |
| Brand = Git branch | Each sub-brand deploys independently from its own branch, master = ozonedailynews.com |
| No canonical in `app/layout.tsx` | Canonical must be per-page only, never in shared layout |

---

## Environment Variables Checklist

| Variable | Status |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Set (new project `tqmrcznkgoupcwhonbyy`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Set |
| `GITHUB_TOKEN` | Set (fine-grained PAT, contents:write) |
| `GITHUB_OWNER` | Set (`aMarketology`) |
| `GITHUB_REPO` | Set (`ozonedailynews.com`) |
| `GITHUB_DEFAULT_BRANCH` | Set (`master`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Set |
| `GOOGLE_SA_EMAIL` | Not set (needed for lifecycle auto-promote) |
| `GOOGLE_SA_PRIVATE_KEY` | Not set (needed for lifecycle auto-promote) |
| `BING_WEBMASTER_API_KEY` | Not set (needed for ping-indexers) |
