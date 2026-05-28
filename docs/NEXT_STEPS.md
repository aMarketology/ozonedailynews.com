# ONN | Next Steps
**Last updated:** May 27, 2026
**Phase:** Battle-testing master branch before sub-brand rollout

---

## Immediate Priority | Battle-Test ozonedailynews.com

The master branch is the blueprint every sub-brand will be cloned from. Fix every bug exactly once here, not nine times later.

### What to stress-test this week

- [ ] Write 3+ full articles through `/admin/articles/new` end-to-end (form → save draft → publish → verify JSON in GitHub → verify live URL renders)
- [ ] Edit a published article → Republish → confirm static JSON is overwritten in GitHub with updated content
- [ ] Try submitting an article that fails the E-E-A-T gate (short content, missing H2, em dash in title) — confirm error messages are clear
- [ ] Verify all 10 backfilled articles render correctly at their live URLs
- [ ] Test on mobile — confirm admin form is usable on a phone
- [ ] Confirm `content_registry.json` and sitemap update after a new publish (run `npm run wiki:sync -- --write` manually for now)

---

## ozonedailynews.com | Editorial Roadmap

**Domain role:** Science and sustainability desk for the ONN network.
**Publishing cadence:** 4x per week.
**Target:** 15+ published articles before sub-brand rollout begins.

### Content Pillars and Article Queue

#### Space Exploration (publish 2x per week during active missions)

Priority keywords with sustained search volume and low competition from paywalled sources:

| Article Idea | Format | Target keyword |
|---|---|---|
| NASA Artemis III mission status and launch window 2026 | News Article | `artemis 3 launch date 2026` |
| SpaceX Starship orbital flight record and reuse milestones | News Article | `starship orbital flight 2026` |
| ESA Jupiter Icy Moons Explorer (JUICE) flyby results | News Article | `juice spacecraft jupiter 2026` |
| James Webb Space Telescope discoveries 2026 | Article Page | `james webb telescope 2026 discoveries` |
| Mars sample return mission timeline and budget update | News Article | `mars sample return 2026` |
| Lunar Gateway construction progress | News Article | `lunar gateway station 2026` |

#### Atmospheric Science

| Article Idea | Format | Target keyword |
|---|---|---|
| Ozone layer recovery data 2026 | Article Page | `ozone layer recovery 2026` |
| Antarctic ozone hole measurement update | News Article | `ozone hole 2026` |
| Air quality index global cities 2026 | News Article | `global air quality index 2026` |

#### Climate Science

| Article Idea | Format | Target keyword |
|---|---|---|
| Arctic sea ice minimum 2026 measured extent | News Article | `arctic sea ice 2026` |
| Global average temperature record 2026 | News Article | `2026 global temperature record` |
| IPCC Sixth Assessment Report key findings explained | Article Page | `ipcc report 2026 summary` |
| Carbon capture technology progress and cost data 2026 | News Article | `carbon capture cost 2026` |
| Sea level rise data report 2026 | News Article | `sea level rise 2026 data` |

#### Global Sustainability

| Article Idea | Format | Target keyword |
|---|---|---|
| EU renewable energy 50% milestone data breakdown | News Article | `eu renewable energy 2026` |
| Solar energy capacity global record 2026 | News Article | `solar energy capacity 2026` |
| International sustainability agreements status 2026 | Article Page | `paris agreement 2026 progress` |
| EV adoption rate by country 2026 | News Article | `ev adoption rate 2026` |

#### Biodiversity and Planetary Health

| Article Idea | Format | Target keyword |
|---|---|---|
| IUCN Red List update 2026 | News Article | `iucn red list 2026` |
| Great Barrier Reef bleaching data 2026 | News Article | `great barrier reef 2026` |
| Amazon deforestation rate report 2026 | News Article | `amazon deforestation 2026` |
| Ocean acidification data 2026 | News Article | `ocean acidification 2026` |

### Publishing Calendar Template

| Day | Vertical | Content Type |
|---|---|---|
| Monday | Space exploration | News Article (mission update or discovery) |
| Tuesday | Climate science | News Article (data report or new research) |
| Thursday | Sustainability | News Article (policy, milestone, or tech breakthrough) |
| Saturday | Deep feature | Article Page (evergreen explainer — ozone, JWST, carbon capture) |

---

## Phase 2 | Sub-Brand Git Branch Setup

**Do not start until master branch is stable and 15+ articles are published.**

### Steps to spin up each sub-brand

1. Create Git branch from master: `git checkout -b basil` (repeat for each brand)
2. Create Railway service for the new domain, link to the same GitHub repo, set branch to `basil`
3. Set per-service environment variables in Railway:
   - `NEXT_PUBLIC_SITE_NAME` — brand name (e.g. `BasilNews`)
   - `NEXT_PUBLIC_SITE_URL` — live domain (e.g. `https://www.basilnews.com`)
   - `NEXT_PUBLIC_SITE_LOGO` — logo URL
   - `NEXT_PUBLIC_EDITORIAL_EMAIL` — editorial contact
   - `NEXT_PUBLIC_TWITTER_HANDLE` — Twitter/X handle
4. Point domain DNS to Railway service
5. Insert editor profile rows in Supabase for any writers assigned to that brand
6. Publish 15+ articles to the branch before submitting to Google Search Console

### Branch priority order

| Order | Branch | Domain | Reason |
|---|---|---|---|
| 1 | `basil` | basilnews.com | Finance + job listings — fastest SEO traffic at launch |
| 2 | `honey` | honeynewspaper.com | Environment + ethics — complements ozonedailynews.com |
| 3 | `obsidian` | obsidianpaper.com | Cybersecurity — high CPM, strong E-E-A-T signal |
| 4 | `onyx` | onyxtimes.org | Premium newspaper — needs most content before launch |
| 5 | `content` | contentnewsnow.com | Creator economy — high volume, lower authority bar |
| 6 | `clover` | cloverheadlines.com | Luxury — slower SEO ramp, launch last |

---

## Phase 3 | Flagship Hub Pages (ozonenetwork.news)

Each hub page aggregates sub-brand article cards. No body text duplication.

| Hub URL | Aggregates From | Build after |
|---|---|---|
| `/science` | ozonedailynews.com | 15+ science articles live |
| `/health` | honeynewspaper.com | honeynewspaper.com live |
| `/security` | obsidianpaper.com | obsidianpaper.com live |
| `/finance` | basilnews.com | basilnews.com live |
| `/lifestyle` | cloverheadlines.com | cloverheadlines.com live |
| `/world` | onyxtimes.org | onyxtimes.org live |
| `/creators` | contentnewsnow.com | contentnewsnow.com live |
| `/investigations` | objectivewire.org | Already live — build hub now |

---

## Phase 4 | Automation and Tooling

These are quality-of-life improvements. Not blockers.

- [ ] **Post-publish registry sync** — after a GitHub commit, trigger `npm run wiki:sync -- --write` automatically via GitHub Actions so `content_registry.json` and the sitemap update without a manual step
- [ ] **Google Search Console service account** — set `GOOGLE_SA_EMAIL` and `GOOGLE_SA_PRIVATE_KEY` to enable lifecycle auto-promotion (`news` → `review` after 48h based on impression data)
- [ ] **Bing Webmaster API** — set `BING_WEBMASTER_API_KEY` to enable `npm run ping:indexers` after each publish
- [ ] **Simon Alfred Minter editor access** — once Alfred creates his Supabase account, insert profile row with `is_editor = true` and appropriate `brand_slugs`
- [ ] **Media upload** — Supabase Storage bucket for thumbnails so editors can upload images directly from the admin form instead of pasting external URLs

---

## One Supabase Project for the Entire Network

The current Supabase project (`tqmrcznkgoupcwhonbyy`) serves all 9 brands. No new Supabase projects needed.

| Feature | How it works |
|---|---|
| Multi-brand drafts | `brand_slug` column on every article routes it to the correct Git branch on publish |
| Editor access control | `profiles.brand_slugs` array — editors only see and publish to their assigned brands |
| Single admin dashboard | `/admin` hosted at any domain; the brand dropdown and editor profile handle routing |
| Unified content registry | All 9 brands' articles tracked in one `content_registry.json`, one sitemap tree |
| Independent deployments | Railway watches each Git branch independently — a `basil` branch commit only redeploys basilnews.com |
