// lib/registry-service.ts
// Content registry: master index for sitemaps, JSON-LD, related articles.
// Layer 1: content/static/content_registry.json (filesystem, in-memory cache)
// Layer 2: Supabase fallback if registry file is missing.

import fs from 'fs';
import path from 'path';
import type { ContentEntry } from './types';

const LOCAL_REGISTRY_PATH = path.join(process.cwd(), 'content', 'static', 'content_registry.json');

let _localCache: ContentEntry[] | null = null;

function rowToEntry(row: Record<string, unknown>): ContentEntry {
  return {
    slug:            String(row.slug ?? ''),
    title:           String(row.title ?? ''),
    description:     String(row.description ?? ''),
    publishDate:     String(row.publishDate ?? row.publish_date ?? ''),
    modifiedDate:    String(row.modifiedDate ?? row.modified_date ?? row.publishDate ?? row.publish_date ?? ''),
    category:        String(row.category ?? 'News'),
    tags:            Array.isArray(row.tags) ? (row.tags as string[]) : [],
    author:          String(row.author ?? ''),
    authorSlug:      row.authorSlug ? String(row.authorSlug) : undefined,
    priority:        Number(row.priority ?? 0.7),
    changeFrequency: (row.changeFrequency as ContentEntry['changeFrequency']) ?? 'daily',
    imageUrl:        row.imageUrl ? String(row.imageUrl) : undefined,
    imageAlt:        row.imageAlt ? String(row.imageAlt) : undefined,
    imageWidth:      row.imageWidth ? Number(row.imageWidth) : undefined,
    imageHeight:     row.imageHeight ? Number(row.imageHeight) : undefined,
    articleType:     row.articleType as ContentEntry['articleType'],
    lifecycle:       row.lifecycle as ContentEntry['lifecycle'] ?? 'news',
    breaking:        Boolean(row.breaking ?? false),
  };
}

function loadLocalRegistry(): ContentEntry[] | null {
  if (_localCache) return _localCache;
  if (!fs.existsSync(LOCAL_REGISTRY_PATH)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(LOCAL_REGISTRY_PATH, 'utf8')) as Record<string, unknown>[];
    _localCache = raw.map(rowToEntry);
    return _localCache;
  } catch {
    return null;
  }
}

// Clear in-memory cache (used by sync scripts)
export function clearRegistryCache() {
  _localCache = null;
}

export async function getAllEntries(): Promise<ContentEntry[]> {
  const local = loadLocalRegistry();
  if (local && local.length > 0) return local;

  // Layer 2: Supabase fallback
  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('content_registry')
    .select('*')
    .order('publishDate', { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(rowToEntry);
}

export async function getEntry(slug: string): Promise<ContentEntry | null> {
  const all = await getAllEntries();
  return all.find((e) => e.slug === slug) ?? null;
}

export async function getLatestArticles(limit = 12): Promise<ContentEntry[]> {
  const all = await getAllEntries();
  return all
    .filter((e) => e.lifecycle !== 'pruned')
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
}

export async function getRelatedArticles(slug: string, limit = 5): Promise<ContentEntry[]> {
  const entry = await getEntry(slug);
  if (!entry) return [];

  const all = await getAllEntries();
  return all
    .filter((e) => e.slug !== slug && e.category === entry.category && e.lifecycle !== 'pruned')
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
}

export async function getNewsSitemapEntries(): Promise<ContentEntry[]> {
  const all = await getAllEntries();
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return all.filter((e) => new Date(e.publishDate) > cutoff);
}
