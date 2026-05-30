// lib/article-service.ts
// Local-first data layer. Layer 1 (Git static JSON) is ALWAYS read first.
// Supabase is only hit when content/static/ returns empty (fallback / breaking news insert).
//
// Routing resolution order for getArticleByUrlSegments():
//   1. Supabase routing_table lookup (decoupled URL → content_id)
//      → reads content/articles/[content_id].json (new ID-addressed storage)
//   2. Joined slug match (legacy: content/static/articles/[slug].json)
//   3. Last segment match
//   4. Full URL scan across all static articles
//   5. Supabase articles table fallback (draft/live lookup)

import fs from 'fs';
import path from 'path';
import type { ArticleFull, JackArticleFull, SterlingArticleFull, ArticlePageFull, CreatorArticleFull, WikiArticleFull } from './types';

const STATIC_BASE = path.join(process.cwd(), 'content', 'static');
// ID-addressed content store — files never renamed, URLs never break Git history
const CONTENT_BASE = path.join(process.cwd(), 'content');

// ─── Filesystem helpers ───────────────────────────────────────────────────────

function readStaticDir<T>(table: string): T[] {
  const dir = path.join(STATIC_BASE, table);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== '_index.json')
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as T;
      } catch {
        return null;
      }
    })
    .filter((x): x is T => x !== null);
}

function readStaticRow<T>(table: string, slug: string): T | null {
  const file = path.join(STATIC_BASE, table, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

// ─── ID-addressed content reader ─────────────────────────────────────────────
// Reads from content/[store]/[id].json — the decoupled storage introduced by
// the NodeLX routing layer. File names are immutable UUIDs; URLs are arbitrary.

function readContentRow<T>(store: string, contentId: string): T | null {
  const file = path.join(CONTENT_BASE, store, `${contentId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

/**
 * Resolves an article by its immutable content_id (UUID).
 * Used by getArticleByUrlSegments() after a routing_table hit.
 * Checks content/articles/[id].json first, then Supabase fallback.
 */
export async function getArticleByContentId(
  contentId: string,
  contentStore: string = 'articles'
): Promise<ArticleFull | null> {
  // Layer 1: ID-addressed Git file
  const local = readContentRow<ArticleFull>(contentStore, contentId);
  if (local) return local;

  // Layer 2: Supabase (article may exist in DB but not yet deployed to Git)
  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', contentId)
    .eq('status', 'published')
    .single();
  return (data as ArticleFull | null) ?? null;
}

// ─── Articles (NewsArticleDB) ─────────────────────────────────────────────────

export async function getAllArticles(): Promise<ArticleFull[]> {
  const local = readStaticDir<ArticleFull>('articles');
  if (local.length > 0) {
    return local.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  // Layer 2: Supabase fallback
  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []) as ArticleFull[];
}

export async function getArticleBySlug(slug: string): Promise<ArticleFull | null> {
  const local = readStaticRow<ArticleFull>('articles', slug);
  if (local) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as ArticleFull | null) ?? null;
}

/**
 * Resolves an article from a URL path segment array (used by the [...slug] catchall).
 * Try order:
 *   0. Supabase routing_table — decoupled URL → content_id → content/articles/[id].json
 *   1. Join all segments with hyphens — matches the existing naming convention
 *      e.g. ['google','news','google-samsung-ai-...'] → 'google-news-google-samsung-ai-...'
 *   2. Last segment only — for articles that don't embed the category prefix
 *   3. Full URL scan — scans all articles and matches by the `url` field path suffix
 */
export async function getArticleByUrlSegments(segments: string[]): Promise<ArticleFull | null> {
  const fullPath = '/' + segments.join('/');

  // Try 0: routing_table lookup (new ID-addressed storage, zero file renames)
  try {
    const { resolveUrlPath } = await import('./routing-service');
    const route = await resolveUrlPath(fullPath);
    if (route) {
      const byId = await getArticleByContentId(route.content_id, route.content_store);
      if (byId) return byId;
    }
  } catch {
    // routing-service unavailable (e.g. no Supabase in local dev) — fall through
  }

  // Try 1: joined slug (existing naming convention)
  const joinedSlug = segments.join('-');
  const byJoined = readStaticRow<ArticleFull>('articles', joinedSlug);
  if (byJoined) return byJoined;

  // Try 2: last segment only
  const lastSegment = segments[segments.length - 1];
  if (lastSegment !== joinedSlug) {
    const byLast = readStaticRow<ArticleFull>('articles', lastSegment);
    if (byLast) return byLast;
  }

  // Try 3: scan all articles and match by url field path
  const all = readStaticDir<ArticleFull>('articles');
  const byUrl = all.find((a) => {
    if (!a.url) return false;
    try { return new URL(a.url).pathname === fullPath; } catch { return a.url === fullPath; }
  });
  if (byUrl) return byUrl;

  // Try 4: Supabase fallback
  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('articles')
    .select('*')
    .ilike('url', `%${fullPath}`)
    .eq('status', 'published')
    .single();
  return (data as ArticleFull | null) ?? null;
}

export async function getBreakingHeadlines(): Promise<ArticleFull[]> {
  // Breaking headlines always read from Supabase (live inserts)
  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('articles')
    .select('slug, title, url, category, published_at')
    .eq('breaking', true)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);
  return (data ?? []) as ArticleFull[];
}

// ─── Sterling Articles (SterlingArticleDB) ──────────────────────────────────

export async function getAllSterlingArticles(): Promise<SterlingArticleFull[]> {
  const local = readStaticDir<SterlingArticleFull>('sterling_articles');
  if (local.length > 0) {
    return local.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('sterling_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []) as SterlingArticleFull[];
}

export async function getSterlingArticleBySlug(slug: string): Promise<SterlingArticleFull | null> {
  const local = readStaticRow<SterlingArticleFull>('sterling_articles', slug);
  if (local) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('sterling_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as SterlingArticleFull | null) ?? null;
}

// ─── Article Pages (ArticlePageDB) ────────────────────────────────────────────

export async function getAllArticlePages(): Promise<ArticlePageFull[]> {
  const local = readStaticDir<ArticlePageFull>('article_pages');
  if (local.length > 0) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('article_pages')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []) as ArticlePageFull[];
}

export async function getArticlePageBySlug(slug: string): Promise<ArticlePageFull | null> {
  const local = readStaticRow<ArticlePageFull>('article_pages', slug);
  if (local) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('article_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as ArticlePageFull | null) ?? null;
}

// ─── Creator Articles (CreatorArticleDB) ──────────────────────────────────────

export async function getCreatorArticles(): Promise<CreatorArticleFull[]> {
  // Creator profiles: Supabase only (live-managed)
  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('creator_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []) as CreatorArticleFull[];
}

export async function getCreatorBySlug(slug: string): Promise<CreatorArticleFull | null> {
  const local = readStaticRow<CreatorArticleFull>('creator_articles', slug);
  if (local) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('creator_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as CreatorArticleFull | null) ?? null;
}

// ─── Jack Articles (long-form / investigation) ───────────────────────────────

export async function getJackArticleBySlug(slug: string): Promise<JackArticleFull | null> {
  const local = readStaticRow<JackArticleFull>('jack_articles', slug);
  if (local) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('jack_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as JackArticleFull | null) ?? null;
}

// ─── Wiki Articles ────────────────────────────────────────────────────────────

export async function getWikiArticleBySlug(slug: string): Promise<WikiArticleFull | null> {
  const local = readStaticRow<WikiArticleFull>('wiki_articles', slug);
  if (local) return local;

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as WikiArticleFull | null) ?? null;
}

// ─── Latest articles (cross-store, for homepage carousel) ────────────────────

export async function getLatestArticles(limit = 10): Promise<ArticleFull[]> {
  const all = await getAllArticles();
  return all.slice(0, limit);
}
