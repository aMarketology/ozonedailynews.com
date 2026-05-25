// components/CreatorArticleDB.tsx
// Creator profile component with Wikipedia-style infobox + stats.
// Reads from content/static/creator_articles/{slug}.json.
// NOTE: getCreatorBySlug reads Supabase first (live-managed profiles).

import { notFound } from 'next/navigation';
import { getCreatorBySlug } from '@/lib/article-service';
import { SEOWrapper } from './SEOWrapper';

interface CreatorArticleDBProps {
  slug: string;
}

export async function CreatorArticleDB({ slug }: CreatorArticleDBProps) {
  const article = await getCreatorBySlug(slug);
  if (!article) notFound();

  return (
    <SEOWrapper slug={article.url}>
      <article className="max-w-7xl mx-auto px-4 py-8">
        {/* Gradient hero header */}
        <header className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden mb-8 p-8">
          {article.thumbnail_src && (
            <div className="absolute inset-0">
              <img
                src={article.thumbnail_src}
                alt={article.thumbnail_alt ?? article.creator_name ?? article.title}
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          )}
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{article.title}</h1>
            {article.subtitle && (
              <p className="text-gray-300 text-lg">{article.subtitle}</p>
            )}
            {/* CTA buttons */}
            {article.cta_buttons && article.cta_buttons.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                {article.cta_buttons.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                  >
                    {btn.icon && <span>{btn.icon}</span>}
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Stats row */}
        {article.stats && article.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {article.stats.map((stat, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* 2/3 + 1/3 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Article body */}
          <div>
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-800"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />

            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Wikipedia-style infobox */}
          {article.infobox && article.infobox.length > 0 && (
            <aside className="sticky top-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-800 px-4 py-3">
                  <p className="text-white font-semibold text-sm">{article.creator_name ?? 'Creator Profile'}</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {article.infobox.map((row, i) => (
                    <div key={i} className="flex px-4 py-3 text-sm">
                      <span className="flex-shrink-0 w-28 text-gray-500 font-medium">{row.label}</span>
                      {row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <span className="text-gray-900">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400 px-1">
                By{' '}
                <a href={`/authors/${article.author_slug}`} className="text-blue-600 hover:text-blue-800 underline">
                  {article.author_name}
                </a>
                {' '} &bull; {article.publish_date}
              </div>
            </aside>
          )}
        </div>
      </article>
    </SEOWrapper>
  );
}
