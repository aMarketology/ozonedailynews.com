// components/NewsArticleDB.tsx
// Gold standard article component. 80/20 grid layout.
// Reads from content/static/articles/{slug}.json via article-service (local-first).
// All pages using this component must export dynamic = 'force-dynamic'.

import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/lib/article-service';
import { getRelatedArticles as getRegistryRelated } from '@/lib/registry-service';
import { SEOWrapper } from './SEOWrapper';
import type { ArticleFull } from '@/lib/types';

interface NewsArticleDBProps {
  slug: string;
}

function ArticleBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide text-white ${color}`}>
      {label}
    </span>
  );
}

async function RelatedArticlesSidebar({ slug, category }: { slug: string; category: string }) {
  const related = await getRegistryRelated(slug, 5);
  if (related.length === 0) return null;

  return (
    <aside className="sticky top-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4 border-b border-gray-200 pb-2">
        Related Articles
      </h2>
      <ul className="space-y-4">
        {related.map((entry) => (
          <li key={entry.slug}>
            <a
              href={entry.slug}
              className="text-blue-600 hover:text-blue-800 underline text-sm leading-snug block"
            >
              {entry.title}
            </a>
            <p className="text-xs text-gray-400 mt-0.5">{entry.author}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export async function NewsArticleDB({ slug }: NewsArticleDBProps) {
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const articleUrl = article.url;

  return (
    <SEOWrapper slug={articleUrl}>
      <article className="max-w-7xl mx-auto px-4 py-8">
        {/* Gradient header with thumbnail */}
        <header
          className={`relative rounded-xl overflow-hidden mb-8 ${
            article.thumbnail_src ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-800 to-gray-900'
          }`}
        >
          {article.thumbnail_src && (
            <div className="absolute inset-0">
              <img
                src={article.thumbnail_src}
                alt={article.thumbnail_alt ?? article.title}
                className="w-full h-full object-cover opacity-40"
              />
            </div>
          )}
          <div className="relative z-10 px-8 py-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">
                {article.category}
              </span>
              {article.breaking && <ArticleBadge label="Breaking" color="bg-red-600" />}
              {article.trending && <ArticleBadge label="Trending" color="bg-orange-500" />}
              {article.exclusive && <ArticleBadge label="Exclusive" color="bg-purple-600" />}
            </div>
            <h1 className="article-headline text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="article-intro text-gray-300 text-lg leading-relaxed max-w-3xl">
                {article.subtitle}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>
                By{' '}
                <a
                  href={`/authors/${article.author_slug}`}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {article.author_name}
                </a>
              </span>
              <time dateTime={article.published_at}>{article.publish_date}</time>
              {article.read_time && <span>{article.read_time}</span>}
            </div>
          </div>
        </header>

        {/* 80/20 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* Main article body */}
          <div>
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-800"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Written by</p>
              <a
                href={`/authors/${article.author_slug}`}
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                {article.author_name}
              </a>
              <p className="text-sm text-gray-500 mt-1">{article.category} Reporter, OzoneNews</p>
            </div>
          </div>

          {/* Sticky sidebar */}
          <RelatedArticlesSidebar slug={articleUrl} category={article.category} />
        </div>
      </article>
    </SEOWrapper>
  );
}

// Re-export getArticleBySlug for convenience
export { getArticleBySlug };
