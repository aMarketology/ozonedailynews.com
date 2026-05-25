#!/usr/bin/env ts-node
// scripts/validate-geo.ts
// GEO signal coverage report across all article pages.
// Usage: npx ts-node scripts/validate-geo.ts
//        npx ts-node scripts/validate-geo.ts --verbose

import fs from 'fs';
import path from 'path';

const VERBOSE = process.argv.includes('--verbose');
const staticBase = path.join(process.cwd(), 'content', 'static');

interface GEOResult {
  slug: string;
  score: number;
  signals: Record<string, boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scoreArticle(article: Record<string, any>): GEOResult {
  const html = article.content_html ?? '';
  const htmlLower = html.toLowerCase();

  const signals = {
    G1_DirectAnswer: html.includes('DirectAnswer') || html.includes('Quick Answer') || html.includes('direct-answer'),
    G2_KeyTakeaways: html.includes('KeyTakeaways') || html.includes('Key Takeaways') || html.includes('key-takeaways'),
    G3_CitationBlock: html.includes('CitationBlock') || html.includes('FAQAccordion') || html.includes('FAQPage'),
    G4_FAQSchema:     html.includes('@type') && html.includes('FAQPage'),
    G5_NamedAuthor:   Boolean(article.author_name && article.author_slug),
    G6_Speakable:     html.includes('speakable') || html.includes('GEOArticleWrapper'),
    G7_KeywordsDepth: Array.isArray(article.metadata?.keywords) && article.metadata.keywords.length >= 10,
    G8_ExternalSources: (html.match(/href="https?:\/\//g) ?? []).length >= 2,
    G9_SpecificFacts: /\d{4}|\$[\d,]+|[\d.]+%/.test(html),
    G10_TopicalFocus:  Boolean(article.tags?.length >= 4),
  };

  const score = Object.values(signals).filter(Boolean).length;
  return { slug: article.slug ?? 'unknown', score, signals };
}

function readArticleStore(table: string): GEOResult[] {
  const dir = path.join(staticBase, table);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== '_index.json')
    .map((f) => {
      try {
        const a = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        return scoreArticle(a);
      } catch {
        return null;
      }
    })
    .filter((r): r is GEOResult => r !== null);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const stores = ['articles', 'jack_articles', 'article_pages'];
const allResults: GEOResult[] = [];

for (const store of stores) {
  allResults.push(...readArticleStore(store));
}

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║         VALIDATE GEO — SIGNAL COVERAGE          ║');
console.log('╚══════════════════════════════════════════════════╝\n');

if (allResults.length === 0) {
  console.log('  No articles found in content/static/. Publish articles first.\n');
  process.exit(0);
}

const avg = allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length;
const strong = allResults.filter((r) => r.score >= 8).length;
const moderate = allResults.filter((r) => r.score >= 5 && r.score < 8).length;
const weak = allResults.filter((r) => r.score < 5).length;

// Signal coverage
const signalNames = ['G1_DirectAnswer', 'G2_KeyTakeaways', 'G3_CitationBlock', 'G4_FAQSchema',
  'G5_NamedAuthor', 'G6_Speakable', 'G7_KeywordsDepth', 'G8_ExternalSources',
  'G9_SpecificFacts', 'G10_TopicalFocus'] as const;

console.log(`  Articles analyzed: ${allResults.length}`);
console.log(`  Average GEO score: ${avg.toFixed(1)}/10`);
console.log(`  Strong (8-10): ${strong}  Moderate (5-7): ${moderate}  Weak (0-4): ${weak}\n`);
console.log('  Signal Coverage:');
for (const sig of signalNames) {
  const count = allResults.filter((r) => r.signals[sig as keyof typeof r.signals]).length;
  const pct = Math.round((count / allResults.length) * 100);
  const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '░');
  console.log(`    ${sig.padEnd(22)} ${bar} ${pct}%`);
}

if (VERBOSE && weak > 0) {
  console.log('\n  Weakest articles (GEO score < 5):');
  allResults
    .filter((r) => r.score < 5)
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .forEach((r) => {
      const missing = Object.entries(r.signals)
        .filter(([, v]) => !v)
        .map(([k]) => k)
        .join(', ');
      console.log(`    • ${r.slug} (${r.score}/10) — missing: ${missing}`);
    });
}

console.log('');
