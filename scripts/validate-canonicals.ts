#!/usr/bin/env ts-node
// scripts/validate-canonicals.ts
// Prebuild guard: fails if a hardcoded canonical is detected in any layout file.
// A shared-layout canonical overrides every child page's self-canonical,
// telling Google all pages are duplicates of the homepage. (Caused April 2026 cliff.)

import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'app');
const CANONICAL_PATTERN = /canonical.*https?:\/\//i;

function scanLayouts(dir: string): string[] {
  const violations: string[] = [];
  if (!fs.existsSync(dir)) return violations;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violations.push(...scanLayouts(fullPath));
    } else if (entry.name === 'layout.tsx' || entry.name === 'layout.ts') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (CANONICAL_PATTERN.test(content)) {
        violations.push(path.relative(process.cwd(), fullPath));
      }
    }
  }
  return violations;
}

const violations = scanLayouts(appDir);

if (violations.length > 0) {
  console.error('\n\x1b[31m╔══════════════════════════════════════════════════╗');
  console.error('║     VALIDATE CANONICALS — BUILD BLOCKED         ║');
  console.error('╚══════════════════════════════════════════════════╝\x1b[0m');
  console.error('\n  Hardcoded canonical URL detected in layout file(s):');
  violations.forEach((v) => console.error(`    • ${v}`));
  console.error('\n  FIX: Remove canonical from layout files.');
  console.error('  Each page.tsx must set its own canonical via metadata.alternates.canonical.\n');
  process.exit(1);
}

console.log('✔ validate-canonicals: No layout-level canonical overrides detected.');
