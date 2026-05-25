# ObjectWire | GEO System — Generative Engine Optimization

**Version:** 1.0  
**Created:** May 11, 2026  
**Status:** Active — fully integrated  
**Companion to:** `Docs/EEAT_SYSTEM.md`, `Docs/RECOVERY_PLAN.md`

---

## What GEO Is and Why It Matters Now

**Traditional SEO** = rank on Google's 10 blue links  
**GEO** = get cited, extracted, and surfaced by AI systems: ChatGPT, Perplexity, Microsoft Copilot, Claude, Google SGE

These are different competitions. Ranking #1 on Google does not guarantee AI citation. Being cited by AI does not require ranking #1 on Google.

The shift matters because:
- Perplexity is growing 400%+ year-over-year in referral traffic
- ChatGPT browses the web via Bing for current events
- Microsoft Copilot (built on GPT-4 + Bing) is embedded in Windows, Office, and Edge
- Google's AI Overviews (SGE) now appear above organic results for 40%+ of news queries
- Apple Intelligence cites web sources directly in iOS/macOS search

ObjectWire's target keywords are exactly the type AI systems answer: "What is the GTA 6 release date?", "What are the copyright rules for AI voices?", "Who owns X?", "What happened with Y?"

If ObjectWire is not optimized for AI extraction, these queries will be answered by whoever is.

---

## The Core Principle

> You are not writing articles. You are writing **answer blocks that AI can quote.**

AI systems do not "read" content the way a human does. They scan for:
1. A clear question (explicit or implicit in the headline)
2. A direct answer within the first 200 words
3. Structured supporting evidence (bullet points, tables, defined blocks)
4. Named sources and verifiable claims
5. A focused, authoritative topic signal

If any of these are missing, the content is likely skipped in favor of a source that has all five.

---

## The Two Questions (Applied to GEO)

The same two questions from E-E-A-T apply here but with a GEO lens:

**"What is the purpose of the page?"**
For GEO: Is this page answering one specific question, or is it a general overview covering everything? AI systems prefer specific, focused answers. "The complete guide to everything about X" is worse than "The GTA 6 release date, confirmed by Rockstar."

**"Is the content high quality? Does it demonstrate E-E-A-T?"**
For GEO: Does the content contain something a human couldn't find by reading 10 other articles? A unique stat, a named source, a primary document, an original data point. AI citation systems have low information gain tolerance — they skip content that just restates what's already indexed.

---

## GEO Architecture — What Was Built

### 1. `/llms.txt` Route (`app/llms.txt/route.ts`)

The LLM-readable site manifest. Equivalent of `robots.txt` for AI systems.

Served at: `https://www.objectwire.org/llms.txt`

Tells AI systems:
- What ObjectWire covers (topic authority signals)
- Who produces the content (named authors with URLs)
- What crawlers are explicitly permitted
- How to cite content correctly
- Where to find feeds, sitemaps, editorial standards

ChatGPT's browsing mode, Perplexity, and Claude all check for `/llms.txt` when evaluating whether to cite a domain. It is referenced in `app/layout.tsx` already. The route now serves it.

### 2. `CitationBlock` component (`components/geo/CitationBlock.tsx`)

A structured answer block for a single question. Renders:
- Visual block with type badge (DEFINITION / KEY STAT / COMPARISON / TIMELINE / VERDICT)
- The direct answer in 2-4 sentences
- Optional stat callout (large number, date, figure)
- Key facts bullet list
- Source attribution with external link
- FAQPage JSON-LD schema for the Q&A pair

Every `CitationBlock` is individually schema-marked. AI systems can extract each one independently as a verified fact with attribution.

**Types:**

| Type | Use For |
|------|---------|
| `definition` | "What is X?" questions |
| `stat` | Key numbers, dates, percentages |
| `comparison` | "X vs Y", pros/cons |
| `timeline` | Sequence of events, history |
| `verdict` | Editorial conclusions backed by evidence |

### 3. `KeyTakeaways` component (`components/geo/KeyTakeaways.tsx`)

A structured bullet-point summary block. Renders:
- Visual takeaways list with accent color
- ItemList schema marking each point as a core article claim

Placement: After the opening paragraph, before the first `<h2>`. This is the highest-impact single addition to any article for GEO purposes. It is the most commonly extracted element by AI citation systems.

### 4. `DirectAnswer` component (`components/geo/DirectAnswer.tsx`)

A "Quick Answer" paragraph block. 2-4 sentences that answer the core question immediately.

Renders with:
- Green accent border and badge
- `itemProp="description"` for schema.org
- `role="region"` aria label for voice accessibility

Placement: First element in the article body, before `KeyTakeaways`, before any context or background.

### 5. `GEOArticleWrapper` component (`components/geo/GEOArticleWrapper.tsx`)

Drop-in schema wrapper for any article page. Adds:
- Enhanced `NewsArticle` schema with `speakable` specification
- `mentions` array for entity disambiguation (named people, orgs, products)
- Better `cssSelector` targeting for voice AI systems

### 6. `validate-geo.ts` (`scripts/validate-geo.ts`)

GEO signal scanner. Runs standalone:

```bash
npm run validate:geo             # Signal coverage report
npm run validate:geo --verbose   # + list of weakest pages
```

Checks 10 GEO signals across all article pages and reports:
- Signal coverage % by type
- Average GEO score (0-10)
- Strong / Moderate / Weak distribution
- Top recommendations by impact

### 7. GEO Warnings in `alfasa-sentinel.ts`

Three GEO warnings added to the E-E-A-T sentinel gate:

| Code | Check |
|------|-------|
| GEO1 | No `DirectAnswer` block detected |
| GEO2 | No `KeyTakeaways` block detected |
| GEO3 | No `CitationBlock` or `FAQAccordion` detected |

These print as warnings (not hard blocks) on every `wiki:publish`. They do not stop the publish but ensure every author sees the GEO gaps before the article goes live.

---

## The 10 GEO Signals — Full Reference

| Signal | What AI Systems Look For | How to Implement |
|--------|--------------------------|-----------------|
| **G1 Direct Answer** | Clear answer in first 200 words | `<DirectAnswer answer="..." />` as first body element |
| **G2 Key Takeaways** | Bullet-point summary | `<KeyTakeaways items={[...]} />` after opening paragraph |
| **G3 Structured Answer Units** | FAQs, Q&A blocks, citation blocks | `<CitationBlock>` per key claim + `<FAQAccordion>` at end |
| **G4 FAQ Schema** | FAQPage JSON-LD | `<FAQSchema>` or `<CitationBlock>` (both inject schema) |
| **G5 Named Author** | Verifiable authorship | `author_name` + `author_slug` → `/authors/[slug]` page |
| **G6 Speakable** | Voice AI extractability | `<GEOArticleWrapper speakableSelectors={[...]} />` |
| **G7 Keywords Depth** | Topical signal breadth | `keywords` array with 10-18 items in metadata |
| **G8 External Sources** | Citation credibility | 2+ external source links per article |
| **G9 Specific Facts** | Named entities, numbers, dates | 3+ specific figures (years, $amounts, %, metrics) |
| **G10 Topical Focus** | Single clear topic signal | Article covers one question deeply, not many topics broadly |

---

## Article Writing Format for GEO

Every article published on ObjectWire must follow this structure order:

```
1. <DirectAnswer answer="[2-4 sentences answering the core question immediately]" />

2. <KeyTakeaways items={[
     "[Specific fact 1 with number or name]",
     "[Specific fact 2 with number or name]",
     "[Specific fact 3 with number or name]",
     "[Optional 4th point]"
   ]} />

3. Opening context paragraph (where did this come from, why it matters)

4. <h2>[Specific Sub-Question | Data Point or Context]</h2>
   Body paragraphs with specific facts, named sources

5. <CitationBlock question="[Key question this section answers]" answer="[Direct answer]" type="stat|definition|etc" source="[Source name]" sourceUrl="[URL]" />

6. More body sections with H2s

7. <h2>[Related Questions | FAQ]</h2>
   <FAQAccordion items={[{ question: "...", answer: "..." }]} />
```

### What "Specific" Means

Bad: "The game will release soon and has many new features."  
Good: "Rockstar Games confirmed GTA 6 will release in fall 2025 for PS5 and Xbox Series X. The PC version has no confirmed date."

Bad: "OpenAI has been growing quickly."  
Good: "OpenAI reported $3.4 billion in annual recurring revenue as of December 2025, up from $1.6 billion in 2024."

Every sentence that contains a claim must have a number, a name, a date, or a source. Vague sentences are skipped by AI citation systems entirely.

---

## AI Crawler Status

All major AI crawlers are already permitted in `app/robots.ts`. No action needed.

| Crawler | System | Status |
|---------|--------|--------|
| `GPTBot` | ChatGPT (OpenAI) | ✅ Allowed |
| `ChatGPT-User` | ChatGPT browsing | ✅ Allowed |
| `PerplexityBot` | Perplexity AI | ✅ Allowed |
| `anthropic-ai` | Claude (Anthropic) | ✅ Allowed |
| `Claude-Web` | Claude browsing | ✅ Allowed |
| `Google-Extended` | Google Gemini/SGE | ✅ Allowed |
| `Bingbot` | Copilot (Microsoft) | ✅ Allowed |
| `cohere-ai` | Cohere | ✅ Allowed |
| `YouBot` | You.com | ✅ Allowed |
| `Applebot` | Apple Intelligence | ✅ Allowed |

---

## GEO vs E-E-A-T: How They Work Together

These are not competing systems. They are layered:

```
E-E-A-T    →  convinces Google the domain is trustworthy (domain classifier)
GEO        →  convinces AI systems the content is extractable (citation selection)

Both require:  named authors, specific facts, external citations, structured content
E-E-A-T adds: canonical URLs, publish dates, corrections policies
GEO adds:     DirectAnswer, KeyTakeaways, CitationBlocks, speakable schema, llms.txt
```

An article can pass E-E-A-T checks and fail GEO if it has no structured answer blocks. An article can have all GEO components and fail E-E-A-T if it has no author or canonical URL. Both must be present on every publish.

The `alfasa-sentinel.ts` checks both. E-E-A-T failures are hard blocks. GEO failures are warnings.

---

## Commands Reference

```bash
# GEO signal coverage report (all article pages)
npm run validate:geo

# With per-page detail on weak pages
npm run validate:geo --verbose

# Full prebuild scan (includes E-E-A-T + GEO warnings via sentinel)
npm run validate:eeat

# Session briefing (includes last-session GEO scores)
npm run alfasa
```

---

## Priority Implementation Order

These are the highest-impact GEO changes, ordered by effort vs. return:

1. **Add `DirectAnswer` + `KeyTakeaways` to the top 20 highest-traffic articles** (run `npm run alfasa` to see which have the most readers). 2 components, 20 pages = 40 additions. Highest immediate impact.

2. **Add `<FAQAccordion>` to every article in the gaming, copyright, and tech clusters.** These are the verticals where ObjectWire has most content depth. FAQ schema in clusters signals topical authority to AI systems.

3. **Add `CitationBlock` to every key stat or claim in new articles going forward.** This is a writing habit change, not a migration.

4. **Ensure `/llms.txt` is accessible** — verify `https://www.objectwire.org/llms.txt` returns a 200 after deploy.

5. **Add `mentions` to `GEOArticleWrapper` on hub pages** — list the key entities each hub covers. Hub pages are what AI systems use to understand topical authority.
