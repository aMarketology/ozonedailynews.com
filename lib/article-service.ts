// lib/article-service.ts
// Local-first data layer. Layer 1 (Git static JSON) is ALWAYS read first.
// Supabase is only hit when content/static/ returns empty (fallback / breaking news insert).

import fs from 'fs';
import path from 'path';
import type { ArticleFull, JackArticleFull, ArticlePageFull, CreatorArticleFull, WikiArticleFull } from './types';

const STATIC_BASE = path.join(process.cwd(), 'content', 'static');

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

// ─── Jack Articles (JackArticleDB) ────────────────────────────────────────────

export async function getAllJackArticles(): Promise<JackArticleFull[]> {
  const local = readStaticDir<JackArticleFull>('jack_articles');
  if (local.length > 0) {
    return local.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('jack_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []) as JackArticleFull[];
}

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
