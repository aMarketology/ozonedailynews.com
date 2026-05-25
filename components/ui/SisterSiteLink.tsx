'use client';

import React from 'react';

// =============================================================================
// SisterSiteLink — Cross-site promotional link to owire.org
//
// owire.org is ObjectWire's sister site focused on entertainment, creators,
// influencers, and pop culture content.
//
// Use this component inside JackArticle, NewsArticle, or any article body
// when the article topic has a relevant owire.org counterpart:
//   - Entertainment (film, TV, streaming, music)
//   - Creator economy (influencers, TikTok, YouTube, Twitch)
//   - Gaming culture and esports personalities
//   - Sports personalities and athlete brands
//
// Usage:
//   <SisterSiteLink
//     href="https://owire.org/creators/mrbeast"
//     label="MrBeast Creator Profile"
//     context="Creator Economy"
//   />
// =============================================================================

export interface SisterSiteLinkProps {
  /** Full owire.org URL */
  href: string;
  /** Link anchor text */
  label: string;
  /** Optional context tag shown as a badge (e.g. "Creator Profile", "Entertainment") */
  context?: string;
  /** Display variant — inline for body prose, card for sidebar/footer */
  variant?: 'inline' | 'card';
}

export function SisterSiteLink({ href, label, context, variant = 'inline' }: SisterSiteLinkProps) {
  if (variant === 'card') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm no-underline transition-colors hover:border-orange-400 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30 dark:hover:border-orange-600"
      >
        <span className="shrink-0 text-lg">🔗</span>
        <div className="min-w-0 flex-1">
          {context && (
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
              {context} · owire.org
            </span>
          )}
          <span className="block truncate font-semibold text-gray-900 group-hover:text-orange-700 dark:text-gray-100 dark:group-hover:text-orange-300">
            {label}
          </span>
        </div>
        <span className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5">→</span>
      </a>
    );
  }

  // inline variant — for use in article body prose
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {label}
      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 no-underline">
        [owire]
      </span>
    </a>
  );
}

// =============================================================================
// SisterSiteCallout — full-width callout bar for cross-promotion
// Use at the bottom of articles that have strong owire.org overlap
// =============================================================================

export interface SisterSiteCalloutProps {
  heading: string;
  description: string;
  href: string;
  ctaLabel?: string;
}

export function SisterSiteCallout({
  heading,
  description,
  href,
  ctaLabel = 'Read on owire.org →',
}: SisterSiteCalloutProps) {
  return (
    <div className="my-8 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 dark:border-orange-800 dark:from-orange-950/40 dark:to-amber-950/40">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
          Also on owire.org
        </span>
        <span className="h-px flex-1 bg-orange-200 dark:bg-orange-800" />
      </div>
      <p className="mb-1 text-base font-bold text-gray-900 dark:text-gray-100">{heading}</p>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 no-underline"
      >
        {ctaLabel}
      </a>
    </div>
  );
}
