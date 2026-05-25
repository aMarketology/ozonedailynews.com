/**
 * WikiArticle — Server Component
 *
 * Fetches an article from the `wiki_articles` table by slug and renders it.
 * Supports two display modes determined by the stored data:
 *
 *  - WIKI mode:  No author set → encyclopedia layout (breadcrumb + serif h1 + grid HTML)
 *  - NEWS mode:  author_name set → news article layout (category badge, author, date, body)
 *
 * Used by the thin page.tsx files that replace the old static pages.
 */

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Breadcrumb } from '@/components/nav/Breadcrumb';

const STATIC_DIR = path.join(process.cwd(), 'content', 'static', 'wiki_articles');

function loadStaticRow(slug: string): Record<string, unknown> | null {
  try {
    const safeSlug = slug.replace(/\//g, '__');
    const fp = path.join(STATIC_DIR, `${safeSlug}.json`);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface WikiArticleProps {
  slug: string;
}

export async function WikiArticle({ slug }: WikiArticleProps) {
  // Try static file first, fallback to Supabase
  let articleRaw: Record<string, unknown> | null = loadStaticRow(slug);
  if (!articleRaw) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .single();
      articleRaw = data ?? null;
    }
  }
  if (!articleRaw) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const article = articleRaw as any;

  // Find the raw HTML block
  const htmlBlock = Array.isArray(article.content)
    ? article.content.find((b: any) => b.type === 'html')
    : null;

  const htmlContent: string = htmlBlock?.content ?? '<p>Content coming soon.</p>';

  // Derive short title for h1 / breadcrumb
  const h1Title: string =
    article.subtitle ||
    article.title
      ?.replace(/\s*\|.*$/, '')
      .split(', ')[0]
      .split('\u2014')[0]
      .trim() ||
    'Article';

  // Category for breadcrumb (first segment of slug, e.g. "crypto")
  const category = slug.split('-')[0];
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  const isNewsArticle = Boolean(article.author_name);

  if (isNewsArticle) {
    // ── NEWS ARTICLE LAYOUT ─────────────────────────────────────────────────
    const publishedDate = article.published_at
      ? new Date(article.published_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
      : null;

    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pt-4 max-w-5xl">
          <Breadcrumb
            items={[
              { name: 'Home', item: '/' },
              { name: categoryLabel, item: `/${category}` },
              { name: h1Title, item: '#' },
            ]}
          />
        </div>

        <article className="container mx-auto px-4 max-w-5xl pb-16">
          {/* Category / Breaking badge */}
          <div className="flex items-center gap-2 mt-4 mb-4">
            {article.breaking && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wide">
                Breaking
              </span>
            )}
            {article.category && (
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {article.category}
              </span>
            )}
            {article.topic_tag && (
              <span className="text-xs text-gray-400">· {article.topic_tag}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-gray-900">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">{article.subtitle}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-6 mb-8 border-b border-gray-200">
            {article.author_name && (
              <span className="font-medium text-gray-700">{article.author_name}</span>
            )}
            {article.author_role && (
              <>
                <span className="text-gray-300">·</span>
                <span>{article.author_role}</span>
              </>
            )}
            {publishedDate && (
              <>
                <span className="text-gray-300">·</span>
                <time>{publishedDate}</time>
              </>
            )}
            {article.read_time && (
              <>
                <span className="text-gray-300">·</span>
                <span>{article.read_time}</span>
              </>
            )}
          </div>

          {/* Body HTML */}
          {/* eslint-disable-next-line react/no-danger */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  // ── WIKI LAYOUT ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-4 max-w-6xl">
        <Breadcrumb
          items={[
            { name: 'Home', item: '/' },
            { name: categoryLabel, item: `/${category}` },
            { name: h1Title, item: '#' },
          ]}
        />
      </div>

      <header className="border-b border-gray-200 pb-6 mb-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-serif mb-2">{h1Title}</h1>
          <p className="text-gray-600 italic">
            From ObjectWire, the verification-first intelligence platform
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl pb-16">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}
