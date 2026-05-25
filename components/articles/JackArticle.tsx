'use client';

import React from 'react';
import Link from 'next/link';
import ArticleViewTracker from '@/components/articles/ArticleViewTracker';
import ArticleFooter from '@/components/articles/ArticleFooter';
import RelatedArticles from '@/components/discovery/RelatedArticles';

// =============================================================================
// JACK ARTICLE — Premium reusable article layout (Google News optimized)
//
// Combines two OzoneNews design systems:
//   1. Strategic Report  — Monochrome, serif-heavy, uppercase, research-grade
//      (based on /finance/articles/the-greenland-fulcrum-and-the-golden-dome-architecture)
//   2. Dynamic News      — Hero image, sidebar, category badges, interactive blocks
//      (based on /finance/articles/how-the-cme-rules-the-world)
//
// Use `layout="report"` for full-width research reports.
// Use `layout="news"` for sidebar + content news articles.
//
// Exports:
//   JackArticle         — Main wrapper (schema + header + body + sidebar + footer)
//   JackCallout         — 12px left-border callout box
//   JackCard            — Border card for asset / data blocks
//   JackCardGrid        — Responsive grid for JackCards
//   JackIndicatorGrid   — Strategic indicator summary grid
//   JackSideBlock       — Thick left-border indented block
//   JackSection         — Numbered section heading + wrapper
//   JackSubheading      — Subsection heading
//   JackCaseOverview    — Key facts / overview box
//   JackStats           — Statistics display box
//   JackProcess         — Step-by-step process diagram
//   JackQuote           — Blockquote with attribution
//   JackImage           — Image with caption + credit
//   JackVideo           — Video embed (YouTube/Vimeo)
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export type JackAccentColor = 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'black';

export interface JackAuthor {
  name: string;
  slug?: string;
  avatar?: string;
  initials?: string;
  department?: string;
  url?: string;
}

export interface JackBreadcrumb {
  href: string;
  label: string;
}

export interface JackCategoryBadge {
  label: string;
  color?: JackAccentColor;
}

export interface JackHeroImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export interface JackRelatedArticle {
  href: string;
  category: string;
  categoryColor?: string;
  title: string;
}

export interface JackTimelineEvent {
  date: string;
  description: string;
  highlight?: boolean;
}

export interface JackDocumentLink {
  href: string;
  label: string;
  icon?: string;
}

export interface JackSourceReference {
  number: number;
  url: string;
  title: string;
  description?: string;
}

export interface JackArticleProps {
  // --- Layout ---
  /** 'report' = full-width Greenland-style research report.
   *  'news'   = sidebar + content CME-style news article. */
  layout?: 'report' | 'news';

  // --- Header ---
  /** Category label above title — string for report, badges for news */
  categoryLabel?: string;
  /** Category badges (used in 'news' layout) */
  categories?: JackCategoryBadge[];
  /** Publish date (display string, e.g. "February 1, 2026") */
  publishDate: string;
  /** ISO publish date for structured data (e.g. "2026-02-01T08:00:00Z") */
  publishDateISO?: string;
  /** ISO modified date for structured data */
  modifiedDateISO?: string;
  /** Read time label */
  readTime?: string;
  /** Main title */
  title: string;
  /** Subtitle or deck (news layout) */
  subtitle?: string;
  /** Subject line in thick left-border bar (report layout) */
  subject?: string;
  /** Hero image (optional) */
  heroImage?: JackHeroImage;
  /** Breadcrumb navigation */
  breadcrumbs?: JackBreadcrumb[];

  // --- Author ---
  author?: JackAuthor;

  // --- Body ---
  children: React.ReactNode;

  // --- Sidebar (news layout) ---
  relatedArticles?: JackRelatedArticle[];
  timeline?: JackTimelineEvent[];
  documents?: JackDocumentLink[];
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;

  // --- Footer ---
  sources?: JackSourceReference[];
  showCorrections?: boolean;
  showEditorialStandards?: boolean;
  footerTagline?: string;
  footerLinks?: Array<{ href: string; label: string }>;

  // --- Theme ---
  accentColor?: JackAccentColor;

  // --- Engagement / Storage ---
  /** Article slug (e.g. "my-article") — used to key likes, saves, view history, and comments. */
  slug?: string;

  // --- SEO / Google News Schema ---
  /** Canonical URL for the article */
  articleUrl?: string;
  /** Article description for structured data */
  description?: string;
  /** Section for structured data (e.g. "Finance", "Technology") */
  section?: string;
  /** Keywords for structured data */
  keywords?: string[];
  /** Article UUID for archival tracking */
  uuid?: string;
  /** Article version */
  version?: string;
}

// =============================================================================
// ACCENT COLOR MAPS
// =============================================================================

const accentBorderMap: Record<string, string> = {
  gray: 'border-gray-900',
  blue: 'border-blue-700',
  green: 'border-green-700',
  orange: 'border-orange-600',
  red: 'border-red-700',
  purple: 'border-purple-700',
  black: 'border-black',
};

const accentBorderLightMap: Record<string, string> = {
  gray: 'border-gray-400',
  blue: 'border-blue-300',
  green: 'border-green-300',
  orange: 'border-orange-300',
  red: 'border-red-300',
  purple: 'border-purple-300',
  black: 'border-gray-600',
};

const accentBorderMutedMap: Record<string, string> = {
  gray: 'border-gray-100',
  blue: 'border-blue-100',
  green: 'border-green-100',
  orange: 'border-orange-100',
  red: 'border-red-100',
  purple: 'border-purple-100',
  black: 'border-gray-200',
};

const accentBgMap: Record<string, string> = {
  gray: 'bg-black',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  orange: 'bg-orange-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
  black: 'bg-black',
};

const accentBadgeBgMap: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-900 border-gray-200',
  blue: 'bg-blue-600 text-white border-blue-600',
  green: 'bg-green-600 text-white border-green-600',
  orange: 'bg-orange-600 text-white border-orange-600',
  red: 'bg-red-600 text-white border-red-600',
  purple: 'bg-purple-600 text-white border-purple-600',
  black: 'bg-black text-white border-black',
};

const accentTextMap: Record<string, string> = {
  gray: 'text-black',
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  black: 'text-black',
};

const accentCaseOverviewMap: Record<string, { bg: string; border: string; bullet: string }> = {
  gray: { bg: 'bg-gray-100 border-black', border: 'border-l-4', bullet: 'text-black' },
  blue: { bg: 'bg-blue-50 border-blue-600', border: 'border-l-4', bullet: 'text-blue-600' },
  green: { bg: 'bg-green-50 border-green-600', border: 'border-l-4', bullet: 'text-green-600' },
  orange: { bg: 'bg-orange-50 border-orange-600', border: 'border-l-4', bullet: 'text-orange-600' },
  red: { bg: 'bg-red-50 border-red-600', border: 'border-l-4', bullet: 'text-red-600' },
  purple: { bg: 'bg-purple-50 border-purple-600', border: 'border-l-4', bullet: 'text-purple-600' },
  black: { bg: 'bg-gray-100 border-black', border: 'border-l-4', bullet: 'text-black' },
};

// =============================================================================
// GOOGLE NEWS JSON-LD SCHEMA (built-in)
// =============================================================================

function JackSchema({
  title,
  description,
  author,
  publishDateISO,
  modifiedDateISO,
  articleUrl,
  heroImage,
  section,
  keywords,
}: {
  title: string;
  description?: string;
  author?: JackAuthor;
  publishDateISO?: string;
  modifiedDateISO?: string;
  articleUrl?: string;
  heroImage?: JackHeroImage;
  section?: string;
  keywords?: string[];
}) {
  if (!articleUrl) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description || title,
    ...(heroImage ? { image: [heroImage.src] } : {}),
    datePublished: publishDateISO,
    dateModified: modifiedDateISO || publishDateISO,
    author: {
      '@type': 'Person',
      name: author?.name || 'OzoneNews Staff',
      ...(author?.url ? { url: author.url } : {}),
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'OzoneNews',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ozonenetwork.news/OzoneNews-logo.png',
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    ...(section ? { articleSection: section } : {}),
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =============================================================================
// JACK CALLOUT — 12px left-border callout box
// =============================================================================

export function JackCallout({
  label = 'Industrial Proof:',
  children,
  accentColor = 'gray',
}: {
  label?: string;
  children: React.ReactNode;
  accentColor?: JackAccentColor;
}) {
  return (
    <div className={`bg-gray-50 p-8 border-l-[12px] ${accentBorderLightMap[accentColor] || 'border-gray-400'} mb-12`}>
      {label && (
        <p className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest font-sans">
          {label}
        </p>
      )}
      <div className="text-gray-700 italic leading-relaxed text-xl">{children}</div>
    </div>
  );
}

// =============================================================================
// JACK CARD — Border card for asset / data comparisons
// =============================================================================

export function JackCard({
  title,
  subtitle,
  description,
  color,
  children,
  variant = 'white',
}: {
  title: string;
  subtitle?: string;
  description?: string;
  color?: JackAccentColor;
  children?: React.ReactNode;
  variant?: 'white' | 'gray';
}) {
  const bg =
    variant === 'gray'
      ? 'bg-gray-50 border-gray-100'
      : 'bg-white border-gray-200 shadow-sm';

  const colorText = color ? accentTextMap[color] ?? '' : '';

  return (
    <div className={`border ${bg} p-8 rounded-sm`}>
      <h4 className="font-black text-gray-900 mb-1 uppercase tracking-tight text-lg">
        {title}
      </h4>
      {subtitle && (
        <p className={`text-sm font-semibold mb-3 ${colorText}`}>{subtitle}</p>
      )}
      {description ? (
        <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed font-serif space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// JACK CARD GRID — Responsive grid wrapper for JackCards
// =============================================================================

export function JackCardGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode;
  columns?: 2 | 3;
}) {
  const gridCols = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 mb-8`}>{children}</div>
  );
}

// =============================================================================
// JACK INDICATOR GRID — Strategic indicator summary (bottom-of-article)
// =============================================================================

export interface JackIndicator {
  label: string;
  /** Display value (e.g. "May 27, 2026"). Used when rendering with `value`+`trend` format. */
  value?: string;
  /** Description text. Used with the original `items` array format. */
  description?: string;
  trend?: 'positive' | 'neutral' | 'negative';
}

export function JackIndicatorGrid({
  title,
  heading: headingAlias,
  items,
}: {
  title?: string;
  /** Alias for `title` — used when content_html stores the prop as `heading`. */
  heading?: string;
  items: JackIndicator[];
}) {
  const gridTitle = headingAlias ?? title ?? 'Strategic Indicators';
  const cols =
    items.length <= 2
      ? 'md:grid-cols-2'
      : items.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-4';

  const trendIcon: Record<string, string> = {
    positive: '▲',
    negative: '▼',
    neutral: '–',
  };

  return (
    <div className="bg-gray-50 border border-gray-200 p-12 mt-12 mb-8">
      {gridTitle && (
        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-8">
          {gridTitle}
        </h4>
      )}
      <div className={`grid grid-cols-1 ${cols} gap-12`}>
        {items.map((item) => (
          <div key={item.label}>
            <span className="block font-black text-gray-900 uppercase text-xs mb-1">
              {item.label}
            </span>
            {item.value && (
              <span className="block text-xl font-black text-gray-800 mb-1">
                {item.value}
                {item.trend && (
                  <span className={`ml-2 text-sm ${item.trend === 'positive' ? 'text-green-600' : item.trend === 'negative' ? 'text-red-600' : 'text-gray-400'}`}>
                    {trendIcon[item.trend]}
                  </span>
                )}
              </span>
            )}
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// JACK SIDE BLOCK — Thick left-border indented block for sub-items
// =============================================================================

export function JackSideBlock({
  title,
  heading: headingAlias,
  children,
  accentColor = 'gray',
}: {
  title?: string;
  /** Alias for `title` — used when content_html stores the prop as `heading`. */
  heading?: string;
  children: React.ReactNode;
  accentColor?: JackAccentColor;
}) {
  const blockTitle = headingAlias ?? title ?? '';
  return (
    <div className={`border-l-[12px] ${accentBorderMutedMap[accentColor] || 'border-gray-100'} pl-10 mb-8`}>
      <h4 className="text-xl font-black text-gray-900 mb-4 tracking-tight uppercase">
        {blockTitle}
      </h4>
      <div className="text-lg leading-relaxed text-gray-700">{children}</div>
    </div>
  );
}

// =============================================================================
// JACK SECTION — Numbered section heading + content wrapper
// =============================================================================

export function JackSection({
  number,
  title,
  heading: headingAlias,
  image,
  imageAlt,
  children,
  accentColor = 'gray',
}: {
  number?: number | string;
  /** Section title. Can also be passed as `heading` (alias). */
  title?: string;
  /** Alias for `title` — used when content_html stores the prop as `heading`. */
  heading?: string;
  /** Optional section thumbnail image URL. */
  image?: string;
  /** Alt text for the section thumbnail. */
  imageAlt?: string;
  children: React.ReactNode;
  accentColor?: JackAccentColor;
}) {
  const sectionTitle = headingAlias ?? title ?? '';
  const sectionHeading = number ? `${number}. ${sectionTitle}` : sectionTitle;

  return (
    <section className="mb-24">
      <h2
        className={`text-2xl md:text-3xl font-black text-gray-900 mb-8 border-b-2 ${
          accentBorderMap[accentColor] || 'border-gray-900'
        } pb-4 tracking-tight uppercase`}
      >
        {sectionHeading}
      </h2>
      {image && (
        <figure className="mb-8 overflow-hidden rounded-sm border border-gray-100">
          <img
            src={image}
            alt={imageAlt ?? sectionTitle}
            className="w-full h-48 md:h-64 object-cover object-center"
          />
        </figure>
      )}
      {children}
    </section>
  );
}

// =============================================================================
// JACK SUBHEADING — Subsection heading
// =============================================================================

export function JackSubheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">
      {children}
    </h3>
  );
}

// =============================================================================
// JACK CASE OVERVIEW — Key facts / overview box
// =============================================================================

export function JackCaseOverview({
  title = 'CASE OVERVIEW',
  items,
  accentColor = 'gray',
}: {
  title?: string;
  items: Array<{ label: string; value: string }>;
  accentColor?: JackAccentColor;
}) {
  const colors = accentCaseOverviewMap[accentColor] || accentCaseOverviewMap.gray;

  return (
    <div className={`${colors.bg} ${colors.border} p-6 mb-8 not-prose`}>
      <h3 className="font-bold text-sm tracking-wider mb-3">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`${colors.bullet} font-bold`}>&bull;</span>
            <span>
              <strong>{item.label}</strong> {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// JACK STATS — Statistics display box
// =============================================================================

export function JackStats({
  title = 'BY THE NUMBERS',
  stats,
  accentColor = 'gray',
}: {
  title?: string;
  stats: Array<{ value: string; label: string; description?: string }>;
  accentColor?: JackAccentColor;
}) {
  const statsBgMap: Record<string, string> = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
    black: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`${statsBgMap[accentColor] || statsBgMap.gray} border p-6 my-8 not-prose`}>
      <h4 className="font-bold text-sm mb-3">{title}</h4>
      <div className={`grid grid-cols-2 ${stats.length > 2 ? 'md:grid-cols-4' : 'md:grid-cols-2'} gap-4 text-center`}>
        {stats.map((stat, i) => (
          <div key={i}>
            <p className={`text-3xl font-black ${accentTextMap[accentColor] || 'text-black'}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.label}</p>
            {stat.description && (
              <p className="text-xs text-gray-400 mt-1 leading-snug">{stat.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// JACK PROCESS — Step-by-step process diagram
// =============================================================================

export function JackProcess({
  title,
  steps,
  accentColor = 'gray',
}: {
  title: string;
  steps: Array<{ title: string; description: string }>;
  accentColor?: JackAccentColor;
}) {
  return (
    <div className="bg-gray-50 p-6 my-8 not-prose">
      <h4 className="font-bold text-sm mb-4">{title}</h4>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div
              className={`${accentBgMap[accentColor] || 'bg-black'} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0`}
            >
              {i + 1}
            </div>
            <div>
              <p className="font-semibold">{step.title}</p>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// JACK QUOTE — Blockquote with attribution
// =============================================================================

export function JackQuote({
  quote,
  author,
  title,
  accentColor = 'gray',
}: {
  quote: string;
  author?: string;
  title?: string;
  accentColor?: JackAccentColor;
}) {
  return (
    <blockquote
      className={`border-l-4 ${accentBorderMap[accentColor] || 'border-black'} pl-6 italic my-8 text-xl`}
    >
      {quote}
      {(author || title) && (
        <footer className="text-sm text-gray-500 mt-2 not-italic">
          {author && <span>{author}</span>}
          {title && <span>, {title}</span>}
        </footer>
      )}
    </blockquote>
  );
}

// =============================================================================
// JACK IMAGE — Image with caption + credit
// =============================================================================

export function JackImage({
  src,
  alt,
  caption,
  credit,
}: {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}) {
  return (
    <figure className="my-8">
      <img src={src} alt={alt} className="w-full border border-gray-200 shadow-sm" />
      {(caption || credit) && (
        <figcaption className="text-center text-sm mt-2 text-gray-600">
          {caption && <span className="italic">{caption}</span>}
          {credit && (
            <span className="block text-xs text-gray-500 mt-1">Credit: {credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

// =============================================================================
// JACK VIDEO — Video embed (YouTube / Vimeo)
// =============================================================================

export function JackVideo({
  videoId,
  title,
  caption,
  provider = 'youtube',
}: {
  videoId: string;
  title: string;
  caption?: string;
  provider?: 'youtube' | 'vimeo';
}) {
  const embedUrls = {
    youtube: `https://www.youtube.com/embed/${videoId}`,
    vimeo: `https://player.vimeo.com/video/${videoId}`,
  };

  return (
    <div className="my-12">
      <div className="relative aspect-video w-full bg-black border border-gray-200 shadow-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={embedUrls[provider]}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
        />
      </div>
      {caption && (
        <p className="text-center text-sm mt-2 text-gray-600 italic border-b border-gray-300 pb-2">
          {caption}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// SCIENCE CALLOUT — alias for JackCallout styled for science/health articles
// Exported so bio-hacking article pages can import { ScienceCallout }
// =============================================================================

export type CalloutType = 'key-finding' | 'clinical-data' | 'warning' | 'source' | 'definition';

const calloutMeta: Record<CalloutType, { icon: string; label: string; accent: JackAccentColor }> = {
  'key-finding':   { icon: '🔬', label: 'Key Finding',   accent: 'green'  },
  'clinical-data': { icon: '📊', label: 'Clinical Data', accent: 'blue'   },
  'warning':       { icon: '⚠️', label: 'Important Note',accent: 'orange' },
  'source':        { icon: '📎', label: 'Source',        accent: 'gray'   },
  'definition':    { icon: '📖', label: 'Definition',    accent: 'purple' },
};

export function ScienceCallout({
  type = 'key-finding',
  children,
}: {
  type?: CalloutType;
  children: React.ReactNode;
}) {
  const meta = calloutMeta[type];
  return (
    <JackCallout label={`${meta.icon} ${meta.label}`} accentColor={meta.accent}>
      {children}
    </JackCallout>
  );
}

// =============================================================================
// FACT LIST — alias for JackCaseOverview styled for trial/company data tables
// Exported so bio-hacking article pages can import { FactList }
// =============================================================================

export function FactList({
  title,
  items,
}: {
  title?: string;
  items: { label: string; value: React.ReactNode }[];
}) {
  // JackCaseOverview takes { label, value: string } — we render ReactNode via wrapper
  return (
    <div className="my-6 rounded-none border border-gray-200 bg-white overflow-hidden shadow-sm not-prose">
      {title && (
        <div className="bg-gray-900 px-5 py-3">
          <p className="text-xs font-black uppercase tracking-widest text-white">{title}</p>
        </div>
      )}
      <dl className="divide-y divide-gray-100 text-sm">
        {items.map((row, i) => (
          <div key={i} className="flex gap-4 px-5 py-3">
            <dt className="w-44 shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wide leading-relaxed">
              {row.label}
            </dt>
            <dd className="text-gray-800 leading-relaxed">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// =============================================================================
// JACK ARTICLE — Main wrapper
// =============================================================================

export default function JackArticle({
  layout = 'report',
  categoryLabel,
  categories,
  publishDate,
  publishDateISO,
  modifiedDateISO,
  readTime,
  title,
  subtitle,
  subject,
  heroImage,
  breadcrumbs,
  author,
  children,
  relatedArticles,
  timeline,
  documents,
  showNewsletter = false,
  newsletterTitle = 'Investigation Updates',
  newsletterDescription = 'Get updates on this case and other OzoneNews investigations.',
  sources,
  showCorrections = true,
  showEditorialStandards = true,
  footerTagline = 'Decoupling Global Markets from Legacy Constraints.',
  footerLinks = [{ href: '/finance', label: 'Research Archive' }],
  accentColor = 'gray',
  slug,
  articleUrl,
  description,
  section,
  keywords,
  uuid,
  version,
}: JackArticleProps) {
  // Always show the sidebar in news layout — RelatedArticles renders at minimum
  const hasSidebar = layout === 'news';

  // Resolve the ISO date for <time> element
  const isoDate = publishDateISO || undefined;

  // The engagement key: prefer explicit slug, fall back to the URL path
  const engagementSlug = slug ?? articleUrl;

  return (
    <main className="min-h-screen bg-white">
      {/* Record view in reading history for logged-in users */}
      {engagementSlug && (
        <ArticleViewTracker
          slug={engagementSlug}
          title={title}
          url={articleUrl ?? engagementSlug}
          image={heroImage?.src}
          category={section ?? categoryLabel}
        />
      )}

      {/* Google News JSON-LD */}
      <JackSchema
        title={title}
        description={description}
        author={author}
        publishDateISO={publishDateISO}
        modifiedDateISO={modifiedDateISO}
        articleUrl={articleUrl}
        heroImage={heroImage}
        section={section}
        keywords={keywords}
      />

      {/* Hero Image — news layout */}
      {heroImage && layout === 'news' && (
        <div className="w-full">
          <div className="w-full max-h-[480px] overflow-hidden aspect-video">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
          {(heroImage.caption || heroImage.credit) && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 border-b border-gray-200">
              {heroImage.caption && (
                <p className="text-sm text-gray-600 italic">{heroImage.caption}</p>
              )}
              {heroImage.credit && (
                <p className="text-xs text-gray-500 mt-1">Credit: {heroImage.credit}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* REPORT LAYOUT — full-width, Greenland Fulcrum style             */}
      {/* ================================================================ */}
      {layout === 'report' && (
        <>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <Link href={crumb.href} className="hover:text-black transition-colors">
                      {crumb.label}
                    </Link>
                    {i < breadcrumbs.length - 1 && <span>/</span>}
                  </React.Fragment>
                ))}
              </nav>
            )}

            <article className="mt-12" itemScope itemType="https://schema.org/NewsArticle">
              {/* Header */}
              <header className="mb-20">
                <div className="flex items-center gap-3 mb-8 flex-wrap">
                  {categoryLabel && (
                    <span className="bg-gray-100 text-gray-900 text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] rounded-sm border border-gray-200">
                      {categoryLabel}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs font-mono tracking-tighter uppercase">
                    &bull;{' '}
                    <time dateTime={isoDate}>{publishDate}</time>
                  </span>
                  {readTime && (
                    <span className="text-gray-400 text-xs font-mono tracking-tighter uppercase">
                      &bull; {readTime}
                    </span>
                  )}
                </div>

                <h1
                  className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter uppercase"
                  itemProp="headline"
                >
                  {title}
                </h1>

                {/* Author byline */}
                {author && (
                  <div className="flex items-center gap-3 mb-6">
                    {author.slug ? (
                      <Link href={`/authors/${author.slug}`} className="shrink-0">
                        {author.avatar ? (
                          <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full" />
                        ) : author.initials ? (
                          <div className={`w-10 h-10 ${accentBgMap[accentColor]} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{author.initials}</span>
                          </div>
                        ) : null}
                      </Link>
                    ) : (
                      author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full shrink-0" />
                      ) : author.initials ? (
                        <div className={`w-10 h-10 ${accentBgMap[accentColor]} rounded-full flex items-center justify-center shrink-0`}>
                          <span className="text-white font-bold text-sm">{author.initials}</span>
                        </div>
                      ) : null
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm" itemProp="author">
                        {author.slug ? (
                          <Link href={`/authors/${author.slug}`} className="hover:underline">
                            {author.name}
                          </Link>
                        ) : (
                          author.name
                        )}
                      </p>
                      {author.department && (
                        <p className="text-xs text-gray-500">{author.department}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Hero Image — report layout (inside article) */}
                {heroImage && (
                  <figure className="mt-8 mb-12">
                    <img
                      src={heroImage.src}
                      alt={heroImage.alt}
                      className="w-full object-cover max-h-[50vh] border border-gray-200"
                      itemProp="image"
                    />
                    {(heroImage.caption || heroImage.credit) && (
                      <figcaption className="text-sm text-gray-500 mt-2">
                        {heroImage.caption && <span className="italic">{heroImage.caption}</span>}
                        {heroImage.credit && (
                          <span className="block text-xs mt-1">Credit: {heroImage.credit}</span>
                        )}
                      </figcaption>
                    )}
                  </figure>
                )}

                {subject && (
                  <div
                    className={`bg-gray-50 p-8 border-l-[12px] ${accentBorderMap[accentColor]} mt-12 text-sm text-gray-500 uppercase tracking-widest font-black`}
                  >
                    {subject}
                  </div>
                )}
              </header>

              {/* UUID Tracking Bar */}
              {uuid && (
                <div className="bg-gray-50 border border-gray-200 rounded px-4 py-2 text-[10px] font-mono text-gray-500 mb-8 inline-block">
                  UUID: {uuid}{version ? ` | v${version}` : ''}
                </div>
              )}

              {/* Body */}
              <div className="prose prose-xl prose-slate max-w-none font-serif text-gray-800" itemProp="articleBody">
                {children}
              </div>

              {/* Sources */}
              {sources && sources.length > 0 && (
                <div className="border-t-2 border-black pt-6 mt-16">
                  <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">
                    Sources &amp; References
                  </h3>
                  <ul className="text-sm space-y-3 text-gray-600">
                    {sources.map((src) => (
                      <li key={src.number}>
                        <span className="font-semibold">[{src.number}]</span>{' '}
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {src.title}
                        </a>
                        {src.description && <> &mdash; {src.description}</>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Engagement stack — Tags, ReactionBar, Comments, Newsletter */}
              <ArticleFooter
                slug={engagementSlug ?? ''}
                title={title}
                url={articleUrl}
                image={heroImage?.src}
                category={section ?? categoryLabel}
              />
            </article>
          </div>

          {/* Report Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 py-16 mt-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-4">
                OzoneNews Research &amp; Intelligence
              </p>
              <div className="text-2xl font-serif italic mb-8">{footerTagline}</div>
              <div className="flex justify-center gap-12 font-mono text-[10px] text-gray-500 underline underline-offset-4">
                {footerLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
              {(showCorrections || showEditorialStandards) && (
                <div className="flex justify-center gap-6 mt-6">
                  {showCorrections && (
                    <Link href="/corrections" className="text-xs text-gray-400 hover:underline">
                      Report a correction
                    </Link>
                  )}
                  {showEditorialStandards && (
                    <Link href="/editorial-standards" className="text-xs text-gray-400 hover:underline">
                      Editorial Standards
                    </Link>
                  )}
                </div>
              )}
            </div>
          </footer>
        </>
      )}

      {/* ================================================================ */}
      {/* NEWS LAYOUT — sidebar + content, CME style                      */}
      {/* ================================================================ */}
      {layout === 'news' && (
        <article itemScope itemType="https://schema.org/NewsArticle">
          {/* Header */}
          <header className="border-b-2 border-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 md:py-12">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 flex-wrap" aria-label="Breadcrumb">
                  {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                      <Link href={crumb.href} className="hover:text-black transition-colors">
                        {crumb.label}
                      </Link>
                      {i < breadcrumbs.length - 1 && <span>/</span>}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {/* Category Badges & Read Time */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {categories?.map((cat, i) => (
                  <span
                    key={i}
                    className={`${accentBadgeBgMap[cat.color || 'black']} text-xs font-bold px-2.5 py-0.5 border`}
                  >
                    {cat.label}
                  </span>
                ))}
                {categoryLabel && !categories?.length && (
                  <span className="bg-gray-100 text-gray-900 text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em] rounded-sm border border-gray-200">
                    {categoryLabel}
                  </span>
                )}
                {readTime && <span className="text-xs text-gray-500">{readTime}</span>}
              </div>

              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight mb-4 max-w-4xl"
                itemProp="headline"
              >
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mb-4 sm:mb-6">
                  {subtitle}
                </p>
              )}

              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-3 text-sm border-t border-gray-200 pt-4">
                {author && (
                  <div className="flex items-center gap-2">
                    {author.slug ? (
                      <Link href={`/authors/${author.slug}`} className="shrink-0">
                        {author.avatar ? (
                          <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className={`w-8 h-8 ${accentBgMap[accentColor]} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-xs">
                              {author.initials || author.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </Link>
                    ) : (
                      author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full shrink-0" />
                      ) : (
                        <div className={`w-8 h-8 ${accentBgMap[accentColor]} rounded-full flex items-center justify-center shrink-0`}>
                          <span className="text-white font-bold text-xs">
                            {author.initials || author.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                      )
                    )}
                    <div>
                      <p className="font-semibold text-sm" itemProp="author">
                        {author.slug ? (
                          <Link href={`/authors/${author.slug}`} className="hover:underline">
                            {author.name}
                          </Link>
                        ) : (
                          author.name
                        )}
                      </p>
                      {author.department && <p className="text-xs text-gray-500">{author.department}</p>}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <time dateTime={isoDate} itemProp="datePublished">
                    {publishDate}
                  </time>
                </div>
              </div>
            </div>
          </header>

          {/* UUID Tracking Bar */}
          {uuid && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded px-4 py-2 text-[10px] font-mono text-gray-500 inline-block">
                UUID: {uuid}{version ? ` | v${version}` : ''}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 md:py-12">
            <div className={hasSidebar ? 'grid lg:grid-cols-12 gap-8 lg:gap-12' : ''}>
              {/* Article Body */}
              <div className={hasSidebar ? 'lg:col-span-8' : 'max-w-4xl'}>
                <div className="prose prose-lg max-w-none" itemProp="articleBody">
                  {children}

                  {/* Sources */}
                  {sources && sources.length > 0 && (
                    <div className="border-t-2 border-black pt-6 mt-10 not-prose">
                      <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">
                        Sources &amp; References
                      </h3>
                      <ul className="text-sm space-y-3 text-gray-600">
                        {sources.map((src) => (
                          <li key={src.number}>
                            <span className="font-semibold">[{src.number}]</span>{' '}
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {src.title}
                            </a>
                            {src.description && <> &mdash; {src.description}</>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              {hasSidebar && (
                <aside className="lg:col-span-4">
                  {/* Auto Related Articles — queries articles table by category */}
                  <div className="mb-8">
                    <RelatedArticles
                      currentSlug={slug ?? ''}
                      category={section ?? categoryLabel ?? categories?.[0]?.label ?? 'News'}
                    />
                  </div>

                  {/* Manual Related Coverage */}
                  {relatedArticles && relatedArticles.length > 0 && (
                    <div className="border border-gray-200 mb-8">
                      <div className="bg-black text-white px-4 py-2">
                        <h3 className="font-bold text-sm">RELATED COVERAGE</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {relatedArticles.map((article, i) => (
                          <Link key={i} href={article.href} className="block group">
                            <span
                              className={`text-xs ${article.categoryColor || 'text-red-600'} font-bold`}
                            >
                              {article.category}
                            </span>
                            <h4 className="font-semibold text-sm group-hover:underline mt-1">
                              {article.title}
                            </h4>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {timeline && timeline.length > 0 && (
                    <div className="bg-gray-50 p-6 mb-8">
                      <h3 className="font-bold text-sm tracking-wider mb-4">TIMELINE</h3>
                      <div className="space-y-4 text-sm">
                        {timeline.map((event, i) => (
                          <div key={i} className="flex gap-3">
                            <div
                              className={`w-2 h-2 ${
                                event.highlight ? 'bg-red-600' : 'bg-gray-400'
                              } rounded-full mt-2 shrink-0`}
                            />
                            <div>
                              <p className="font-bold">{event.date}</p>
                              <p className="text-gray-500">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Documents */}
                  {documents && documents.length > 0 && (
                    <div className="border border-gray-200 p-6 mb-8">
                      <h3 className="font-bold text-sm tracking-wider mb-4">KEY DOCUMENTS</h3>
                      <ul className="space-y-3 text-sm">
                        {documents.map((doc, i) => (
                          <li key={i}>
                            <a
                              href={doc.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-2"
                            >
                              <span>{doc.icon || '\uD83D\uDCC4'}</span>
                              <span>{doc.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Newsletter Signup */}
                  {showNewsletter && (
                    <div className="bg-white border border-gray-200 p-6">
                      <h3 className="font-bold mb-2 text-gray-900">{newsletterTitle}</h3>
                      <p className="text-sm text-gray-600 mb-4">{newsletterDescription}</p>
                      <input
                        type="email"
                        placeholder="Enter email"
                        className="w-full px-3 py-2 text-gray-900 text-sm mb-2 border border-gray-300 rounded"
                        aria-label="Email address"
                      />
                      <button className="w-full bg-gray-900 text-white py-2 text-sm font-bold hover:bg-black transition-colors">
                        SUBSCRIBE
                      </button>
                    </div>
                  )}
                </aside>
              )}
            </div>
          </div>

          {/* Engagement stack — Tags, ReactionBar, Comments, Newsletter */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
            <ArticleFooter
              slug={engagementSlug ?? ''}
              title={title}
              url={articleUrl}
              image={heroImage?.src}
              category={section ?? categoryLabel}
            />
          </div>

          {/* News Footer */}
          <footer className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">
                    <strong>Published:</strong>{' '}
                    <time dateTime={isoDate}>{publishDate}</time>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {showCorrections && (
                    <Link href="/corrections" className="text-sm text-gray-500 hover:underline">
                      Report a correction
                    </Link>
                  )}
                  {showEditorialStandards && (
                    <Link href="/editorial-standards" className="text-sm text-gray-500 hover:underline">
                      Editorial Standards
                    </Link>
                  )}
                </div>
              </div>
              {footerTagline && (
                <div className="text-center border-t border-gray-200 pt-6">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
                    OzoneNews Research &amp; Intelligence
                  </p>
                  <div className="text-lg font-serif italic text-gray-600">{footerTagline}</div>
                  <div className="flex justify-center gap-12 font-mono text-[10px] text-gray-500 underline underline-offset-4 mt-4">
                    {footerLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </footer>
        </article>
      )}
    </main>
  );
}
