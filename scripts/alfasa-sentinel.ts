#!/usr/bin/env ts-node
// scripts/alfasa-sentinel.ts
// LAYER 1 E-E-A-T PUBLISH GATE
// Runs before every publish. Hard blocks + E-E-A-T score on every article.
// Usage: npx ts-node scripts/alfasa-sentinel.ts --file path/to/json
//        npx ts-node scripts/alfasa-sentinel.ts --file path/to/json --skip-sentinel

import fs from 'fs';
import path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const KNOWN_AUTHORS: string[] = [
  // Add new authors here when their /authors/[slug]/page.tsx is created
  'max-deleonardis',
  'simon-minter',
  'ozonedailynews-editorial-team',
];

const AI_BOILERPLATE = [
  'delve into',
  'it is worth noting',
  'in conclusion',
  'it is important to note',
  'it is important to remember',
  'furthermore, it is crucial',
  "in today's fast-paced world",
  'in the ever-evolving landscape',
  'it is worth noting that',
  'moreover, it should be noted',
  'navigating the complex',
  'in summary',
];

const EM_DASH_REGEX = /[—–]/;

// ─── Arg parsing ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const fileFlag = args.indexOf('--file');
const skipSentinel = args.includes('--skip-sentinel');

if (fileFlag === -1 || !args[fileFlag + 1]) {
  console.error('Usage: npx ts-node scripts/alfasa-sentinel.ts --file path/to/article.json');
  process.exit(1);
}

const filePath = path.resolve(args[fileFlag + 1]);

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// ─── Load article ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const article: Record<string, any> = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ─── Bypass path ─────────────────────────────────────────────────────────────

if (skipSentinel) {
  console.log('\n⚠️  SENTINEL BYPASSED — --skip-sentinel flag detected.');
  console.log('   This bypass is logged. Use only for genuine breaking-news emergencies.\n');
  logToSession(article.slug ?? path.basename(filePath), true);
  process.exit(0);
}

// ─── Hard block checks ────────────────────────────────────────────────────────

const hardBlocks: string[] = [];
const warnings: string[] = [];

// H1: Named author
if (!article.author_name || !article.author_slug) {
  hardBlocks.push('H1: Missing author_name or author_slug. Named authorship is the #1 E-E-A-T signal.');
}

// H2: ISO-8601 timestamp
if (!article.published_at || !/^\d{4}-\d{2}-\d{2}T/.test(article.published_at)) {
  hardBlocks.push('H2: published_at missing or not ISO-8601. Required for NewsArticle schema and Top Stories.');
}

// H3: Word count > 300
const wordCount = countWords(article.content_html ?? '');
if (wordCount < 300) {
  hardBlocks.push(`H3: Word count ${wordCount} is under 300. Thin content triggers HCU classifier.`);
}

// H4: Em dash / en dash in title
const titleText = article.title ?? '';
const subtitleText = article.subtitle ?? '';
if (EM_DASH_REGEX.test(titleText) || EM_DASH_REGEX.test(subtitleText)) {
  hardBlocks.push('H4: Em dash or en dash detected in title/subtitle. OStandard zero-tolerance.');
}

// H5: Meta description
const desc = article.metadata?.description ?? '';
if (!desc || desc.length < 130) {
  hardBlocks.push(`H5: metadata.description missing or under 130 chars (${desc.length}). Short descriptions signal thin content.`);
}

// H6: Canonical URL
const canonical = article.metadata?.alternates?.canonical ?? '';
if (!canonical) {
  hardBlocks.push('H6: No canonical URL in metadata.alternates.canonical. Non-negotiable for Google.');
}

// H7: H2 headings
if (!/<h2/i.test(article.content_html ?? '')) {
  hardBlocks.push('H7: No <h2> in content_html. Unstructured wall of text = poor E-E-A-T.');
}

// H8: AI boilerplate
const contentLower = (article.content_html ?? '').toLowerCase();
for (const phrase of AI_BOILERPLATE) {
  if (contentLower.includes(phrase)) {
    hardBlocks.push(`H8: AI boilerplate phrase detected: "${phrase}". HCU classifier signal.`);
    break;
  }
}

// ─── Warning checks ───────────────────────────────────────────────────────────

// W1: Word count 300-599
if (wordCount >= 300 && wordCount < 600) {
  warnings.push(`W1: Word count ${wordCount} is under 600. Target 800+ for best E-E-A-T.`);
}

// W2: Internal links
const internalLinks = (article.content_html ?? '').match(/href="\/[^"]+"/g) ?? [];
if (internalLinks.length < 4) {
  warnings.push(`W2: Only ${internalLinks.length} internal links. Minimum 4 required (hub + 2 siblings + author).`);
}

// W3: Description over 155
if (desc.length > 155) {
  warnings.push(`W3: metadata.description is ${desc.length} chars. Trim to 130-155.`);
}

// W4: Tags
const tags = Array.isArray(article.tags) ? article.tags : [];
if (tags.length < 4) {
  warnings.push(`W4: Only ${tags.length} tags. Minimum 4 required.`);
}

// W5: Thumbnail
if (!article.thumbnail_src) {
  warnings.push('W5: No thumbnail_src. Article is ineligible for Google Top Stories.');
}

// W6: H2 count
const h2Count = (article.content_html ?? '').match(/<h2/gi)?.length ?? 0;
if (h2Count === 1) {
  warnings.push('W6: Only 1 <h2> heading. Target 3+ for strong topical structure.');
}

// W7: Title length
const titleMeta = article.metadata?.title ?? titleText;
if (titleMeta.length > 60) {
  warnings.push(`W7: metadata.title is ${titleMeta.length} chars. Keep under 60 to avoid SERP truncation.`);
}

// W8: External links
const externalLinks = (article.content_html ?? '').match(/href="https?:\/\//g) ?? [];
if (externalLinks.length < 1) {
  warnings.push('W8: No external source links. YMYL categories flagged harder without citations.');
}

// W9: Known author check
if (article.author_slug && !KNOWN_AUTHORS.includes(article.author_slug)) {
  warnings.push(`W9: author_slug "${article.author_slug}" not in KNOWN_AUTHORS. Create /authors/${article.author_slug}/page.tsx.`);
}

// ─── GEO warnings ─────────────────────────────────────────────────────────────

const html = article.content_html ?? '';
if (!html.includes('DirectAnswer') && !html.includes('direct-answer') && !html.includes('Quick Answer')) {
  warnings.push('GEO1: No DirectAnswer block detected. Add <DirectAnswer> as first body element.');
}
if (!html.includes('KeyTakeaways') && !html.includes('key-takeaways') && !html.includes('Key Takeaways')) {
  warnings.push('GEO2: No KeyTakeaways block detected. Add <KeyTakeaways> after opening paragraph.');
}
if (!html.includes('CitationBlock') && !html.includes('FAQAccordion') && !html.includes('FAQPage')) {
  warnings.push('GEO3: No CitationBlock or FAQAccordion detected. Add structured answer units per GEO spec.');
}

// ─── E-E-A-T Score ────────────────────────────────────────────────────────────

let score = 0;

// Experience (0-20)
if (article.author_name && article.author_slug) score += 8;
if (article.author_slug && KNOWN_AUTHORS.includes(article.author_slug)) score += 7;
if (externalLinks.length >= 2) score += 5;

// Expertise (0-20)
if (wordCount >= 800) score += 10;
else if (wordCount >= 600) score += 6;
else if (wordCount >= 300) score += 3;
if (h2Count >= 3) score += 6;
else if (h2Count >= 2) score += 3;
const hasAIPhrase = AI_BOILERPLATE.some((p) => contentLower.includes(p));
if (!hasAIPhrase) score += 4;

// Authoritativeness (0-30)
if (tags.length >= 4) score += 8;
if (article.thumbnail_src) score += 8;
if (internalLinks.length >= 4) score += 8;
if (externalLinks.length >= 2) score += 6;

// Trustworthiness (0-30)
if (article.published_at && /^\d{4}-\d{2}-\d{2}T/.test(article.published_at)) score += 8;
if (canonical) score += 8;
if (desc.length >= 130 && desc.length <= 155) score += 7;
if (titleMeta.length <= 60) score += 7;

const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

// ─── Output ───────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║         ALFASA SENTINEL — E-E-A-T GATE          ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log(`\n  Article: ${article.title ?? path.basename(filePath)}`);
console.log(`  Author:  ${article.author_name ?? 'MISSING'}`);
console.log(`  Words:   ${wordCount}`);
console.log(`\n  E-E-A-T Score: ${score}/100  (Grade: ${grade})\n`);

if (hardBlocks.length > 0) {
  console.log('  ✖ HARD BLOCKS (publish aborted):');
  hardBlocks.forEach((b) => console.log(`    • ${b}`));
}

if (warnings.length > 0) {
  console.log('\n  ⚠ WARNINGS:');
  warnings.forEach((w) => console.log(`    • ${w}`));
}

if (hardBlocks.length === 0) {
  console.log('\n  ✔ All hard block checks passed.');
}

console.log('\n──────────────────────────────────────────────────\n');

if (hardBlocks.length > 0) {
  console.log('PUBLISH ABORTED. Fix all hard blocks before publishing.\n');
  process.exit(1);
}

// ─── Log successful publish ───────────────────────────────────────────────────

logToSession(article.slug ?? path.basename(filePath), false, score, grade, warnings.length);
console.log('SENTINEL PASSED. Article cleared for publish.\n');
process.exit(0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWords(html: string): number {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0).length;
}

function logToSession(slug: string, skipped: boolean, eeaScore = 0, eeaGrade = 'F', warningCount = 0) {
  const logPath = path.join(process.cwd(), '.alfasa', 'session_log.json');
  let log: unknown[] = [];
  try {
    log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  } catch {
    log = [];
  }

  log.push({
    date: new Date().toISOString(),
    slug,
    eeaScore,
    eeaGrade,
    sentinelPassed: !skipped && hardBlocks.length === 0,
    skippedSentinel: skipped,
    warnings: warningCount,
  });

  // Rolling window of 50
  if (log.length > 50) log = log.slice(-50);

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
}
