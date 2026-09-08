// app/api/related/route.ts
// Returns related articles from the content registry, ranked by relevance.
// Used by the RelatedCarousel sticky right-rail component.

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RegistryEntry {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  author?: string;
  tags?: string[];
  publishDate?: string;
  modifiedDate?: string;
  imageUrl?: string;
  thumbnail_src?: string;
  articleType?: string;
  lifecycle?: string;
  breaking?: boolean;
  trending?: boolean;
  url?: string;
  filePath?: string;
}

const REGISTRY_PATH = path.join(process.cwd(), 'content', 'static', 'content_registry.json');

function loadRegistry(): RegistryEntry[] {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) return [];
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currentSlug = searchParams.get('slug') ?? '';
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '9', 10));

  const registry = loadRegistry();
  if (registry.length === 0) {
    return NextResponse.json({ articles: [] });
  }

  // Find the current article
  const current = registry.find(
    (e) => e.slug === currentSlug || e.slug === `/${currentSlug}` || e.slug.endsWith(`/${currentSlug}`),
  );
  const currentTags = new Set(current?.tags ?? []);
  const currentCategory = current?.category ?? '';

  // Score every other entry
  const scored = registry
    .filter((e) => {
      const entrySlug = e.slug.replace(/^\//, '');
      const cleanCurrent = currentSlug.replace(/^\//, '');
      if (entrySlug === cleanCurrent) return false;
      if (e.lifecycle === 'pruned') return false;
      return true;
    })
    .map((e) => {
      const entryTags = e.tags ?? [];
      const tagOverlap = entryTags.filter((t) => currentTags.has(t)).length;
      const sameCategory = e.category === currentCategory ? 1 : 0;
      const hasImage = (e.imageUrl || e.thumbnail_src) ? 1 : 0;

      // Recency: boost newer articles
      const pubDate = e.publishDate ? new Date(e.publishDate).getTime() : 0;
      const now = Date.now();
      const ageDays = pubDate ? (now - pubDate) / (24 * 60 * 60 * 1000) : 365;
      const recencyBoost = Math.max(0, 1 - ageDays / 90) * 0.5;

      const score = tagOverlap * 5 + sameCategory * 3 + hasImage * 2 + recencyBoost;

      return { entry: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const articles = scored.map(({ entry: e }) => ({
    slug: e.slug.replace(/^\//, ''),
    title: e.title,
    category: e.category ?? 'News',
    publish_date: e.publishDate ?? '',
    published_at: e.modifiedDate ?? e.publishDate ?? '',
    thumbnail_src: e.imageUrl ?? e.thumbnail_src ?? '',
    url: e.slug.startsWith('/') ? e.slug : `/${e.slug}`,
    tags: e.tags ?? [],
  }));

  return NextResponse.json({ articles });
}