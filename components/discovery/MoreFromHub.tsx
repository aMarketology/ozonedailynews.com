/**
 * MoreFromHub — Server-rendered related-articles strip.
 *
 * Unlike the client-side RelatedArticles sidebar (which Google may not crawl
 * reliably because the links are added by JavaScript), this component renders
 * plain server-side <a> tags so every article gets crawlable inbound links to
 * its category siblings. This fixes the "orphan page" deliverability problem.
 *
 * Render at the bottom of NewsArticle, JackArticle, CreatorArticle.
 */

import Link from 'next/link';
import Image from 'next/image';

export interface MoreFromHubItem {
  slug: string;
  title: string;
  url: string;
  publishDate?: string;
  category?: string;
  thumbnail?: string;
}

interface Props {
  items: MoreFromHubItem[];
  /** Hub display label, e.g. "Tech", "Crypto", "Apple". Used in the heading. */
  hubLabel?: string;
  /** Optional hub URL — adds a "View all" link to the heading. */
  hubHref?: string;
}

export function MoreFromHub({ items, hubLabel = 'this Hub', hubHref }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
          More from {hubLabel}
        </h2>
        {hubHref && (
          <Link
            href={hubHref}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            View all
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={item.url}
            className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-md transition"
          >
            {item.thumbnail ? (
              <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
            <div className="p-4">
              {item.category && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  {item.category}
                </p>
              )}
              <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-700 line-clamp-3">
                {item.title}
              </h3>
              {item.publishDate && (
                <p className="text-xs text-gray-500 mt-2">{item.publishDate}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
