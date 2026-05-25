'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ProfilePageSchema } from '@/components/articles/ProfilePageSchema';
import { Breadcrumb } from '@/components/nav/Breadcrumb';
import ArticleFooter from '@/components/articles/ArticleFooter';
import ArticleViewTracker from '@/components/articles/ArticleViewTracker';

// =============================================================================
// CREATOR ARTICLE — Reusable profile/biography article layout
//
// Based on: AlysaArticle design (OzoneNews Winter Olympics)
// Use for: Athletes, influencers, founders, artists, creators, authors
//
// Layout: Hero banner + 2/3 article body + 1/3 sticky sidebar
//
// Exports:
//   CreatorArticle       — Main wrapper (schema + hero + grid + sidebar)
//   CreatorSection       — Section block with bold heading + optional prose
//   CreatorTable         — Data table (podiums, results, rankings, stats)
//   CreatorCalloutBox    — Highlighted callout (key turning points, notes)
//   CreatorQuote         — Featured pull quote with attribution
//   CreatorTikTok        — TikTok embed block (lazy-loads script)
//   CreatorStat          — Single large stat highlight card
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export type CreatorBadgeStyle = 'default' | 'achievement' | 'secondary';

export interface CreatorBadge {
  label: string;
  /** Visual style of the badge. Defaults to 'default'. */
  style?: CreatorBadgeStyle;
}

export interface CreatorInfoRow {
  label: string;
  value: string | React.ReactNode;
  /** Optional URL — renders value as a clickable link */
  href?: string;
}

export interface CreatorTimelineItem {
  year: string;
  event: string;
}

export interface CreatorTableColumn {
  key: string;
  header: string;
  /** Render cell content. If omitted, raw string value is shown. */
  render?: (value: string) => React.ReactNode;
}

export interface CreatorTableRow {
  [key: string]: string;
}

export interface CreatorCalloutItem {
  label: string;
  detail: string;
}

export interface CreatorCTAButton {
  href: string;
  label: string;
  icon?: string;
  /** Visual variant: 'primary' is semi-transparent white, 'secondary' is dark, 'accent' uses accent color */
  variant?: 'primary' | 'secondary' | 'accent';
}

export interface CreatorRelatedLink {
  href: string;
  label: string;
}

export type CreatorCalloutColor = 'yellow' | 'blue' | 'green' | 'red' | 'purple';

export interface CreatorSidebarCallout {
  /** Emoji + label shown as title, e.g. "🥇 Olympic Champion" */
  title: string;
  body: string | React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  color?: CreatorCalloutColor;
}

export interface CreatorSchema {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime: string;
  author: string;
  authorUrl?: string;
  articleUrl: string;
  imageUrl?: string;
  section: string;
  keywords: string[];
}

export interface CreatorHero {
  image: { src: string; alt: string };
  /** CSS gradient string for the banner background.
   *  Default: dark navy → electric blue → amber */
  gradient?: string;
  badges: CreatorBadge[];
  name: string;
  /** Short role / achievement line shown beneath the name */
  subtitle: string;
  /** 2–3 sentence description shown in the hero */
  description: string;
  ctaButtons?: CreatorCTAButton[];
}

export interface CreatorSidebar {
  infobox: {
    image: { src: string; alt: string };
    /** Display name inside the infobox image overlay */
    name: string;
    /** Short subtitle inside the infobox image overlay */
    subtitle: string;
    rows: CreatorInfoRow[];
  };
  /** Optional achievement / CTA callout below the infobox */
  callout?: CreatorSidebarCallout;
  /** Career / key events timeline */
  timeline?: CreatorTimelineItem[];
  /** Related articles / links */
  relatedLinks?: CreatorRelatedLink[];
  meta: {
    publishedDate: string;
    updatedDate?: string;
    author: string;
    category: string;
  };
}

export interface CreatorArticleProps {
  schema: CreatorSchema;
  breadcrumbs: Array<{ name: string; item: string }>;
  hero: CreatorHero;
  sidebar: CreatorSidebar;
  /** Set true if any section uses <CreatorTikTok> — loads TikTok embed.js */
  tiktokEmbed?: boolean;
  /** Display tags shown in the article footer (FiledUnder). Defaults to schema.keywords slice. */
  tags?: string[];
  /** Other creator profile cards shown below the Article Info sidebar card. */
  relatedCreators?: Array<{
    name: string;
    subtitle: string;
    imageSrc: string;
    imageAlt: string;
    href: string;
  }>;
  children: React.ReactNode;
}

// =============================================================================
// BADGE STYLES
// =============================================================================

const badgeStyleMap: Record<CreatorBadgeStyle, React.CSSProperties> = {
  default: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '3px 12px',
    borderRadius: 999,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  secondary: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '3px 12px',
    borderRadius: 999,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  achievement: {
    background: '#b45309',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '3px 12px',
    borderRadius: 999,
    letterSpacing: '0.06em',
  },
};

// =============================================================================
// CTA BUTTON STYLES
// =============================================================================

function ctaStyle(variant: CreatorCTAButton['variant'] = 'primary', accentColor: string): React.CSSProperties {
  if (variant === 'primary') {
    return { background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' };
  }
  if (variant === 'secondary') {
    return { background: '#1e3a5f', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' };
  }
  // accent
  return { background: accentColor, color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' };
}

// =============================================================================
// SIDEBAR CALLOUT COLORS
// =============================================================================

const calloutColorMap: Record<CreatorCalloutColor, { wrapper: string; cta: string }> = {
  yellow: { wrapper: 'bg-yellow-50 border-yellow-300', cta: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' },
  blue:   { wrapper: 'bg-blue-50 border-blue-300',     cta: 'bg-blue-600 hover:bg-blue-700 text-white' },
  green:  { wrapper: 'bg-green-50 border-green-300',   cta: 'bg-green-600 hover:bg-green-700 text-white' },
  red:    { wrapper: 'bg-red-50 border-red-300',       cta: 'bg-red-600 hover:bg-red-700 text-white' },
  purple: { wrapper: 'bg-purple-50 border-purple-300', cta: 'bg-purple-600 hover:bg-purple-700 text-white' },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CreatorArticle({
  schema,
  breadcrumbs,
  hero,
  sidebar,
  tiktokEmbed = false,
  tags,
  relatedCreators,
  children,
}: CreatorArticleProps) {
  const gradient =
    hero.gradient ??
    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #b45309 100%)';

  const articleSlug = schema.articleUrl.replace('https://www.ozonenetwork.news', '');

  return (
    <>
      <ProfilePageSchema
        personName={hero.name}
        pageTitle={schema.title}
        description={schema.description}
        pageUrl={schema.articleUrl}
        imageUrl={schema.imageUrl}
        publishedTime={schema.publishedTime}
        modifiedTime={schema.modifiedTime}
        sameAs={sidebar.infobox.rows
          .map((r) => (typeof r.href === 'string' ? r.href : ''))
          .filter(Boolean)}
        keywords={schema.keywords}
      />

      {tiktokEmbed && (
        <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      )}

      <div className="min-h-screen bg-[#faf9f6]">

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </div>

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <header style={{ background: gradient }}>

          {/* Mobile-only full-width portrait image */}
          <div className="relative w-full sm:hidden" style={{ aspectRatio: '4/5', maxHeight: '75vw' }}>
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority
            />
            {/* gradient fade into the content below */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to bottom, transparent 40%, ${gradient.match(/#[0-9a-f]{6}/i)?.[0] ?? '#0f172a'} 100%)`,
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

              {/* Thumbnail — hidden on mobile (replaced by full-width image above) */}
              <div
                className="hidden sm:block relative w-36 h-36 lg:w-64 lg:h-64 rounded-xl overflow-hidden border-4 shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 1024px) 256px, 144px"
                  priority
                />
              </div>

              <div className="flex-1">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {hero.badges.map((badge, i) => (
                    <span key={i} style={badgeStyleMap[badge.style ?? 'default']}>
                      {badge.label}
                    </span>
                  ))}
                </div>

                {/* Name + Subtitle */}
                <h1
                  style={{
                    color: '#fff',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {hero.name}
                  <span
                    style={{
                      display: 'block',
                      fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.8)',
                      marginTop: '0.4rem',
                    }}
                  >
                    {hero.subtitle}
                  </span>
                </h1>

                {/* Description */}
                <p
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    maxWidth: '600px',
                    marginBottom: '1.2rem',
                  }}
                >
                  {hero.description}
                </p>

                {/* CTA Buttons */}
                {hero.ctaButtons && hero.ctaButtons.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {hero.ctaButtons.map((btn, i) => (
                      <Link key={i} href={btn.href} style={ctaStyle(btn.variant, '#b45309')}>
                        {btn.icon && <span>{btn.icon}</span>}
                        {btn.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Byline / Dateline ──────────────────────────────────── */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-gray-800">By {sidebar.meta.author}</span>
            <span className="text-gray-300" aria-hidden="true">|</span>
            <time dateTime={schema.publishedTime} className="text-gray-500">
              Published {sidebar.meta.publishedDate}
            </time>
            {sidebar.meta.updatedDate && (
              <>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <time dateTime={schema.modifiedTime ?? schema.publishedTime} className="text-gray-500">
                  Updated {sidebar.meta.updatedDate}
                </time>
              </>
            )}
            <span className="text-gray-300" aria-hidden="true">|</span>
            <span className="text-gray-500">{sidebar.meta.category}</span>
          </div>
        </div>

        {/* ── Main Content Grid ────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* ── Article Body ───────────────────────────────────── */}
            <article className="lg:col-span-2 space-y-12">
              <ArticleViewTracker
                slug={articleSlug}
                title={schema.title}
                url={schema.articleUrl}
                image={schema.imageUrl}
                category={schema.section}
              />
              {children}
              <ArticleFooter
                slug={articleSlug}
                title={schema.title}
                url={schema.articleUrl}
                image={schema.imageUrl}
                category={schema.section}
                tags={tags ?? schema.keywords.slice(0, 8)}
                author={{ name: sidebar.meta.author }}
              />
            </article>

            {/* ── Sidebar ────────────────────────────────────────── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">

                {/* Infobox */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="relative w-full h-56 lg:h-[448px]">
                    <Image
                      src={sidebar.infobox.image.src}
                      alt={sidebar.infobox.image.alt}
                      fill
                      className="object-cover object-top"
                      sizes="(min-width: 1024px) 400px, 300px"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15,23,42,0.90) 0%, transparent 50%)',
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
                      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                        {sidebar.infobox.name}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', margin: '2px 0 0' }}>
                        {sidebar.infobox.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-sm">
                    {sidebar.infobox.rows.map((row, i) => (
                      <div key={i} className="flex px-4 py-2.5 gap-2">
                        <span className="text-gray-500 w-24 shrink-0 text-xs font-semibold">{row.label}</span>
                        {row.href ? (
                          <a
                            href={row.href}
                            target={row.href.startsWith('http') ? '_blank' : undefined}
                            rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="font-medium text-blue-600 hover:text-blue-800 underline text-xs break-all"
                          >
                            {row.value as React.ReactNode}
                          </a>
                        ) : (
                          <span className="font-medium text-gray-800 text-xs">{row.value as React.ReactNode}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievement / CTA Callout */}
                {sidebar.callout && (() => {
                  const c = sidebar.callout!;
                  const colors = calloutColorMap[c.color ?? 'yellow'];
                  return (
                    <div className={`border-2 rounded-xl p-5 ${colors.wrapper}`}>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wider">
                        {c.title}
                      </h3>
                      <div className="text-xs text-gray-600 mb-3 leading-relaxed">
                        {c.body}
                      </div>
                      {c.ctaLabel && c.ctaHref && (
                        <Link
                          href={c.ctaHref}
                          className={`block text-center font-bold text-xs py-2.5 px-4 rounded-lg transition-colors ${colors.cta}`}
                        >
                          {c.ctaLabel}
                        </Link>
                      )}
                    </div>
                  );
                })()}

                {/* Career Timeline */}
                {sidebar.timeline && sidebar.timeline.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                      Career Timeline
                    </h3>
                    <div className="space-y-3">
                      {sidebar.timeline.map((t, i) => (
                        <div key={i} className="flex gap-3 text-xs">
                          <span className="text-blue-700 font-bold w-10 shrink-0">{t.year}</span>
                          <span className="text-gray-600 leading-relaxed">{t.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Coverage */}
                {sidebar.relatedLinks && sidebar.relatedLinks.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                      Related Coverage
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {sidebar.relatedLinks.map((link, i) => (
                        <li key={i}>
                          <Link href={link.href} className="text-blue-600 hover:underline">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Article Meta */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-600 text-xs uppercase tracking-wider">Article Info</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex px-4 py-2.5 gap-2">
                      <span className="text-gray-400 w-20 shrink-0 text-xs font-semibold">Published</span>
                      <span className="font-medium text-gray-700 text-xs">{sidebar.meta.publishedDate}</span>
                    </div>
                    {sidebar.meta.updatedDate && (
                      <div className="flex px-4 py-2.5 gap-2">
                        <span className="text-gray-400 w-20 shrink-0 text-xs font-semibold">Updated</span>
                        <span className="font-medium text-gray-700 text-xs">{sidebar.meta.updatedDate}</span>
                      </div>
                    )}
                    <div className="flex px-4 py-2.5 gap-2">
                      <span className="text-gray-400 w-20 shrink-0 text-xs font-semibold">Author</span>
                      <span className="font-medium text-gray-700 text-xs">{sidebar.meta.author}</span>
                    </div>
                    <div className="flex px-4 py-2.5 gap-2">
                      <span className="text-gray-400 w-20 shrink-0 text-xs font-semibold">Category</span>
                      <span className="font-medium text-gray-700 text-xs">{sidebar.meta.category}</span>
                    </div>
                  </div>
                </div>

                {/* Related Creator Profiles */}
                {relatedCreators && relatedCreators.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <h3 className="font-bold text-gray-600 text-xs uppercase tracking-wider">More Creator Profiles</h3>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {relatedCreators.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                              <Image
                                src={c.imageSrc}
                                alt={c.imageAlt}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600">{c.name}</p>
                              <p className="text-xs text-gray-400 truncate">{c.subtitle}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// CREATOR IMAGE GALLERY
// A responsive 3-column photo grid with rounded borders and click-to-open
// lightbox. Place between sections to break up text and showcase photos.
// =============================================================================

export interface CreatorGalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface CreatorImageGalleryProps {
  images: CreatorGalleryImage[];
  /** Optional section heading above the grid */
  heading?: string;
}

export function CreatorImageGallery({ images, heading }: CreatorImageGalleryProps) {
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  return (
    <div className="not-prose my-8">
      {heading && (
        <h3 className="text-lg font-bold text-gray-900 mb-4">{heading}</h3>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightbox(i)}
            className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            style={{ aspectRatio: '3/4' }}
            aria-label={`View ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover object-top"
              sizes="(min-width: 1024px) 200px, (min-width: 768px) 33vw, 33vw"
            />
            {img.caption && (
              <div
                className="absolute inset-x-0 bottom-0 px-2 py-1.5"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
              >
                <p className="text-white text-xs font-medium line-clamp-1">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <div
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-semibold"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              Close ×
            </button>

            {/* Image */}
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image
                src={images[lightbox].src}
                alt={images[lightbox].alt}
                fill
                className="object-cover object-top"
                sizes="448px"
                priority
              />
            </div>

            {images[lightbox].caption && (
              <p className="text-white/75 text-sm text-center mt-3 px-2">
                {images[lightbox].caption}
              </p>
            )}

            {/* Counter */}
            <p className="text-white/40 text-xs text-center mt-1">
              {lightbox + 1} / {images.length}
            </p>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((lightbox - 1 + images.length) % images.length);
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((lightbox + 1) % images.length);
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CREATOR SECTION
// Wraps a block of article content with a bold section heading.
// =============================================================================

export interface CreatorSectionProps {
  heading: string;
  children: React.ReactNode;
  /** Set true to render children inside a `prose` div */
  prose?: boolean;
}

export function CreatorSection({ heading, children, prose = true }: CreatorSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-900 pb-2">
        {heading}
      </h2>
      {prose ? (
        <div className="prose prose-lg max-w-none">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

// =============================================================================
// CREATOR TABLE
// Generic data table — podiums, results, rankings, stats, comparisons.
// =============================================================================

export interface CreatorTableProps {
  columns: CreatorTableColumn[];
  rows: CreatorTableRow[];
  /** Key in the row whose value should be bolded (e.g. the subject's name) */
  highlightKey?: string;
  highlightValue?: string;
}

export function CreatorTable({ columns, rows, highlightKey, highlightValue }: CreatorTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 mt-6">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#0f172a', color: '#fff' }}>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => {
            const isHighlighted =
              highlightKey && highlightValue
                ? row[highlightKey] === highlightValue
                : false;
            return (
              <tr key={i} className={isHighlighted ? 'bg-yellow-50' : 'even:bg-gray-50'}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 ${isHighlighted ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                  >
                    {col.render ? col.render(row[col.key] ?? '') : (row[col.key] ?? ', ')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// CREATOR CALLOUT BOX
// Highlighted callout — key turning points, notes, summaries.
// =============================================================================

export interface CreatorCalloutBoxProps {
  heading: string;
  items: CreatorCalloutItem[];
  color?: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
}

const calloutBoxColors = {
  blue:   'bg-blue-50 border-blue-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  green:  'bg-green-50 border-green-200',
  red:    'bg-red-50 border-red-200',
  purple: 'bg-purple-50 border-purple-200',
};

const calloutBoxArrows = {
  blue:   'text-blue-600',
  yellow: 'text-yellow-600',
  green:  'text-green-600',
  red:    'text-red-600',
  purple: 'text-purple-600',
};

export function CreatorCalloutBox({ heading, items, color = 'blue' }: CreatorCalloutBoxProps) {
  return (
    <div className={`not-prose mt-6 border rounded-xl p-5 ${calloutBoxColors[color]}`}>
      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
        {heading}
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className={`font-bold shrink-0 ${calloutBoxArrows[color]}`}>→</span>
            <div>
              <span className="font-semibold text-gray-900">{item.label}: </span>
              <span className="text-gray-600">{item.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CREATOR QUOTE
// Large pull quote with optional attribution.
// =============================================================================

export interface CreatorQuoteProps {
  quote: string;
  attribution?: string;
  role?: string;
}

export function CreatorQuote({ quote, attribution, role }: CreatorQuoteProps) {
  return (
    <blockquote className="not-prose my-8 pl-5 border-l-4 border-gray-900">
      <p className="text-xl font-semibold text-gray-900 leading-relaxed italic">
        &ldquo;{quote}&rdquo;
      </p>
      {attribution && (
        <footer className="mt-3 text-sm text-gray-500">
         , <span className="font-semibold text-gray-700">{attribution}</span>
          {role && <span className="text-gray-400">, {role}</span>}
        </footer>
      )}
    </blockquote>
  );
}

// =============================================================================
// CREATOR STAT
// Single large stat highlight card — great for hero metrics inline with prose.
// =============================================================================

export interface CreatorStatProps {
  value: string;
  label: string;
  sub?: string;
  color?: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray';
}

const statColors = {
  blue:   'bg-blue-600 text-white',
  yellow: 'bg-yellow-400 text-gray-900',
  green:  'bg-green-600 text-white',
  red:    'bg-red-600 text-white',
  purple: 'bg-purple-600 text-white',
  gray:   'bg-gray-900 text-white',
};

export function CreatorStat({ value, label, sub, color = 'blue' }: CreatorStatProps) {
  return (
    <div className={`not-prose inline-flex flex-col items-center justify-center rounded-xl px-6 py-4 text-center ${statColors[color]}`}>
      <span className="text-3xl font-black leading-none">{value}</span>
      <span className="text-sm font-semibold mt-1 opacity-90">{label}</span>
      {sub && <span className="text-xs opacity-70 mt-0.5">{sub}</span>}
    </div>
  );
}

// =============================================================================
// CREATOR TIKTOK
// TikTok embed block. Requires tiktokEmbed={true} on the parent CreatorArticle.
// =============================================================================

export interface CreatorTikTokProps {
  videoId: string;
  username: string;
  /** Brief caption shown above the embed */
  caption?: string;
}

export function CreatorTikTok({ videoId, username, caption }: CreatorTikTokProps) {
  const videoUrl = `https://www.tiktok.com/@${username}/video/${videoId}`;
  const userUrl  = `https://www.tiktok.com/@${username}?refer=embed`;

  return (
    <div className="not-prose">
      {caption && (
        <p className="text-gray-600 text-sm mb-5">{caption}</p>
      )}
      <div className="flex justify-center">
        <blockquote
          className="tiktok-embed"
          cite={videoUrl}
          data-video-id={videoId}
          style={{ maxWidth: '605px', minWidth: '325px', width: '100%' }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              title={`@${username}`}
              href={userUrl}
            >
              @{username}
            </a>
          </section>
        </blockquote>
      </div>
    </div>
  );
}

export default CreatorArticle;
