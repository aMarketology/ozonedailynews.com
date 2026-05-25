#!/usr/bin/env ts-node
// scripts/validate-public.ts
// Prebuild guard: fails if robots.txt or sitemap.xml exist in /public.
// Next.js serves /public BEFORE App Router handlers — they silently override
// app/robots.ts and app/sitemap.ts.

import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const FORBIDDEN = ['robots.txt', 'sitemap.xml'];

const violations: string[] = [];

for (const file of FORBIDDEN) {
  if (fs.existsSync(path.join(publicDir, file))) {
    violations.push(`public/${file}`);
  }
}

if (violations.length > 0) {
  console.error('\n\x1b[31m╔══════════════════════════════════════════════════╗');
  console.error('║     VALIDATE PUBLIC — BUILD BLOCKED             ║');
  console.error('╚══════════════════════════════════════════════════╝\x1b[0m');
  console.error('\n  Forbidden file(s) detected in /public:');
  violations.forEach((v) => console.error(`    • ${v}`));
  console.error('\n  FIX: Delete these files. app/robots.ts and app/sitemap.ts are the sources of truth.');
  console.error('  Emergency override: OzoneNews_OVERRIDE=true npm run build\n');

  if (process.env.OzoneNews_OVERRIDE !== 'true') {
    process.exit(1);
  } else {
    console.warn('  OzoneNews_OVERRIDE=true: Skipping validation. Use only in emergencies.\n');
  }
} else {
  console.log('✔ validate-public: No forbidden files in /public.');
}
