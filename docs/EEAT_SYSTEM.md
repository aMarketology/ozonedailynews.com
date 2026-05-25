# ObjectWire | E-E-A-T System — Complete Architecture

**Version:** 1.0  
**Created:** May 5, 2026  
**Status:** Active — fully integrated into publish pipeline  
**Purpose:** This document defines how E-E-A-T quality enforcement is embedded across every layer of the ObjectWire codebase.

---

## What E-E-A-T Is and Why It Controls Everything

E-E-A-T stands for **Experience, Expertise, Authoritativeness, and Trustworthiness**. It is the primary framework Google's quality raters use to evaluate content, and it is the signal that Google's HCU (Helpful Content Update) classifier uses at the domain level.

The HCU classifier is **site-level**, not page-level. When it fires, it suppresses ALL pages on a domain — including the good ones — until the classifier re-evaluates during a future core update. ObjectWire experienced this in April 2026.

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
- Brand suffix "ObjectWire" still in title

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
| `NewsArticle` | Breaking news, gaming, tech news | `articles` |
| `JackArticle` | Research, investigations, premium long-form | `jack_articles` |
| `ArticlePage` | Evergreen reference, profiles, wiki-style | `article_pages` |
| `CreatorArticle` | Creator/influencer profiles | `creator_articles` |
| `AlysaArticle` | Winter Olympics / athlete legacy profiles | `alysa_articles` |

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
  'michael-cripe',
  'jack-sterling',
  'objectwire-investigative-desk',
  'objectwire-influencer-desk',
  'objectwire-editorial',
  'alysa-rose',
];
```

Adding a new author requires:
1. Creating `app/authors/[slug]/page.tsx` with full E-E-A-T signals (photo, bio, external credentials)
2. Adding `slug` to `KNOWN_AUTHORS` in `alfasa-sentinel.ts`

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

## HCU Recovery Context

ObjectWire is recovering from a Google Helpful Content Update algorithmic penalty (April 2026). The E-E-A-T system is part of the domain-level rehabilitation strategy documented in `Docs/RECOVERY_PLAN.md`.

Recovery target: partial recovery at Aug/Sep 2026 core update. Full recovery by Mar 2027.

The E-E-A-T system alone does not guarantee recovery. It is the quality floor — the minimum standard every new publish must clear. Recovery also requires:

1. **Author page depth** — `/authors/[slug]` pages with verifiable external credentials
2. **Original reporting** — articles with named sources, original data, unique angles
3. **Noindex for thin pages** — pages that cannot be made substantial should be noindexed, not deleted
4. **News network presence** — Google News, Bing News, Apple News (see `Docs/alfasa_credibility.md`)
5. **Topical coherence** — creator content moving to owire.org, objectwire.org as journalism + gaming

The classifier re-evaluates at core algorithm updates only. The window is approximately every 3-6 months. Every publish between now and August 2026 either builds toward recovery or delays it.

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
