// scripts/backfill-registry.ts
// One-time migration: give every legacy article an immutable UUID,
// write it to content/articles/[uuid].json, and register it in Supabase.
//
// Safe to re-run: UUIDs are deterministic (v5 of the article's URL path),
// so re-running will UPSERT the same rows and overwrite the same files — no duplicates.
//
// Run with:
//   npx ts-node --project tsconfig.scripts.json scripts/backfill-registry.ts
//
// Required env vars (can be in .env.local):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { v5 as uuidv5 } from 'uuid';

// ─── Config ───────────────────────────────────────────────────────────────────

// Load .env.local manually (ts-node doesn't auto-load Next.js env files)
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
  break;
}

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// UUID v5 namespace — URL namespace (RFC 4122), same as the routing layer uses
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// ─── Paths ────────────────────────────────────────────────────────────────────

const STATIC_ARTICLES_DIR = path.join(process.cwd(), 'content', 'static', 'articles');
const UUID_ARTICLES_DIR   = path.join(process.cwd(), 'content', 'articles');
const REGISTRY_PATH       = path.join(process.cwd(), 'content', 'static', 'content_registry.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function urlToPath(rawUrl: string): string {
  // Handles both full URLs and bare paths
  try {
    return new URL(rawUrl).pathname.replace(/\/+$/, '') || '/';
  } catch {
    // Not a full URL — treat as a path already
    const p = rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl;
    return p.replace(/\/+$/, '') || '/';
  }
}

interface ArticleRecord {
  slug: string;
  url?: string;
  title?: string;
  category?: string;
  status?: string;
  published_at?: string;
  publish_date?: string;
  author_name?: string;
  author_slug?: string;
  tags?: string[];
  breaking?: boolean;
  lifecycle?: string;
  metadata?: {
    alternates?: { canonical?: string };
    description?: string;
    title?: string;
  };
  [key: string]: unknown;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function backfill() {
  console.log('\n🔄  NodeLX Registry Backfill — starting…\n');

  // Ensure output directory exists
  if (!fs.existsSync(UUID_ARTICLES_DIR)) {
    fs.mkdirSync(UUID_ARTICLES_DIR, { recursive: true });
    console.log(`📁  Created ${UUID_ARTICLES_DIR}`);
  }

  // ── Read all legacy static article files ──────────────────────────────────
  const files = fs
    .readdirSync(STATIC_ARTICLES_DIR)
    .filter((f) => f.endsWith('.json') && f !== '_index.json');

  console.log(`📂  Found ${files.length} legacy articles in content/static/articles/\n`);

  let created = 0;
  let skipped = 0;
  let routeErrors = 0;
  let articleErrors = 0;

  for (const filename of files) {
    const filePath = path.join(STATIC_ARTICLES_DIR, filename);
    let article: ArticleRecord;

    try {
      article = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ArticleRecord;
    } catch {
      console.warn(`  ⚠️  Could not parse ${filename} — skipping`);
      skipped++;
      continue;
    }

    // ── Derive the canonical URL path ────────────────────────────────────────
    // Priority: article.url > article.metadata.alternates.canonical > slug fallback
    const rawUrl =
      article.url ??
      article.metadata?.alternates?.canonical ??
      article.slug;

    if (!rawUrl) {
      console.warn(`  ⚠️  ${filename} has no url/slug — skipping`);
      skipped++;
      continue;
    }

    const urlPath = urlToPath(rawUrl);

    // ── Generate deterministic UUID v5 from the URL path ─────────────────────
    // v5(urlPath, namespace) always produces the same UUID for the same path.
    // Re-running this script is safe — same input → same UUID → UPSERT, not INSERT.
    const contentId = uuidv5(urlPath, UUID_NAMESPACE);

    console.log(`  ✦  ${urlPath}`);
    console.log(`     UUID: ${contentId}`);

    // ── Write immutable file content/articles/[uuid].json ────────────────────
    const idFilePath = path.join(UUID_ARTICLES_DIR, `${contentId}.json`);
    const enriched = { ...article, id: contentId };
    fs.writeFileSync(idFilePath, JSON.stringify(enriched, null, 2) + '\n', 'utf8');

    // ── Upsert routing_table: url_path → content_id ───────────────────────────
    const { error: routeErr } = await supabase
      .from('routing_table')
      .upsert(
        {
          url_path:      urlPath,
          content_id:    contentId,
          content_store: 'articles',
          brand_slug:    urlPath.includes('ozonenetwork') ? 'ozonenetwork' : 'ozone',
        },
        { onConflict: 'url_path' }
      );

    if (routeErr) {
      console.error(`     ❌  routing_table upsert failed: ${routeErr.message}`);
      routeErrors++;
    } else {
      console.log(`     ✅  routing_table: ${urlPath} → ${contentId}`);
    }

    // ── Upsert articles table ─────────────────────────────────────────────────
    // Only writes the fields the articles table schema expects.
    // We use upsert on id so re-runs are safe.
    const publishedAt =
      article.published_at ??
      (article.publish_date ? new Date(article.publish_date).toISOString() : new Date().toISOString());

    const { error: articleErr } = await supabase
      .from('articles')
      .upsert(
        {
          id:           contentId,
          slug:         article.slug,
          url:          rawUrl,
          title:        article.title ?? filename.replace('.json', ''),
          category:     article.category ?? 'News',
          status:       'published',
          published_at: publishedAt,
          publish_date: article.publish_date ?? new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          author_name:  article.author_name ?? 'OzoneNews Editorial Team',
          author_slug:  article.author_slug ?? 'ozonedailynews-editorial-team',
          tags:         article.tags ?? [],
          breaking:     article.breaking ?? false,
          lifecycle:    article.lifecycle ?? 'news',
        },
        { onConflict: 'id' }
      );

    if (articleErr) {
      // Non-fatal: the routing + file write already succeeded.
      // The articles table may have schema constraints not yet met — log and continue.
      console.warn(`     ⚠️  articles upsert warning: ${articleErr.message}`);
      articleErrors++;
    } else {
      console.log(`     ✅  articles table: ${article.slug}`);
    }

    created++;
    console.log('');
  }

  // ── Backfill routing_table for registry entries without matching article files ──
  // Some registry entries point to routes that have page.tsx stubs but no static JSON.
  // We still need routing_table rows for them so the middleware doesn't get confused.
  console.log('\n🔍  Checking registry for entries without article files…\n');

  if (fs.existsSync(REGISTRY_PATH)) {
    type RegistryEntry = { slug: string; title?: string; category?: string };
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) as RegistryEntry[];

    for (const entry of registry) {
      const urlPath = urlToPath(entry.slug);
      const contentId = uuidv5(urlPath, UUID_NAMESPACE);

      // Skip if we already wrote the routing_table row above
      const matchingFile = files.find((f) => {
        try {
          const a = JSON.parse(fs.readFileSync(path.join(STATIC_ARTICLES_DIR, f), 'utf8')) as ArticleRecord;
          return urlToPath(a.url ?? a.slug) === urlPath;
        } catch { return false; }
      });

      if (matchingFile) continue; // already handled above

      console.log(`  ✦  Registry-only route: ${urlPath} → ${contentId}`);

      const { error } = await supabase
        .from('routing_table')
        .upsert(
          { url_path: urlPath, content_id: contentId, content_store: 'articles', brand_slug: 'ozone' },
          { onConflict: 'url_path' }
        );

      if (error) {
        console.error(`     ❌  ${error.message}`);
      } else {
        console.log(`     ✅  routing_table row created`);
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log('✅  Backfill complete\n');
  console.log(`   Articles processed : ${created}`);
  console.log(`   Skipped            : ${skipped}`);
  console.log(`   Route errors       : ${routeErrors}`);
  console.log(`   Articles DB errors : ${articleErrors}`);
  console.log('\nNext step:');
  console.log('  git add content/articles/ && git commit -m "migration: backfill legacy articles to immutable UUID store" && git push\n');
}

backfill().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
