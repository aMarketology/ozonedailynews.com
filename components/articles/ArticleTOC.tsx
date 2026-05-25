'use client';

/**
 * ArticleTOC — Sticky left-rail table of contents.
 *
 * Scans the article body for `<h2>` elements (and optionally `<h3>`) on mount,
 * assigns slug ids when missing, and renders a clickable index that highlights
 * the currently visible section via IntersectionObserver.
 *
 * Pure client component. Reads from a `data-article-body` element — wrap your
 * article content `<div>` with `data-article-body="true"` so this component
 * knows where to look.
 */

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export default function ArticleTOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-article-body="true"]');
    if (!root) return;

    // Collect H2 + H3, assign ids if missing
    const nodes = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2, h3'));
    const seen = new Set<string>();
    const list: Heading[] = nodes.map((el) => {
      const text = (el.textContent ?? '').trim();
      let id = el.id || slugify(text);
      // Ensure uniqueness
      let n = 2;
      const base = id;
      while (seen.has(id)) id = `${base}-${n++}`;
      seen.add(id);
      el.id = id;
      // Add scroll offset so sticky nav doesn't cover the heading
      el.style.scrollMarginTop = '6rem';
      return { id, text, level: el.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(list);

    if (!list.length) return;

    // Track which heading is currently in view
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the heading nearest the top of the viewport that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      },
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (!headings.length) return null;

  return (
    <nav aria-label="Article contents" className="text-sm">
      <h3 className="text-[10px] font-black uppercase tracking-[.15em] text-gray-400 border-b border-gray-200 pb-2 mb-3">
        In this article
      </h3>
      <ul className="space-y-2">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li
              key={h.id}
              className={h.level === 3 ? 'pl-3' : ''}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(h.id);
                  if (target) {
                    // Tell BookFlipReader to pause its proximity snap while the
                    // click-triggered smooth scroll is in flight — otherwise the
                    // two scroll animations fight each other.
                    window.dispatchEvent(new CustomEvent('book-flip:suppress-snap', { detail: 1100 }));
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', `#${h.id}`);
                    setActiveId(h.id);
                  }
                }}
                className={`block leading-snug border-l-2 pl-3 -ml-px py-1 transition-colors font-serif ${
                  isActive
                    ? 'border-gray-900 text-gray-900 font-semibold'
                    : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400'
                } ${h.level === 3 ? 'text-xs' : 'text-[13px]'}`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
