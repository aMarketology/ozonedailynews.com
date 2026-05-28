# OzoneNews | E-E-A-T System — Complete Architecture

**Version:** 1.1  
**Created:** May 5, 2026  
**Updated:** May 27, 2026  
**Status:** Active — fully integrated into publish pipeline  
**Purpose:** This document defines how E-E-A-T quality enforcement is embedded across every layer of the OzoneNews codebase.

---

## What E-E-A-T Is and Why It Controls Everything

E-E-A-T stands for **Experience, Expertise, Authoritativeness, and Trustworthiness**. It is the primary framework Google's quality raters use to evaluate content, and it is the signal that Google's HCU (Helpful Content Update) classifier uses at the domain level.

The HCU classifier is **site-level**, not page-level. When it fires, it suppresses ALL pages on a domain — including the good ones — until the classifier re-evaluates during a future core update. For science and environmental news, the bar is even higher: content touching health, climate, or public safety is treated as YMYL-adjacent, and Google's trust signals are weighted more heavily.

This means:
- One bad page does not just fail on its own. It pulls down every other page on the domain.
- Quality is not optional. It is the core product requirement.
- "We'll fix it later" is not a valid strategy. Every publish must pass quality gates before it touches Supabase.

The two questions that must be answered YES before any content publishes:

> **1. What is the purpose of the page? Is it news, information, or deceptive?**
> **2. Is the content high quality? Does it demonstrate E-E-A-T?**

These questions are now enforced by code, not just by convention.

---

## Architecture: Where E-E-A-T Is Enforced

There are four enforcement layers. They are stacked, not redundant — each catches different things at different points in the workflow.

```
LAYER 1 — Pre-publish gate       (scripts/alfasa-sentinel.ts)
           Runs inside wiki:publish BEFORE Supabase write.
           Hard blocks + E-E-A-T score on every publish.

LAYER 2 — Prebuild scanner       (scripts/validate-eeat.ts)
           Runs before every next build.
           Catches metadata regressions across ALL pages.

LAYER 3 — Session briefing       (scripts/alfasa-suggest.ts)
           Run at session start: npm run alfasa
           Surfaces stale pages, content gaps, recent publish quality.

LAYER 4 — OStandard + Copilot   (.github/copilot-instructions.md)
           Editorial rules enforced at the writing stage.
           Em dash zero-tolerance, link styling, author rules.
```

---

## Layer 1 — alfasa-sentinel.ts (The Publish Gate)

**File:** `scripts/alfasa-sentinel.ts`  
**Trigger:** Every `npm run wiki:publish`  
**Effect:** Blocks Supabase write on hard failures. Prints E-E-A-T score on every publish.

### Hard Blocks (publish aborted)

| Code | Check | Why It Matters |
|------|-------|----------------|
| H1 | No `author_name` or `author_slug` | Named authorship is the #1 E-E-A-T signal. Anonymous content is untrusted by Google. |
| H2 | No `published_at` ISO-8601 timestamp | Required for NewsArticle schema, Top Stories eligibility, and freshness signals. |
| H3 | `content_html` under 300 words | Sub-300 word articles are classified as thin content by the HCU classifier. |
| H4 | Em dash (—) or en dash (–) in title/subtitle/metaTitle | Violates OStandard. Caught here so build guard is a backstop, not the first line. |
| H5 | `metadata.description` missing or under 130 chars | Short descriptions signal thin content. Google ignores them and picks arbitrary text. |
| H6 | No canonical URL in `metadata.alternates` | Missing canonical caused the April 22 impressions cliff. Non-negotiable. |
| H7 | No `<h2>` in `content_html` | Unstructured wall of text = poor UX = low E-E-A-T. |
| H8 | AI boilerplate phrases detected | "delve into", "it is worth noting", "in conclusion" etc. = HCU classifier signal. |

### Warnings (printed but do not block)

| Code | Check |
|------|-------|
| W1 | Word count under 600 (above 300 minimum) |
| W2 | Internal links under 4 |
| W3 | `metadata.description` over 155 chars |
| W4 | Tags array under 4 items |
| W5 | No `thumbnail_src` (ineligible for Google Top Stories) |
| W6 | Only 1 `<h2>` heading |
| W7 | `metadata.title` over 60 chars |
| W8 | No external source links (YMYL categories flagged harder) |
| W9 | `author_slug` not in known authors list |

### E-E-A-T Score (0-100)

Printed on every publish. Four signal groups:

| Group | Max Points | Key Signals |
|-------|------------|-------------|
| Experience | 20 | Named author, known author slug, cited sources |
| Expertise | 20 | Word count 800+, 3+ H2 headings, no AI boilerplate |
| Authoritativeness | 30 | 4+ tags, thumbnail, 4+ internal links, 2+ external links |
| Trustworthiness | 30 | ISO timestamp, canonical, 130-155 char description, ≤60 char title |

Grade: A (85+) / B (70+) / C (55+) / D (40+) / F

### Bypass

```bash
npm run wiki:publish -- --file app/your/path/page.tsx --skip-sentinel
```

`--skip-sentinel` is logged in `.alfasa/session_log.json` with `skippedSentinel: true`. Use only for genuine emergencies (breaking news with seconds to publish). Every bypass is visible in `npm run alfasa`.

---

## Layer 2 — validate-eeat.ts (Prebuild Scanner)

**File:** `scripts/validate-eeat.ts`  
**Trigger:** `npm run prebuild` (runs before every `next build`)  
**Effect:** Reports metadata quality across all pages. Does NOT block build by default.

### What It Scans

Every `page.tsx` in `app/` with a `metadata` export is checked for:

**Criticals** (printed in red):
- Em dash in `metadata.title`
- Stub page with no canonical URL
- `metadata.description` missing or under 50 chars

**Warnings** (printed in yellow):
- Title over 60 chars (SERP truncation)
- Description over 155 chars
- Description under 130 chars
- No `keywords` array
- No `openGraph` block on article pages
- Wrong brand suffix in title (must be empty or match `NEXT_PUBLIC_SITE_NAME`)

### Strict Mode

To block the build on criticals:

```bash
EEAT_STRICT=true npm run build
```

Or use the dedicated command:

```bash
npm run validate:eeat:strict
```

This is the recommended setting for production deploys once the domain is clean.

---

## Layer 3 — Alfasa Session Briefing

**File:** `scripts/alfasa-suggest.ts`  
**Command:** `npm run alfasa`  
**Effect:** Reads local files only. Prints editorial context at session start. Zero network calls.

### Output Sections

1. **Recent Publishes** — Last 5 articles with E-E-A-T grade, sentinel result, warning count
2. **Avg E-E-A-T Score** — Rolling 10-publish average with grade bar
3. **Stale Pages** — Articles past their category threshold, sorted by overage
4. **Priority Content Gaps** — Hub pages with fewer than target sub-articles
5. **OStandard Quick Reminders** — Em dash rule, link styling, title format

### Session Log

Every successful `wiki:publish` writes to `.alfasa/session_log.json`:

```json
{
  "date": "2026-05-05T14:30:00Z",
  "slug": "entertainment-news-fortnite-moves-into-movies",
  "url": "/entertainment/news/fortnite-moves-into-movies",
  "component": "NewsArticle",
  "wordCount": 1240,
  "author": "Michael Cripe",
  "category": "Entertainment",
  "eeaScore": 82,
  "eeaGrade": "B",
  "sentinelPassed": true,
  "skippedSentinel": false,
  "warnings": 1
}
```

Rolling window of 50 entries. Used by `alfasa-suggest.ts` for session briefing.

---

## Layer 4 — OStandard + Copilot Instructions (Editorial Gate)

**File:** `.github/copilot-instructions.md`  
**Effect:** Enforced at the WRITING stage, before any code is submitted.

These rules apply to every Copilot request in the workspace:

- No em dashes. Ever. Anywhere.
- No en dashes. Use `-` or rewrite.
- `metadata.title`: max 60 chars, `|` separator, no brand suffix, no em dashes.
- `metadata.description`: 130-155 chars, primary keyword in first 60.
- Every article: min 4 internal links (hub backlink + 2 siblings + author page).
- Every link in prose: `text-blue-600 hover:text-blue-800 underline` — no exceptions.
- Named authors with valid `author_slug` pointing to an existing `/authors/[slug]` page.
- `published_at` must be ISO-8601. Never omit.
- `tags`: 4-8 proper nouns. No generic terms.

---

## The Two Questions — How They Map to Code

### "What is the purpose of the page? Is it news, entertainment, or deceptive?"

This is answered by **page purpose classification**, which happens in `alfasa-sentinel.ts` via the component type detection. The component type maps directly to purpose:

| Component | Purpose | Supabase Table |
|-----------|---------|----------------|
| `NewsArticle` | Breaking news, science news, tech news | `articles` |
| `JackArticle` | Research, investigations, premium long-form | `jack_articles` |
| `ArticlePage` | Evergreen reference, explainers, wiki-style | `article_pages` |
| `CreatorArticle` | Creator/influencer profiles | `creator_articles` |
| `WikiArticle` | Deep-reference encyclopedia entries | `wiki_articles` |

A "deceptive" page is one that:
- Has a news-style headline but no sourcing
- Claims to be informational but has no structure (no H2s, no author)
- Uses AI boilerplate phrases that suggest generated content without human review

The sentinel blocks all three patterns via H7 (no H2s), H1 (no author), and H8 (AI phrases).

### "Is the content high quality? Does it demonstrate E-E-A-T?"

This is answered by the E-E-A-T score in `alfasa-sentinel.ts`. A page that scores below 55 (grade D or F) will have failed at least one hard block check and will not publish. A page that scores B or above demonstrates:

- Verifiable authorship (named author with profile page)
- Editorial structure (multiple H2 headings)
- Sourcing (external links)
- Metadata completeness (canonical, description, title within limits)
- Internal authority signals (links to hub and sibling articles)

---

## Known Authors

The sentinel validates `author_slug` against this list. Add new authors here when their `/authors/[slug]/page.tsx` is created:

```typescript
// scripts/alfasa-sentinel.ts — KNOWN_AUTHORS array
const KNOWN_AUTHORS: string[] = [
  'max-deleonardis',
  'simon-minter',
  'ozonedailynews-editorial-team',
];
```

### Current Author Roster

| Slug | Name | Role | Beat |
|---|---|---|---|
| `max-deleonardis` | Max DeLeonardis | Founder & Publisher | Premium investigations, in-depth science |
| `simon-minter` | Simon Minter | Editorial Assistant | Breaking news, aggregation, short-form |
| `ozonedailynews-editorial-team` | OzoneNews Editorial Team | Desk byline | Data reports, wire stories |

### Adding a New Author

1. Create `app/authors/[slug]/page.tsx` — must include Person JSON-LD schema, sameAs links, beat description, and recent article list (see Author Standards below)
2. Add `slug` to `KNOWN_AUTHORS` in `scripts/alfasa-sentinel.ts`
3. Add a row to the roster table above

---

## Author Page Standards (Science News)

For YMYL-adjacent content (climate, health, space, environmental science), Google's quality rater guidelines require author pages to demonstrate real-world expertise. A bare name and job title is not sufficient.

### Minimum Requirements for a Valid Author Page

Every `/authors/[slug]/page.tsx` must include:

| Requirement | Why |
|---|---|
| Person JSON-LD schema | Allows Google to disambiguate the author against known entities |
| `sameAs` with at least one external profile (Twitter or LinkedIn) | Establishes external footprint — Google cannot verify an author who exists only on your own domain |
| Beat/expertise paragraph | Explains what makes this author qualified to cover science, space, or climate topics |
| Beat label tags (visible) | Quick trust signal for readers and schema parsers |
| Article list (3+ recent bylines) | Demonstrates active authorship — not a shell profile |
| Link to editorial standards | Reinforces institutional trust |

### What Google's Quality Raters Check

For science and environmental topics, raters are specifically instructed to look for:
- Does the author have credentials or demonstrable experience in the subject?
- Is there any external evidence this person exists and writes about this topic?
- Is the publication transparent about who is responsible for its content?

A reporter who has covered space exploration for 2 years with a visible Twitter/LinkedIn presence scores significantly higher than an identical reporter with no external footprint — even if their articles are equally good.

### The sameAs Requirement

```tsx
// In every author page JSON-LD — REQUIRED
"sameAs": [
  "https://twitter.com/[handle]",         // At minimum, one of these must be real
  "https://www.linkedin.com/in/[profile]"
]
```

If a writer does not have a public social profile, consider:
- Using the OzoneNews Twitter account as a proxy (`sameAs: [SITE_CONFIG.sameAs[0]]`)
- Creating a Twitter account before publishing under their byline
- Using the `ozonedailynews-editorial-team` byline until a real profile exists

---

## Commands Reference

```bash
# Session start — always run this first
npm run alfasa

# Publish an article (sentinel runs automatically)
npm run wiki:publish -- --file app/your/path/page.tsx

# Run sentinel standalone on a file (before you run wiki:publish)
npm run sentinel -- --file app/your/path/page.tsx

# Check all pages' metadata quality
npm run validate:eeat

# Strict mode — fails if any criticals found
npm run validate:eeat:strict

# Check publish status
npm run wiki:status

# Build (runs prebuild automatically: validate-public + validate-canonicals + validate-eeat + sync-registry)
npm run build
```

---

## Domain Authority Strategy

OzoneNews launched in 2026 on a clean domain with the E-E-A-T system active from day one. The goal is not recovery but prevention: every publish must meet quality standards before it goes live so the domain never accumulates HCU risk.

Science and environmental content is among the most scrutinized by Google's quality raters. The HCU classifier specifically targets:
- Thin rewrites of press releases with no added analysis
- Anonymous or barely-credentialed bylines on health/climate topics
- Articles that lack primary sources or original data
- AI-generated content without verifiable human editorial review

The E-E-A-T system blocks all four patterns at the publish gate. For long-term domain authority:

1. **Author page depth** — `/authors/[slug]` pages with verifiable external credentials and real sameAs links
2. **Original data points** — cite primary sources (NASA, NOAA, IPCC, ESA, peer-reviewed journals)
3. **Google News inclusion** — submit once 15+ articles are published. Approved publishers get a strong trust signal.
4. **Topical coherence** — ozonedailynews.com should stay tightly scoped: science, climate, space, sustainability. Scope dilution hurts topical authority.
5. **Link acquisition** — science bloggers, climate journalists, university press offices are credible linking domains for this vertical

---

## File Map

```
scripts/
  alfasa-sentinel.ts        E-E-A-T gate — runs inside wiki:publish
  alfasa-session-log.ts     Session logger — writes to .alfasa/session_log.json
  alfasa-suggest.ts         Session briefing — npm run alfasa
  validate-eeat.ts          Prebuild scanner — runs before every next build
  wiki-publish.ts           Main publish pipeline — sentinel + log now integrated

.alfasa/
  stale-thresholds.json     Per-category staleness rules (days)
  session_log.json          Rolling 50-entry publish log (auto-created on first publish)

Docs/
  EEAT_SYSTEM.md            This file — master architecture reference
  RECOVERY_PLAN.md          HCU recovery checklist and timeline
  alfasa_content_editor_assistant.md   Alfasa full system plan
  alfasa_credibility.md     News network authority plan (Google News, Bing News, etc.)
```
