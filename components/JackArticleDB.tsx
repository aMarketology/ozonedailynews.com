// components/JackArticleDB.tsx
// Premium long-form / investigation article component.
// Reads from content/static/jack_articles/{slug}.json.
// Features: timeline, numbered sources, related articles sidebar, accent color.

import { notFound } from 'next/navigation';
import { getJackArticleBySlug } from '@/lib/article-service';
import { SEOWrapper } from './SEOWrapper';

interface JackArticleDBProps {
  slug: string;
}

export async function JackArticleDB({ slug }: JackArticleDBProps) {
  const article = await getJackArticleBySlug(slug);
  if (!article) notFound();

  const accentColor = article.accentColor ?? '#2563eb';

  return (
    <SEOWrapper slug={article.url}>
      <article className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 pb-8 border-b-2" style={{ borderColor: accentColor }}>
          {article.breadcrumbs && article.breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
              {article.breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span>/</span>}
                  <a href={crumb.href} className="text-blue-600 hover:text-blue-800 underline">
                    {crumb.label}
                  </a>
                </span>
              ))}
            </nav>
          )}

          {article.department && (
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
              {article.department}
            </p>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">{article.subtitle}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>
              By{' '}
              <a href={`/authors/${article.author_slug}`} className="text-blue-600 hover:text-blue-800 underline font-medium">
                {article.author_name}
              </a>
            </span>
            <time dateTime={article.published_at}>{article.publish_date}</time>
            {article.read_time && <span>{article.read_time}</span>}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
              {article.category}
            </span>
          </div>
        </header>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Main content */}
          <div>
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-800"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />

            {/* Sources */}
            {article.sources && article.sources.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Sources</h2>
                <ol className="space-y-2">
                  {article.sources.map((source, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {source.title}
                        </a>
                        {source.publisher && (
                          <span className="text-gray-400 ml-1">— {source.publisher}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-6">
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
          </div>

          {/* Sidebar */}
          <aside>
            {/* Timeline */}
            {article.timeline && article.timeline.length > 0 && (
              <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Timeline</h2>
                <div className="space-y-4">
                  {article.timeline.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: accentColor }} />
                        {i < article.timeline!.length - 1 && (
                          <div className="w-px flex-1 mt-1" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-semibold text-gray-500">{item.date}</p>
                        <p className="text-sm text-gray-800 mt-0.5">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related articles */}
            {article.relatedArticles && article.relatedArticles.length > 0 && (
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Related</h2>
                <ul className="space-y-4">
                  {article.relatedArticles.map((rel, i) => (
                    <li key={i}>
                      <a href={rel.url} className="text-blue-600 hover:text-blue-800 underline text-sm leading-snug block">
                        {rel.title}
                      </a>
                      <span className="text-xs text-gray-400 mt-0.5 block">{rel.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>
    </SEOWrapper>
  );
}
