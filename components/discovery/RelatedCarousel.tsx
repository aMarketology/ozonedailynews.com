'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

/**
 * RelatedCarousel — Sticky right-rail carousel
 *
 * Shows 3 related articles at a time. After ~30 seconds of continuous reading,
 * fades to the next page of 3. Loops through the top 9 most relevant articles
 * indefinitely. Sticky on desktop like the left TOC rail.
 */

interface CarouselArticle {
  slug: string;
  title: string;
  category: string;
  publish_date: string;
  published_at?: string;
  thumbnail_src?: string;
  url?: string;
  tags?: string[];
}

interface RelatedCarouselProps {
  currentSlug: string;
  category: string;
  tags?: string[];
}

const PAGE_SIZE = 3;
const TOTAL_SLOTS = 9;
const ROTATION_INTERVAL_MS = 30000; // 30 seconds

export function RelatedCarousel({ currentSlug, category, tags = [] }: RelatedCarouselProps) {
  const [articles, setArticles] = useState<CarouselArticle[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  // Fetch articles on mount
  useEffect(() => {
    async function load() {
      try {
        // Fetch from the registry via the API
        const res = await fetch(`/api/related?slug=${encodeURIComponent(currentSlug)}&limit=${TOTAL_SLOTS}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles ?? []);
        }
      } catch {
        // Fallback: use empty
      }
      setLoading(false);
    }
    load();
  }, [currentSlug]);

  // Track visibility — only rotate when the article body is in view
  useEffect(() => {
    function checkVisibility() {
      const articleBody = document.querySelector('[data-article-body]');
      if (!articleBody) return;
      const rect = articleBody.getBoundingClientRect();
      // Visible if at least 200px of the article is in the viewport
      setVisible(rect.bottom > 0 && rect.top < window.innerHeight - 200);
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();
    return () => window.removeEventListener('scroll', checkVisibility);
  }, []);

  // Rotate pages every 30 seconds when visible
  useEffect(() => {
    if (articles.length === 0) return;

    function advance() {
      if (!visible) return;

      // Fade out
      if (fadeRef.current) {
        fadeRef.current.style.opacity = '0';
        fadeRef.current.style.transform = 'translateY(8px)';
      }

      setTimeout(() => {
        setPage((prev) => {
          const totalPages = Math.ceil(Math.min(articles.length, TOTAL_SLOTS) / PAGE_SIZE);
          return (prev + 1) % totalPages;
        });
        // Fade in
        if (fadeRef.current) {
          fadeRef.current.style.opacity = '1';
          fadeRef.current.style.transform = 'translateY(0)';
        }
      }, 300);
    }

    intervalRef.current = setInterval(advance, ROTATION_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [articles, visible]);

  if (loading) {
    return (
      <aside className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[.15em] text-gray-400 border-b border-gray-200 pb-2 mb-3">
          Related
        </h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </aside>
    );
  }

  if (articles.length === 0) return null;

  const totalPages = Math.ceil(Math.min(articles.length, TOTAL_SLOTS) / PAGE_SIZE);
  const currentArticles = articles.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <aside>
      <h3 className="text-[10px] font-black uppercase tracking-[.15em] text-gray-400 border-b border-gray-200 pb-2 mb-4">
        Related
      </h3>
      <div
        ref={fadeRef}
        className="space-y-4 transition-all duration-300 ease-in-out"
        style={{ opacity: 1, transform: 'translateY(0)' }}
      >
        {currentArticles.map((a) => (
          <div key={a.slug}>
            <Link href={a.url ?? `/${a.slug}`} className="group block">
              {a.thumbnail_src && (
                <div className="w-full aspect-video overflow-hidden rounded mb-1.5 bg-gray-50">
                  <img
                    src={a.thumbnail_src}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">
                {a.category}
              </span>
              <p className="text-xs font-semibold text-gray-900 leading-snug group-hover:underline mt-0.5">
                {a.title}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{a.publish_date}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setPage(i);
                if (fadeRef.current) {
                  fadeRef.current.style.opacity = '0';
                  fadeRef.current.style.transform = 'translateY(8px)';
                  setTimeout(() => {
                    if (fadeRef.current) {
                      fadeRef.current.style.opacity = '1';
                      fadeRef.current.style.transform = 'translateY(0)';
                    }
                  }, 300);
                }
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === page
                  ? 'bg-blue-600 w-3'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </aside>
  );
}

export default RelatedCarousel;