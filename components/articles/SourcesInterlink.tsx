'use client';

import React from 'react';
import Link from 'next/link';

// =============================================================================
// SOURCES INTERLINK COMPONENT
//
// Renders a "Sources" block inside article content_html.
// Two sections:
//   1. External primary sources — numbered list with domain badge, author,
//      date, blue link, optional description. Styled for journalistic credibility.
//   2. Internal OzoneNews cross-links — pill-style links to related hubs
//      and cluster articles ("Also on OzoneNews").
//
// INLINE CITATION NUMBERS
//   Use <CitationRef n={1} /> in JSX to render a superscript [1] that scrolls
//   to #source-1 in this component. In raw content_html (static JSON), use:
//     <sup id="cite-ref-1"><a href="#source-1" class="text-blue-600 underline font-mono text-[10px]">[1]</a></sup>
//   The ↑ arrow on  each source links back to the inline cite anchor.
//
// Usage in page.tsx (full content file):
//   <SourcesInterlink
//     sources={[{ number: 1, url: "https://...", title: "...", author: "Jane Doe", date: "May 7, 2026" }]}
//     internalLinks={[{ href: "/claude", label: "Claude Hub" }]}
//     accentColor="blue"
//   />
//
// Usage in content_html (static JSON — passes as self-closing tag):
//   <SourcesInterlink sources={[{"number":1,"url":"...","title":"...","author":"Jane Doe","date":"May 7, 2026"}]} internalLinks={[{"href":"/claude","label":"Claude Hub"}]} accentColor="blue" />
// =============================================================================

export interface SourceItem {
  number: number;
  url: string;
  title: string;
  author?: string;   // e.g. "Reuters Staff" or "John Smith"
  date?: string;     // e.g. "May 7, 2026" or "2026-05-07"
  description?: string;
}

// ---------------------------------------------------------------------------
// CitationRef — inline superscript citation for use in JSX article content.
// Renders [n] as a superscript that links to #source-n and gives the source
// a ↑ back-reference target at #cite-ref-n.
//
// Example: "…Anthropic shipped Claude 4<CitationRef n={1} /> last week…"
// ---------------------------------------------------------------------------
export function CitationRef({ n }: { n: number }) {
  return (
    <sup id={`cite-ref-${n}`}>
      <a
        href={`#source-${n}`}
        className="text-blue-600 hover:text-blue-800 underline font-mono text-[10px] ml-0.5 align-super"
      >
        [{n}]
      </a>
    </sup>
  );
}

export interface InternalLinkItem {
  href: string;
  label: string;
  description?: string;
  /** Optional category chip shown above the label, e.g. "Gaming", "Tech", "Hub" */
  category?: string;
}

export interface SourcesInterlinkProps {
  sources?: SourceItem[];
  internalLinks?: InternalLinkItem[];
  heading?: string;
  accentColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
}

const ACCENT_BORDER: Record<string, string> = {
  blue:   'border-blue-500',
  green:  'border-green-500',
  orange: 'border-orange-500',
  purple: 'border-purple-500',
  red:    'border-red-500',
  gray:   'border-gray-400',
};

const ACCENT_TEXT: Record<string, string> = {
  blue:   'text-blue-600',
  green:  'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  red:    'text-red-600',
  gray:   'text-gray-600',
};

const ACCENT_PILL: Record<string, string> = {
  blue:   'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300',
  green:  'bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/40 dark:hover:bg-green-900/50 dark:text-green-300',
  orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 dark:text-orange-300',
  purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-300',
  red:    'bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-300',
  gray:   'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:hover:bg-gray-700/60 dark:text-gray-300',
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SourcesInterlink({
  sources = [],
  internalLinks = [],
  heading = 'Sources',
  accentColor = 'blue',
}: SourcesInterlinkProps) {
  const borderClass = ACCENT_BORDER[accentColor] ?? ACCENT_BORDER.blue;
  const textClass   = ACCENT_TEXT[accentColor]   ?? ACCENT_TEXT.blue;
  const pillClass   = ACCENT_PILL[accentColor]   ?? ACCENT_PILL.blue;

  if (!sources.length && !internalLinks.length) return null;

  return (
    <div className={`mt-12 border-t-2 ${borderClass} pt-6 not-prose text-gray-900 dark:text-gray-100`}>

      {/* Section heading */}
      <h2 className="text-xl font-bold mb-4">{heading}</h2>

      {/* External sources — clean numbered list, blue underlined links */}
      {sources.length > 0 && (
        <ol className="list-none pl-0 space-y-2 mb-8 text-sm leading-relaxed">
          {sources.map((src) => (
            <li
              key={src.number}
              id={`source-${src.number}`}
              className="scroll-mt-24"
            >
              <a
                href={`#cite-ref-${src.number}`}
                className="text-gray-500 hover:text-gray-700 mr-1 no-underline"
                title="Back to citation"
                aria-label={`Back to inline citation ${src.number}`}
              >
                ^
              </a>
              <span className="font-mono text-gray-700 dark:text-gray-300 mr-1">
                [{src.number}]
              </span>
              {src.author && (
                <span className="text-gray-700 dark:text-gray-300">
                  {src.author}.{' '}
                </span>
              )}
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${textClass} underline hover:opacity-80`}
              >
                {src.title}
              </a>
              {src.date && (
                <span className="text-gray-500 dark:text-gray-400">
                  {' '}({src.date})
                </span>
              )}
              {src.description && (
                <span className="text-gray-600 dark:text-gray-400">
                  {' — '}
                  {src.description}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      {/* Internal OzoneNews cross-links — card grid for strong visual interlinking */}
      {internalLinks.length > 0 && (
        <div>
          <h3 className="text-base font-bold mb-3">Further Reading on OzoneNews</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {internalLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`group flex items-center justify-between p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all no-underline`}
              >
                <div className="flex-1 min-w-0">
                  {link.category && (
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                      {link.category}
                    </span>
                  )}
                  <div className={`font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:${textClass.replace('text-', 'text-')} transition-colors truncate`}>
                    {link.label}
                  </div>
                  {link.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {link.description}
                    </div>
                  )}
                </div>
                <span className={`ml-3 text-gray-400 group-hover:${textClass} transition-colors flex-shrink-0 text-base`}>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
