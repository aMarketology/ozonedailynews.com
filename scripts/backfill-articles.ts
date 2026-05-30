#!/usr/bin/env ts-node
// scripts/backfill-articles.ts
// Reads all static article JSON files and upserts them into Supabase
// articles table with status='published'.  Safe to re-run (upsert on slug).
//
// Processes in order:
//   1. content/static/articles/     → news_article (or whatever article_type is set)
//   2. content/static/jack_articles/ → jack_article (overwrites duplicates with richer version)
//
// Usage:
//   npx dotenv-cli -e .env -- npx ts-node --project tsconfig.scripts.json scripts/backfill-articles.ts

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase (service role, bypasses RLS) ────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── Sources (processed in order — later overwrites earlier on slug conflict) ──
const SOURCES: Array<{ dir: string; defaultType: string }> = [
  { dir: path.join(process.cwd(), 'content', 'static', 'articles'),      defaultType: 'news_article' },
  { dir: path.join(process.cwd(), 'content', 'static', 'jack_articles'), defaultType: 'jack_article' },
];

// ─── Map a raw JSON blob → articles table row ─────────────────────────────────
function toRow(article: Record<string, unknown>, defaultType: string) {
  const slug = (article.slug as string) || '';

  // For jack articles, stash all the extra fields (timeline, sources, etc.) in extra
  const knownKeys = new Set([
    'id','slug','url','article_url','article_type','title','subtitle','category',
    'status','brand_slug','breaking','trending','topic_tag','content_html',
    'publish_date','publish_date_iso','published_at','modified_date_iso',
    'author_name','author_slug','author','read_time','thumbnail_src','thumbnail_alt',
    'tags','metadata','extra',
  ]);
  const extra: Record<string, unknown> = { ...(article.extra as Record<string, unknown> ?? {}) };
  for (const [k, v] of Object.entries(article)) {
    if (!knownKeys.has(k)) extra[k] = v;
  }

  return {
    slug,
    url:          (article.url ?? article.article_url ?? `https://www.ozonedailynews.com/${slug}`) as string,
    article_type: (article.article_type ?? defaultType) as string,
    title:        (article.title        ?? '') as string,
    subtitle:     (article.subtitle     ?? null) as string | null,
    category:     (article.category     ?? 'News') as string,
    status:       'published' as const,
    brand_slug:   (article.brand_slug   ?? 'ozone') as string,
    breaking:     (article.breaking     ?? false) as boolean,
    trending:     (article.trending     ?? false) as boolean,
    topic_tag:    (article.topic_tag    ?? null) as string | null,
    content_html: (article.content_html ?? '') as string,
    publish_date: (article.publish_date ?? '') as string,
    published_at: (article.published_at ?? new Date().toISOString()) as string,
    author_name:  (article.author_name  ?? 'OzoneNews Editorial Team') as string,
    author_slug:  (article.author_slug  ?? 'ozonedailynews-editorial-team') as string,
    read_time:    (article.read_time    ?? null) as string | null,
    thumbnail_src:(article.thumbnail_src ?? null) as string | null,
    thumbnail_alt:(article.thumbnail_alt ?? null) as string | null,
    tags:         (Array.isArray(article.tags) ? article.tags : []) as string[],
    metadata:     (article.metadata     ?? null) as Record<string, unknown> | null,
    extra:        Object.keys(extra).length > 0 ? extra : {},
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const { dir, defaultType } of SOURCES) {
    if (!fs.existsSync(dir)) {
      console.log(`  (skipping missing dir: ${dir})`);
      continue;
    }

    const files = fs.readdirSync(dir).filter(
      (f) => f.endsWith('.json') && f !== '_index.json'
    );

    console.log(`\n📂  ${path.relative(process.cwd(), dir)}  (${files.length} files)`);

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      let article: Record<string, unknown>;

      try {
        article = JSON.parse(raw);
      } catch (e) {
        console.error(`  SKIP  ${file} — invalid JSON: ${e}`);
        skipped++;
        continue;
      }

      const row = toRow(article, defaultType);

      if (!row.slug) {
        console.error(`  SKIP  ${file} — missing slug`);
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('articles')
        .upsert(row, { onConflict: 'slug' });

      if (error) {
        console.error(`  FAIL  ${row.slug}`);
        console.error(`        ${error.message}`);
        failed++;
      } else {
        console.log(`  OK    ${row.slug}`);
        ok++;
      }
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`  Imported : ${ok}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Failed   : ${failed}`);
  console.log(`─────────────────────────────────`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
