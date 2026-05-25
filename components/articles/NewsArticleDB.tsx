/**
 * NewsArticleDB — Server Component
 *
 * Fetches a row from the `articles` table by slug and renders it
 * using the <NewsArticle> display component.
 *
 * Usage in a page.tsx:
 *   export const dynamic = 'force-dynamic';
 *   export default function Page() {
 *     return <NewsArticleDB slug="my-article-slug" />;
 *   }
 */

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewsArticle } from './NewsArticle';
import { ContentRenderer } from './ContentRenderer';
import type { BreadcrumbItem } from '@/components/nav/Breadcrumb';

// ---------------------------------------------------------------------------
// Static-first data helpers
// ---------------------------------------------------------------------------
const STATIC_DIR = path.join(process.cwd(), 'content', 'static', 'articles');

function loadStaticRow(slug: string): Record<string, unknown> | null {
  try {
    const safeSlug = slug.replace(/\//g, '__');
    const filePath = path.join(STATIC_DIR, `${safeSlug}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

type IndexEntry = {
  slug: string;
  title: string;
  url: string | null;
  category: string | null;
  publish_date: string | null;
  published_at: string | null;
  thumbnail_src: string | null;
  status: string | null;
};

let _articlesIndex: IndexEntry[] | null = null;
function getArticlesIndex(): IndexEntry[] {
  if (_articlesIndex) return _articlesIndex;
  try {
    const indexPath = path.join(STATIC_DIR, '_index.json');
    if (fs.existsSync(indexPath)) {
      _articlesIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as IndexEntry[];
    }
  } catch {
    _articlesIndex = [];
  }
  return _articlesIndex ?? [];
}

interface NewsArticleDBProps {
  slug: string;
}

/** Derive a 3-4 level breadcrumb trail from the article canonical URL path.
 *  e.g. /entertainment/news/fortnite-moves-into-movies
 *  → Home > Entertainment > News > {title}
 */
function deriveBreadcrumbs(urlPath: string | null | undefined, title: string): BreadcrumbItem[] {
  if (!urlPath) return [];
  const segments = urlPath.replace(/^\//, '').split('/').filter(Boolean);
  if (segments.length < 2) return []; // only add breadcrumbs when 2+ path levels deep

  const crumbs: BreadcrumbItem[] = [{ name: 'Home', item: '/' }];
  let cumulativePath = '';
  for (let i = 0; i < segments.length - 1; i++) {
    cumulativePath += '/' + segments[i];
    const label = segments[i]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ name: label, item: cumulativePath });
  }
  crumbs.push({ name: title, item: urlPath });
  return crumbs;
}

export async function NewsArticleDB({ slug }: NewsArticleDBProps) {
  // ---------------------------------------------------------------------------
  // 1. Try static JSON file first (no Supabase call needed)
  // ---------------------------------------------------------------------------
  let row: Record<string, unknown> | null = loadStaticRow(slug);

  // ---------------------------------------------------------------------------
  // 2. Fallback to Supabase if static file not found
  // ---------------------------------------------------------------------------
  if (!row) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      row = data ?? null;
    }
  }

  if (!row) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any;

  // ---------------------------------------------------------------------------
  // 3. Build "More from Hub" from static index (no Supabase call)
  // ---------------------------------------------------------------------------
  const moreFromHubItems: Array<{
    slug: string;
    title: string;
    url: string;
    publishDate?: string;
    category?: string;
    thumbnail?: string;
  }> = [];

  const index = getArticlesIndex();

  // Strategy 1: same category
  const catSiblings = index
    .filter((a) => a.category === r.category && a.slug !== slug && a.url && a.title && a.status === 'published')
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    .slice(0, 8);

  for (const a of catSiblings) {
    if (!a.url || !a.title) continue;
    moreFromHubItems.push({
      slug: a.slug,
      title: a.title,
      url: a.url,
      publishDate: a.publish_date ?? undefined,
      category: a.category ?? undefined,
      thumbnail: a.thumbnail_src ?? undefined,
    });
    if (moreFromHubItems.length >= 6) break;
  }

  // Strategy 2 (fallback): URL-prefix matches
  if (moreFromHubItems.length < 6 && r.url) {
    const segments = (r.url as string).split('/').filter(Boolean);
    const hubPrefix = segments.length > 0 ? `/${segments[0]}/` : null;
    if (hubPrefix) {
      const seen = new Set(moreFromHubItems.map((i) => i.slug));
      const prefixSiblings = index.filter(
        (a) =>
          a.url?.startsWith(hubPrefix) &&
          a.slug !== slug &&
          !seen.has(a.slug) &&
          a.url &&
          a.title &&
          a.status === 'published',
      )
        .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
        .slice(0, 12);
      for (const a of prefixSiblings) {
        if (!a.url || !a.title) continue;
        moreFromHubItems.push({
          slug: a.slug,
          title: a.title,
          url: a.url,
          publishDate: a.publish_date ?? undefined,
          category: a.category ?? undefined,
          thumbnail: a.thumbnail_src ?? undefined,
        });
        if (moreFromHubItems.length >= 6) break;
      }
    }
  }

  // Determine MoreFromHub label + href from URL prefix
  let moreFromHubLabel: string | undefined;
  let moreFromHubHref: string | undefined;
  if (r.url) {
    const firstSegment = (r.url as string).split('/').filter(Boolean)[0];
    if (firstSegment && !firstSegment.startsWith('news')) {
      moreFromHubLabel = firstSegment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      moreFromHubHref = `/${firstSegment}`;
    }
  }

  const author = r.author_name
    ? {
        name: r.author_name as string,
        role: r.author_role ?? undefined,
        avatar: r.author_avatar ?? undefined,
        twitter: r.author_twitter ?? undefined,
        authorSlug: r.author_slug ?? undefined,
        bio: r.author_bio ?? undefined,
      }
    : undefined;

  const heroImage = r.hero_image_src
    ? {
        src: r.hero_image_src as string,
        alt: (r.hero_image_alt as string) ?? '',
        caption: r.hero_image_caption ?? undefined,
        credit: r.hero_image_credit ?? undefined,
      }
    : undefined;

  const thumbnail = r.thumbnail_src
    ? {
        src: r.thumbnail_src as string,
        alt: (r.thumbnail_alt as string) ?? '',
      }
    : undefined;

  return (
    <NewsArticle
      title={r.title}
      subtitle={r.subtitle ?? undefined}
      category={r.category}
      categoryColor={r.category_color ?? undefined}
      topicTag={r.topic_tag ?? undefined}
      publishDate={r.publish_date ?? ''}
      readTime={r.read_time ?? undefined}
      author={author}
      heroImage={heroImage}
      thumbnail={thumbnail}
      tags={r.tags ?? undefined}
      trending={r.trending ?? undefined}
      breaking={r.breaking ?? undefined}
      exclusive={r.exclusive ?? undefined}
      slug={slug}
      url={r.url ?? undefined}
      breadcrumbs={deriveBreadcrumbs(r.url, r.title)}
      faqItems={Array.isArray(r.faq_items) && r.faq_items.length > 0 ? r.faq_items : undefined}
      moreFromHub={moreFromHubItems.length > 0 ? moreFromHubItems : undefined}
      moreFromHubLabel={moreFromHubLabel}
      moreFromHubHref={moreFromHubHref}
    >
      <ContentRenderer html={r.content_html ?? ''} />
    </NewsArticle>
  );
}
