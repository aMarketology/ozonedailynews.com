#!/usr/bin/env ts-node
/**
 * scripts/last-articles.ts — Alfanso | Last Articles
 *
 * Reads content_registry.json and prints the most recently published articles.
 * Sorts by modifiedDate (fallback: publishDate), newest first.
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 *   npm run last                  — last 3 articles (default)
 *   npm run last -- 5             — last 5 articles
 *   npm run last -- 10 --json     — last 10, raw JSON output
 *   npm run last -- --all         — all articles, newest first
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegistryEntry {
  slug: string;
  filePath?: string;
  title: string;
  description?: string;
  subtitle?: string;
  publishDate?: string;
  modifiedDate?: string;
  category?: string;
  author?: string;
  authorSlug?: string;
  author_slug?: string;
  articleType?: string;
  tags?: string[];
  imageUrl?: string;
  thumbnail_src?: string;
  url?: string;
  breaking?: boolean;
  lifecycle?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const REGISTRY_PATH = path.join(process.cwd(), 'content', 'static', 'content_registry.json');

function loadRegistry(): RegistryEntry[] {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('content_registry.json not found. Run: npm run wiki:sync -- --write');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) as RegistryEntry[];
}

/** Parse a date string that could be ISO-8601 or display format like "August 3, 2026" */
function parseDate(raw: string | undefined): Date {
  if (!raw) return new Date(0);
  // Try ISO first
  const iso = new Date(raw);
  if (!isNaN(iso.getTime())) return iso;
  // Try display format: "August 3, 2026"
  const display = new Date(raw.replace(/(\w+)\s(\d{1,2}),\s(\d{4})/, '$1 $2, $3'));
  if (!isNaN(display.getTime())) return display;
  return new Date(0);
}

/** Get the best available date for sorting: modifiedDate > publishDate */
function getSortDate(entry: RegistryEntry): Date {
  const mod = parseDate(entry.modifiedDate);
  if (mod.getTime() > 0) return mod;
  return parseDate(entry.publishDate);
}

function fmtDate(d: Date): string {
  if (d.getTime() === 0) return 'Unknown date';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function fmtRelative(d: Date): string {
  if (d.getTime() === 0) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '(today)';
  if (diffDays === 1) return '(yesterday)';
  if (diffDays < 7) return `(${diffDays} days ago)`;
  if (diffDays < 30) return `(${Math.floor(diffDays / 7)} weeks ago)`;
  return '';
}

function getAuthor(entry: RegistryEntry): string {
  return entry.author ?? entry.authorSlug ?? entry.author_slug ?? 'Unknown';
}

function getCategory(entry: RegistryEntry): string {
  return entry.category ?? 'Uncategorized';
}

function getType(entry: RegistryEntry): string {
  const t = entry.articleType ?? '';
  if (t === 'JackArticle') return 'jack';
  if (t === 'NewsArticle') return 'news';
  if (t === 'WikiArticle') return 'wiki';
  if (t === 'ArticlePage') return 'page';
  if (t === 'CreatorArticle') return 'creator';
  if (t === 'SterlingArticle') return 'sterling';
  return t.toLowerCase();
}

function getSlug(entry: RegistryEntry): string {
  // Strip leading slash for display
  return (entry.slug ?? '').replace(/^\//, '');
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  // Parse flags
  const jsonOutput = args.includes('--json');
  const showAll = args.includes('--all');
  const countArg = args.find((a) => /^\d+$/.test(a));
  const count = showAll ? Infinity : (countArg ? parseInt(countArg, 10) : 3);

  const registry = loadRegistry();

  if (registry.length === 0) {
    console.log('No articles in registry.');
    process.exit(0);
  }

  // Sort by date, newest first
  const sorted = [...registry].sort((a, b) => {
    return getSortDate(b).getTime() - getSortDate(a).getTime();
  });

  const top = sorted.slice(0, count);

  if (jsonOutput) {
    console.log(JSON.stringify(top, null, 2));
    return;
  }

  // ── Pretty output ───────────────────────────────────────────────────────────
  console.log(`\n  📰  Last ${top.length} Article${top.length !== 1 ? 's' : ''}  |  Alfanso\n`);
  console.log(`  Registry: ${registry.length} total entries\n`);

  top.forEach((entry, i) => {
    const date = getSortDate(entry);
    const type = getType(entry);
    const typeBadge = type === 'jack' ? '🔬' : type === 'news' ? '📰' : type === 'wiki' ? '📖' : '📄';

    console.log(`  ${'─'.repeat(60)}`);
    console.log(`  ${i + 1}.  ${typeBadge} ${entry.title}`);
    console.log(`      Slug:      ${getSlug(entry)}`);
    console.log(`      Category:  ${getCategory(entry)}  |  Type: ${type}  |  Author: ${getAuthor(entry)}`);
    console.log(`      Published: ${fmtDate(date)} ${fmtRelative(date)}`);
    if (entry.filePath) {
      console.log(`      File:      content/static/${entry.filePath}`);
    }
    if (entry.tags && entry.tags.length > 0) {
      console.log(`      Tags:      ${entry.tags.join(', ')}`);
    }
  });

  console.log(`\n  ${'─'.repeat(60)}`);
  console.log(`\n  💡  npm run alfanso          — scaffold a new article`);
  console.log(`  💡  npm run last -- 5        — show last 5`);
  console.log(`  💡  npm run last -- --json   — machine-readable output\n`);
}

main();