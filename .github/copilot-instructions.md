# OzoneNews | Copilot Instructions (OStandard)
# Layer 4 — Editorial gate enforced at the writing stage.
# These rules apply to EVERY Copilot request in this workspace.

applyTo: "**"

---

## Em Dash Zero-Tolerance (ABSOLUTE — no exceptions)

NEVER use em dashes (—) or en dashes (–) anywhere:
- Titles, headings, subtitles
- metadata.title, metadata.description
- Article body prose
- JSX string literals
- openGraph.title, openGraph.description
- JSON content fields
- Code comments

CORRECT alternatives:
| Wrong | Correct |
|---|---|
| `Title — Subtitle` | `Title \| Subtitle` |
| `The update — which ships Friday — adds X` | `The update, which ships Friday, adds X` |
| `Record sales — 5M in 48h` | `Record sales, 5M in 48 hours` |
| `New feature — here's what changed` | `New feature, here is what changed` |

## metadata.title Rules

- Max 60 characters
- Format: `Primary Keyword | Specific Detail`
- No brand suffix (no "| OzoneNews" at the end)
- No em dashes, no en dashes
- `&` is ALLOWED in metadata.title only

## metadata.description Rules

- 130-155 characters (hard limits)
- Primary keyword must appear in first 60 characters
- No generic phrases ("learn more", "find out", "comprehensive guide")
- No AI boilerplate

## Banned AI Boilerplate Phrases (build fails on any occurrence)

These phrases trigger Google's HCU classifier. Never write them:
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

## Link Styling (Non-Negotiable)

Every link in article prose must be blue and underlined:

```tsx
// Internal links
<Link href="/path" className="text-blue-600 hover:text-blue-800 underline">
  Link text
</Link>

// External links
<a href="https://source.com" target="_blank" rel="noopener noreferrer"
   className="text-blue-600 hover:text-blue-800 underline">
  Source text
</a>
```

Inside content_html strings, use `class=` not `className=`.
NEVER render linked text as unstyled or black.
NEVER omit `target="_blank" rel="noopener noreferrer"` on external links.

## Author Rules

- Every article needs a named author (author_name + author_slug)
- author_slug must point to an existing /authors/[slug] page
- If author has no external footprint, use "OzoneNews Editorial Team" (slug: ozonedailynews-editorial-team)
- Author schema: `{ "@type": "Person", "name": "...", "url": "...", "sameAs": [...] }`

## Timestamp Rules

- published_at: full ISO-8601 with timezone offset
  CORRECT: `2026-05-25T14:00:00-05:00`
  WRONG: `2026-05-25` (date-only is banned)
- publish_date: display string `"May 25, 2026"` (for UI only)

## Article Minimum Requirements

Every published article must have:
1. author_name + author_slug
2. published_at (ISO-8601)
3. 300+ words in content_html
4. At least one <h2> in content_html
5. metadata.description: 130-155 chars
6. canonical URL in metadata.alternates.canonical
7. 4+ internal links
8. 1+ external source link
9. 4-8 tags (proper nouns only)
10. thumbnail_src (for Google Top Stories eligibility)

## GEO Article Structure (always follow this order)

```
1. <DirectAnswer answer="[2-4 sentences answering the core question]" />
2. <KeyTakeaways items={["Specific fact 1", "Specific fact 2", "Specific fact 3"]} />
3. Opening context paragraph
4. <h2>[Specific Sub-Question | Data Point]</h2>
   Body with named sources, specific figures
5. <CitationBlock question="..." answer="..." type="stat|definition|etc" source="..." sourceUrl="..." />
6. More body sections with H2s
7. <h2>Frequently Asked Questions</h2>
   <FAQAccordion items={[{ question: "...", answer: "..." }]} />
```

## Heading Rules

- Use `|` as separator, NEVER `:`
- Subheadings must be specific: "GTA 6 Release Date | Confirmed by Rockstar" not "Overview"
- Banned heading words: "Background", "Overview", "Introduction", "Conclusion"
- No `&` in H1/H2/H3 headings (only in metadata.title/openGraph.title)

## Category Values (only these are valid)

News, Tech, Finance, Entertainment, World, Politics, Science, Sports, Culture, Crypto, Gaming

## URL / Slug Rules

- Lowercase, hyphen-only, no stop words
- Slug format: `app/category/my-article/page.tsx` → slug: `category-my-article`
- The slug in page.tsx and the JSON filename must be identical

## Publishing Workflow

1. Write page.tsx stub with full metadata (title, description, keywords, canonical, openGraph, twitter)
2. Write static JSON at content/static/{type}/{slug}.json
3. Run: `npm run wiki:sync -- --write` (registers in content_registry.json)
4. Run: `npm run alfasa` (session briefing confirms quality)
5. Commit: `git add -A && git commit -m "publish: [article title]" && git push`

## Trust Pages (must exist and be linked in footer)

- /about
- /editorial-standards
- /corrections
- /contact

All four must be visible blue-underlined links in the global footer "Newsroom Policies" row.

## Never Do

- NEVER add canonical to app/layout.tsx or any shared layout
- NEVER put robots.txt or sitemap.xml in /public
- NEVER use lib/seo.ts (deleted — use @/lib/site-config)
- NEVER use Supabase for new article writes (static JSON is source of truth)
- NEVER use any *DB component without a matching static JSON file
- NEVER publish without a content_registry.json entry
