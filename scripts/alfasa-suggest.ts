#!/usr/bin/env ts-node
// scripts/alfasa-suggest.ts
// LAYER 3: Session briefing. Run at session start via: npm run alfasa
// Reads local files only. Zero network calls. Prints editorial context.

import fs from 'fs';
import path from 'path';

const SESSION_LOG = path.join(process.cwd(), '.alfasa', 'session_log.json');
const REGISTRY_PATH = path.join(process.cwd(), 'content', 'static', 'content_registry.json');

// ─── Load data ────────────────────────────────────────────────────────────────

interface SessionEntry {
  date: string;
  slug: string;
  eeaScore?: number;
  eeaGrade?: string;
  sentinelPassed?: boolean;
  skippedSentinel?: boolean;
  warnings?: number;
}

let sessionLog: SessionEntry[] = [];
try {
  sessionLog = JSON.parse(fs.readFileSync(SESSION_LOG, 'utf8'));
} catch {
  sessionLog = [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let registry: any[] = [];
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch {
  registry = [];
}

// ─── Output ───────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║              ALFASA SESSION BRIEFING                        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

// Recent publishes
const recent = sessionLog.slice(-5).reverse();
if (recent.length > 0) {
  console.log('\n  Recent Publishes:');
  for (const entry of recent) {
    const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const grade = entry.eeaGrade ?? '?';
    const passed = entry.sentinelPassed ? '✔' : entry.skippedSentinel ? '⚠ BYPASS' : '✖';
    const warns = entry.warnings ?? 0;
    console.log(`    ${passed}  ${date}  Grade:${grade}  Warnings:${warns}  ${entry.slug}`);
  }
}

// Rolling E-E-A-T average
const scoredEntries = sessionLog.slice(-10).filter((e) => e.eeaScore !== undefined);
if (scoredEntries.length > 0) {
  const avg = scoredEntries.reduce((sum, e) => sum + (e.eeaScore ?? 0), 0) / scoredEntries.length;
  const grade = avg >= 85 ? 'A' : avg >= 70 ? 'B' : avg >= 55 ? 'C' : avg >= 40 ? 'D' : 'F';
  const bar = '█'.repeat(Math.round(avg / 5)).padEnd(20, '░');
  console.log(`\n  Avg E-E-A-T (last 10): ${bar} ${avg.toFixed(0)}/100  Grade: ${grade}`);
}

// Registry stats
if (registry.length > 0) {
  const news     = registry.filter((e: { lifecycle: string }) => e.lifecycle === 'news').length;
  const review   = registry.filter((e: { lifecycle: string }) => e.lifecycle === 'review').length;
  const featured = registry.filter((e: { lifecycle: string }) => e.lifecycle === 'feature').length;
  console.log(`\n  Content Registry: ${registry.length} total | ${news} news | ${review} in review | ${featured} featured`);
}

// OStandard reminders
console.log('\n  OStandard Quick Reminders:');
console.log('    • NO em dashes (—) or en dashes (–). Use | in headings, , in prose.');
console.log('    • All links: class="text-blue-600 hover:text-blue-800 underline"');
console.log('    • metadata.title: max 60 chars, Primary Keyword | Specific Detail');
console.log('    • metadata.description: 130-155 chars, primary keyword in first 60');
console.log('    • Every article: min 4 internal links + 1 external source link');
console.log('    • GEO: DirectAnswer first, KeyTakeaways second, CitationBlock per claim');

console.log('\n  Quick commands:');
console.log('    npm run wiki:sync -- --write   (register new articles)');
console.log('    npm run validate:geo            (GEO signal coverage)');
console.log('    npm run validate:eeat           (E-E-A-T prebuild scan)');
console.log('    npm run lifecycle:check         (flag 48h+ news → review)');
console.log('');
