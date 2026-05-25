#!/usr/bin/env ts-node
// scripts/validate-eeat.ts
// LAYER 2: Prebuild scanner. Checks metadata quality across all page.tsx files.
// Does NOT block build by default. Set EEAT_STRICT=true to fail on criticals.
// Usage: npx ts-node scripts/validate-eeat.ts
//        EEAT_STRICT=true npx ts-node scripts/validate-eeat.ts

import fs from 'fs';
import path from 'path';

const STRICT = process.env.EEAT_STRICT === 'true';
const EM_DASH_REGEX = /[—–]/;
const appDir = path.join(process.cwd(), 'app');

interface ScanResult {
  file: string;
  criticals: string[];
  warnings: string[];
}

const results: ScanResult[] = [];

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip admin, api, and Next.js internals
      if (['admin', 'api', 'node_modules', '.next'].includes(entry.name)) continue;
      scanDir(fullPath);
    } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      scanPage(fullPath);
    }
  }
}

function scanPage(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('metadata')) return; // No metadata export, skip

  const criticals: string[] = [];
  const warnings: string[] = [];

  // Extract title string
  const titleMatch = content.match(/title[:\s]*['"`]([^'"`]+)['"`]/);
  const titleStr = titleMatch?.[1] ?? '';

  // Extract description string
  const descMatch = content.match(/description[:\s]*['"`]([^'"`]+)['"`]/);
  const descStr = descMatch?.[1] ?? '';

  // C1: Em dash in title
  if (titleStr && EM_DASH_REGEX.test(titleStr)) {
    criticals.push(`Em dash in metadata.title: "${titleStr}"`);
  }

  // C2: No canonical
  if (!content.includes('canonical')) {
    criticals.push('No canonical URL found in metadata.alternates');
  }

  // C3: Description missing or very short
  if (!descStr || descStr.length < 50) {
    criticals.push(`metadata.description missing or under 50 chars (${descStr.length})`);
  }

  // W1: Title over 60 chars
  if (titleStr.length > 60) {
    warnings.push(`metadata.title is ${titleStr.length} chars (max 60)`);
  }

  // W2: Description over 155
  if (descStr.length > 155) {
    warnings.push(`metadata.description is ${descStr.length} chars (max 155)`);
  }

  // W3: Description under 130
  if (descStr.length > 0 && descStr.length < 130) {
    warnings.push(`metadata.description is ${descStr.length} chars (target 130-155)`);
  }

  // W4: No keywords
  if (!content.includes('keywords')) {
    warnings.push('No keywords array in metadata');
  }

  // W5: No openGraph on article pages
  if (content.includes('NewsArticleDB') || content.includes('JackArticleDB')) {
    if (!content.includes('openGraph')) {
      warnings.push('Article page missing openGraph block');
    }
  }

  if (criticals.length > 0 || warnings.length > 0) {
    const rel = path.relative(process.cwd(), filePath);
    results.push({ file: rel, criticals, warnings });
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

scanDir(appDir);

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║         VALIDATE E-E-A-T — PREBUILD SCAN        ║');
console.log('╚══════════════════════════════════════════════════╝\n');

if (results.length === 0) {
  console.log('  ✔ All scanned pages pass E-E-A-T metadata checks.\n');
} else {
  let criticalCount = 0;
  for (const r of results) {
    if (r.criticals.length > 0) {
      console.log(`\n  \x1b[31m✖ CRITICAL — ${r.file}\x1b[0m`);
      r.criticals.forEach((c) => {
        console.log(`    • ${c}`);
        criticalCount++;
      });
    }
    if (r.warnings.length > 0) {
      console.log(`\n  \x1b[33m⚠ WARNING — ${r.file}\x1b[0m`);
      r.warnings.forEach((w) => console.log(`    • ${w}`));
    }
  }

  console.log(`\n  Scanned pages with issues: ${results.length}`);
  console.log(`  Critical issues: ${criticalCount}\n`);

  if (STRICT && criticalCount > 0) {
    console.log('\x1b[31m  EEAT_STRICT=true: Build failed due to critical E-E-A-T issues.\x1b[0m\n');
    process.exit(1);
  }
}
