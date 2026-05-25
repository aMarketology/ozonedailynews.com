import Link from "next/link";
import React from "react";
import ArticleViewTracker from '@/components/articles/ArticleViewTracker';
import RelatedArticles from '@/components/discovery/RelatedArticles';
import ArticleFooter from '@/components/articles/ArticleFooter';
import { HubBacklink } from '@/components/HubBacklink';
import ArticleTOC from '@/components/articles/ArticleTOC';
import BookFlipReader from '@/components/articles/BookFlipReader';
import { Breadcrumb } from '@/components/nav/Breadcrumb';
import type { BreadcrumbItem } from '@/components/nav/Breadcrumb';
import FAQAccordion, { FAQSchema } from '@/components/FAQAccordion';
import type { FAQItem } from '@/components/FAQAccordion';
import { MoreFromHub, type MoreFromHubItem } from '@/components/discovery/MoreFromHub';

// =============================================================================
// NEWS ARTICLE COMPONENT - Flashy, engaging article layout
// For: News stories, influencer coverage, entertainment, trending topics
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface AuthorInfo {
  name: string;
  role?: string;
  avatar?: string;
  twitter?: string;
  authorSlug?: string; // For linking to author page (e.g., "conan-boyle")
  bio?: string; // Optional short bio for author card
}

export type TopicTagType = 
  | "technology" | "news" | "finance" | "sports" | "entertainment" 
  | "lifestyle" | "investigations" | "world" | "politics" | "science"
  | "gaming" | "crypto" | "ai" | "automotive" | "education" | "culture";

export interface NewsArticleProps {
  title: string;
  subtitle?: string;
  category: string;
  categoryColor?: "red" | "blue" | "green" | "purple" | "orange" | "pink" | "yellow";
  topicTag?: TopicTagType;
  publishDate: string;
  readTime?: string;
  author?: AuthorInfo;
  heroImage?: {
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
  };
  thumbnail?: {
    src: string;
    alt: string;
    /** Aspect ratio for the thumbnail container, e.g. "16:9", "9:16", "4:3", "1:1". Defaults to natural image height. */
    aspectRatio?: string;
  };
  tags?: string[];
  children: React.ReactNode;
  trending?: boolean;
  breaking?: boolean;
  exclusive?: boolean;
  /** Article slug (e.g. "my-article") — used to record view history for logged-in users. */
  slug?: string;
  /** Canonical URL path (e.g. "/news/my-article") — used to record view history. */
  url?: string;
  /** Breadcrumb trail rendered above the article header + JSON-LD BreadcrumbList schema. */
  breadcrumbs?: BreadcrumbItem[];
  /** FAQ items rendered at the bottom of the article body + FAQPage JSON-LD schema. */
  faqItems?: FAQItem[];
  /** Server-rendered "More from this Hub" related articles strip — important for SEO crawlability. */
  moreFromHub?: MoreFromHubItem[];
  /** Optional hub label + href for the MoreFromHub heading. */
  moreFromHubLabel?: string;
  moreFromHubHref?: string;
}

// =============================================================================
// TOPIC TAG — Prominent colored badge for article categorization
// =============================================================================

const topicTagStyles: Record<TopicTagType, { bg: string; text: string; icon: string }> = {
  technology:      { bg: 'bg-blue-100',    text: 'text-blue-800',    icon: '💻' },
  news:            { bg: 'bg-red-100',     text: 'text-red-800',     icon: '📰' },
  finance:         { bg: 'bg-green-100',   text: 'text-green-800',   icon: '💰' },
  sports:          { bg: 'bg-indigo-100',  text: 'text-indigo-800',  icon: '🏆' },
  entertainment:   { bg: 'bg-purple-100',  text: 'text-purple-800',  icon: '🎬' },
  lifestyle:       { bg: 'bg-pink-100',    text: 'text-pink-800',    icon: '👕' },
  investigations:  { bg: 'bg-orange-100',  text: 'text-orange-800',  icon: '🔍' },
  world:           { bg: 'bg-sky-100',     text: 'text-sky-800',     icon: '🌍' },
  politics:        { bg: 'bg-rose-100',    text: 'text-rose-800',    icon: '🏛️' },
  science:         { bg: 'bg-teal-100',    text: 'text-teal-800',    icon: '🔬' },
  gaming:          { bg: 'bg-violet-100',  text: 'text-violet-800',  icon: '🎮' },
  crypto:          { bg: 'bg-amber-100',   text: 'text-amber-800',   icon: '₿' },
  ai:              { bg: 'bg-cyan-100',    text: 'text-cyan-800',    icon: '🤖' },
  automotive:      { bg: 'bg-slate-100',   text: 'text-slate-800',   icon: '🚗' },
  education:       { bg: 'bg-lime-100',    text: 'text-lime-800',    icon: '🎓' },
  culture:         { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', icon: '🎨' },
};

/**
 * TopicTag — Reusable colored badge that identifies article topic.
 * Use this on every article, card, and listing for consistent categorization.
 */
export function TopicTag({ topic, size = 'sm', showIcon = true }: { topic: TopicTagType; size?: 'xs' | 'sm' | 'md'; showIcon?: boolean }) {
  const style = topicTagStyles[topic] || topicTagStyles.news;
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wide uppercase ${style.bg} ${style.text} ${sizeClasses[size]}`}>
      {showIcon && <span>{style.icon}</span>}
      {topic}
    </span>
  );
}

/**
 * Infer a TopicTagType from an article's category string or slug.
 * Useful for auto-tagging content discovered by the scanner.
 */
export function inferTopicTag(category: string, slug?: string): TopicTagType {
  const cat = category.toLowerCase();
  const s = (slug || '').toLowerCase();
  
  if (cat.includes('tech') || s.startsWith('/google') || s.startsWith('/apple') || s.startsWith('/nvidia') || s.startsWith('/intel') || s.startsWith('/microsoft') || s.startsWith('/saas') || s.startsWith('/github')) return 'technology';
  if (cat.includes('investigation') || cat.includes('fraud')) return 'investigations';
  if (cat.includes('finance') || cat.includes('business') || s.startsWith('/finance') || s.startsWith('/bank')) return 'finance';
  if (cat.includes('sport') || s.startsWith('/winter-olympics') || s.startsWith('/world-cup')) return 'sports';
  if (cat.includes('entertainment') || s.startsWith('/disney') || s.startsWith('/entertainment')) return 'entertainment';
  if (cat.includes('gaming') || s.startsWith('/video-games')) return 'gaming';
  if (cat.includes('crypto') || s.startsWith('/crypto')) return 'crypto';
  if (cat.includes('politic') || cat.includes('government')) return 'politics';
  if (s.startsWith('/nasa') || s.startsWith('/technology/articles/dawn-of-orbital')) return 'science';
  if (s.startsWith('/clothing') || s.startsWith('/artists')) return 'lifestyle';
  if (s.startsWith('/youtube') || s.startsWith('/influencer') || s.startsWith('/podcasts') || s.startsWith('/beastgames')) return 'entertainment';
  if (s.startsWith('/cars')) return 'automotive';
  if (s.startsWith('/college')) return 'education';
  if (s.startsWith('/open-ai') || s.startsWith('/define') || cat.includes('ai') || cat.includes('software')) return 'ai';
  if (s.startsWith('/elon-musk')) return 'finance';
  if (cat.includes('world') || s.startsWith('/news/world') || s.startsWith('/news/canada')) return 'world';
  if (s.startsWith('/social')) return 'technology';
  if (s.startsWith('/events')) return 'news';
  return 'news';
}

// =============================================================================
// CATEGORY COLORS
// =============================================================================

const categoryColors = {
  red: "from-red-500 to-red-600",
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  pink: "from-pink-500 to-pink-600",
  yellow: "from-yellow-500 to-yellow-600",
};

const categoryBadgeColors = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  yellow: "bg-yellow-500",
};

// =============================================================================
// NEWS HEADER WITH HERO
// =============================================================================

export function NewsHeader({
  title,
  subtitle,
  category,
  categoryColor = "red",
  publishDate,
  readTime,
  author,
  heroImage,
  thumbnail,
  trending,
  breaking,
  exclusive,
}: Omit<NewsArticleProps, "children" | "tags">) {
  return (
    <header className="relative">
      {/* Hero Image — full width, image above, text below */}
      {heroImage && (
        <div>
          {/* Image block — full bleed, no overlay */}
          <div className="w-full aspect-video sm:h-[55vh] sm:aspect-auto overflow-hidden">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="w-full h-full object-cover"
            />
          </div>
          {heroImage.caption || heroImage.credit ? (
            <p className="text-xs text-gray-500 px-4 sm:px-0 container mx-auto max-w-4xl pt-1.5 pb-0">
              {heroImage.caption}{heroImage.caption && heroImage.credit ? ' — ' : ''}{heroImage.credit ? `Photo: ${heroImage.credit}` : ''}
            </p>
          ) : null}

          {/* Header text — below image, on white background */}
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-6 pb-4">
            {/* Italic serif kicker (category) + status badges */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-serif italic text-sm text-gray-600">
                {category}
              </span>
              {breaking && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-red-600 text-white">
                  Breaking
                </span>
              )}
              {exclusive && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-yellow-500 text-black">
                  Exclusive
                </span>
              )}
              {trending && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-gray-900 text-white">
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif font-bold tracking-tight leading-[1.05] text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-3">
              {title}
            </h1>

            {/* 60px black rule */}
            <div className="w-16 h-1 bg-black mb-4" />

            {/* Subtitle / dek */}
            {subtitle && (
              <p className="font-serif italic text-lg md:text-2xl text-gray-700 leading-relaxed mb-5 max-w-3xl">
                {subtitle}
              </p>
            )}

            {/* Meta Info — hairline rules, uppercase tracked, no emojis */}
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] font-semibold text-gray-700 border-t border-b border-gray-300 py-3">
              {author && (
                <div className="flex items-center gap-2 normal-case tracking-normal">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-7 h-7 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  {author.authorSlug ? (
                    <Link href={`/authors/${author.authorSlug}`} rel="author" className="font-medium text-gray-900 hover:underline transition-colors">
                      {author.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900">{author.name}</span>
                  )}
                </div>
              )}
              {author && <span className="text-gray-300">|</span>}
              <time dateTime={publishDate} className="tabular-nums">{publishDate}</time>
              {readTime && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="tabular-nums">{readTime}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Hero Image - Gradient Header */}
      {!heroImage && (
        <div
          className={`bg-gradient-to-r ${categoryColors[categoryColor]} py-16 md:py-24`}
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)' }}
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex items-center gap-8">

              {/* Left column — all text content (fills remaining space) */}
              <div className="flex-1 min-w-0">
                {/* Italic serif kicker (category) + status badges */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-serif italic text-sm text-white/85">
                    {category}
                  </span>
                  {breaking && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-red-600 text-white">
                      Breaking
                    </span>
                  )}
                  {exclusive && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-yellow-400 text-black">
                      Exclusive
                    </span>
                  )}
                  {trending && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-white/25 text-white backdrop-blur">
                      Trending
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif font-bold tracking-tight leading-[1.05] text-4xl md:text-5xl lg:text-6xl text-white mb-4">
                  {title}
                </h1>

                {/* 60px white rule */}
                <div className="w-16 h-1 bg-white/80 mb-5" />

                {/* Subtitle / dek */}
                {subtitle && (
                  <p className="font-serif italic text-xl md:text-2xl text-white/90 leading-relaxed mb-6 max-w-3xl">
                    {subtitle}
                  </p>
                )}

                {/* Meta Info — hairline rules, uppercase tracked, no emojis */}
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] font-semibold text-white/85 border-t border-b border-white/30 py-3">
                  {author && (
                    <div className="flex items-center gap-2 normal-case tracking-normal">
                      {author.avatar ? (
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-sm">
                          {author.name.charAt(0)}
                        </div>
                      )}
                      {author.authorSlug ? (
                        <Link href={`/authors/${author.authorSlug}`} rel="author" className="font-medium text-white hover:underline hover:text-white/80 transition-colors">
                          {author.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-white">{author.name}</span>
                      )}
                    </div>
                  )}
                  {author && <span className="text-white/40">|</span>}
                  <time dateTime={publishDate} className="tabular-nums">{publishDate}</time>
                  {readTime && (
                    <>
                      <span className="text-white/40">|</span>
                      <span className="tabular-nums">{readTime}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right column — thumbnail with genie float + flare animation */}
              {thumbnail && (() => {
                const aspectRatioCss = thumbnail.aspectRatio ? thumbnail.aspectRatio.replace(':', '/') : undefined;
                return (
                <div className="hidden md:flex shrink-0 self-stretch -my-16 md:-my-24 -mr-6" style={{ width: '30%' }}>
                  <style>{`
                    @keyframes genieFloat {
                      0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
                      33%     { transform: translateY(-7px) rotate(0.6deg) scale(1.01); }
                      66%     { transform: translateY(-3px) rotate(-0.4deg) scale(1.005); }
                    }
                    @keyframes genieGlow {
                      0%,100% { box-shadow: 0 0 18px 4px rgba(251,191,36,0.25), 0 0 40px 8px rgba(251,191,36,0.08); }
                      50%     { box-shadow: 0 0 36px 12px rgba(251,191,36,0.55), 0 0 80px 24px rgba(251,191,36,0.18); }
                    }
                    @keyframes genieFlare {
                      0%,100% { opacity: 0;   transform: translateX(-20%) rotate(-10deg) scale(0.7); }
                      40%,60% { opacity: 0.7; transform: translateX(60%)  rotate(8deg)  scale(1.1); }
                    }
                    @keyframes genieFlare2 {
                      0%,100% { opacity: 0;   transform: translateY(80%)  scale(0.8); }
                      50%     { opacity: 0.4; transform: translateY(-10%) scale(1.15); }
                    }
                    .genie-img   { animation: genieFloat 3.8s ease-in-out infinite; will-change: transform; }
                    .genie-wrap  { animation: genieGlow  2.8s ease-in-out infinite; }
                    .genie-flare1{ animation: genieFlare  3.2s ease-in-out infinite; }
                    .genie-flare2{ animation: genieFlare2 4.1s ease-in-out infinite 0.9s; }
                  `}</style>
                  {/* wrapper fills the full height of the gradient header via flex-stretch */}
                  <div
                    className="relative w-full rounded-l-xl overflow-hidden genie-wrap"
                    style={aspectRatioCss ? { aspectRatio: aspectRatioCss } : { height: '100%' }}
                  >
                    <img
                      src={thumbnail.src}
                      alt={thumbnail.alt}
                      className="genie-img"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Sweep flare 1 — diagonal golden streak */}
                    <span
                      className="absolute inset-0 pointer-events-none genie-flare1"
                      style={{
                        background: 'linear-gradient(120deg, transparent 25%, rgba(255,220,80,0.55) 45%, rgba(255,255,200,0.9) 50%, rgba(255,220,80,0.55) 55%, transparent 75%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                    {/* Radial glow flare 2 — bottom-up bloom */}
                    <span
                      className="absolute inset-0 pointer-events-none genie-flare2"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 90%, rgba(255,200,50,0.6) 0%, rgba(255,150,0,0.25) 40%, transparent 70%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                  </div>
                </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// =============================================================================
// HIGHLIGHT BOX (Pull Quote / Key Point)
// =============================================================================

export function HighlightBox({
  children,
  type = "quote",
  color = "purple",
}: {
  children: React.ReactNode;
  type?: "quote" | "key-point" | "stat";
  color?: "purple" | "blue" | "pink" | "orange" | "green";
}) {
  const bgColors = {
    purple: "from-purple-500/10 to-pink-500/10 border-purple-300",
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-300",
    pink: "from-pink-500/10 to-rose-500/10 border-pink-300",
    orange: "from-orange-500/10 to-yellow-500/10 border-orange-300",
    green: "from-green-500/10 to-emerald-500/10 border-green-300",
  };

  const icons = {
    quote: "💬",
    "key-point": "⚡",
    stat: "📊",
  };

  return (
    <div
      className={`my-8 p-6 rounded-2xl bg-gradient-to-br ${bgColors[color]} border-l-4`}
    >
      <span className="text-2xl mb-2 block">{icons[type]}</span>
      <div className="text-lg font-medium text-gray-800 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// EMBED BOX (Social Media / Video Placeholder)
// =============================================================================

export function EmbedBox({
  platform,
  handle,
  description,
  link,
}: {
  platform: "twitter" | "instagram" | "youtube" | "tiktok";
  handle: string;
  description?: string;
  link?: string;
}) {
  const platformStyles = {
    twitter: { icon: "𝕏", bg: "bg-black", name: "X (Twitter)" },
    instagram: {
      icon: "📸",
      bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
      name: "Instagram",
    },
    youtube: { icon: "▶️", bg: "bg-red-600", name: "YouTube" },
    tiktok: { icon: "🎵", bg: "bg-black", name: "TikTok" },
  };

  const style = platformStyles[platform];

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <div className={`${style.bg} text-white px-4 py-3 flex items-center gap-3`}>
        <span className="text-xl">{style.icon}</span>
        <span className="font-bold">{style.name}</span>
        <span className="text-white/70">@{handle}</span>
      </div>
      {description && (
        <div className="p-4 bg-gray-50">
          <p className="text-gray-700">{description}</p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-blue-600 hover:underline font-medium text-sm"
            >
              View on {style.name} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// IMAGE GALLERY
// =============================================================================

export function ImageGallery({
  images,
}: {
  images: Array<{ src: string; alt: string; caption?: string }>;
}) {
  return (
    <div className="my-8 grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map((img, index) => (
        <figure key={index} className="relative group overflow-hidden rounded-lg">
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {img.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// =============================================================================
// TIMELINE (For Story Progression)
// =============================================================================

export function Timeline({
  events,
}: {
  events: Array<{ time: string; title: string; description?: string }>;
}) {
  const safeEvents = Array.isArray(events) ? events : [];
  return (
    <div className="my-8 relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
      <div className="space-y-6">
        {safeEvents.map((event, index) => (
          <div key={index} className="relative pl-12">
            <div className="absolute left-2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-white shadow" />
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                {event.time}
              </span>
              <h4 className="font-bold text-gray-900 mt-1">{event.title}</h4>
              {event.description && (
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ReactionBar is now a standalone 'use client' component in components/ReactionBar.tsx
// It is re-exported here for backwards-compatible named imports.
export { default as ReactionBar } from '@/components/engagement/ReactionBar';

// =============================================================================
// TAGS SECTION
// =============================================================================

export function TagsSection({ tags }: { tags: string[] }) {
  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link
            key={index}
            href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// RELATED STORIES (Card Style)
// =============================================================================

export function RelatedStories({
  stories,
}: {
  stories: Array<{
    href: string;
    title: string;
    category: string;
    image?: string;
    date?: string;
  }>;
}) {
  return (
    <section className="mt-16 pt-8 border-t-2 border-gray-200">
      <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <span>📰</span> Related Stories
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((story, index) => (
          <Link
            key={index}
            href={story.href}
            className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
          >
            {story.image && (
              <div className="h-40 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                {story.category}
              </span>
              <h3 className="font-bold text-gray-900 mt-1 group-hover:text-purple-600 transition-colors line-clamp-2">
                {story.title}
              </h3>
              {story.date && (
                <span className="text-xs text-gray-500 mt-2 block">{story.date}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// MAIN NEWS ARTICLE LAYOUT
// =============================================================================

export function NewsArticle({
  title,
  subtitle,
  category,
  categoryColor = "red",
  topicTag,
  publishDate,
  readTime,
  author,
  heroImage,
  thumbnail,
  tags,
  children,
  trending,
  breaking,
  exclusive,
  slug,
  url,
  breadcrumbs,
  faqItems,
  moreFromHub,
  moreFromHubLabel,
  moreFromHubHref,
}: NewsArticleProps) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Record view in reading history (localStorage for everyone, server for signed-in users) */}
      {slug && url && (
        <ArticleViewTracker
          slug={slug}
          title={title}
          url={url}
          image={heroImage?.src}
          category={category}
          tags={tags}
        />
      )}
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Header */}
      <NewsHeader
        title={title}
        subtitle={subtitle}
        category={category}
        categoryColor={categoryColor}
        publishDate={publishDate}
        readTime={readTime}
        author={author}
        heroImage={heroImage}
        thumbnail={thumbnail}
        trending={trending}
        breaking={breaking}
        exclusive={exclusive}
      />

      {/* Article Content — CSS Grid 3-column: [TOC] [body] [related].
          Grid (not flex) is used because every grid cell spans the full grid
          row height automatically, giving both sticky sidebars guaranteed room
          to scroll without any self-start / flex-stretch gymnastics.

          On mobile the grid collapses to a single column via Tailwind responsive
          grid-cols overrides below. */}
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-8 lg:gap-10">

          {/* Left rail — sticky TOC (lg+ only, hidden on mobile).
              No overflow, no self-start — the grid cell spans the full row
              height automatically so sticky:top-6 has room to scroll. */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <ArticleTOC />
            </div>
          </aside>

          {/* Main body — center column. No self-start needed in grid. */}
          <article className="w-full min-w-0">
            <div data-article-body="true" className="max-w-none font-serif text-gray-900 dark:text-gray-100
              [&_p]:!font-serif [&_p]:!text-[18px] [&_p]:!leading-[1.75] [&_p]:!text-gray-800 [&_p]:!mb-6 lg:[&_p]:!text-justify lg:[&_p]:!hyphens-auto dark:[&_p]:!text-gray-200
              [&>div>p:first-of-type]:!text-[20px] [&>div>p:first-of-type]:!font-medium
              [&>div>p:first-of-type]:first-letter:float-left [&>div>p:first-of-type]:first-letter:text-[5.5rem] [&>div>p:first-of-type]:first-letter:font-bold [&>div>p:first-of-type]:first-letter:mr-3 [&>div>p:first-of-type]:first-letter:mt-2 [&>div>p:first-of-type]:first-letter:leading-[0.85] [&>div>p:first-of-type]:first-letter:font-serif
              [&_h1,&_h2,&_h3,&_h4]:!font-serif [&_h1,&_h2,&_h3,&_h4]:!font-bold [&_h1,&_h2,&_h3,&_h4]:!tracking-tight [&_h1,&_h2,&_h3,&_h4]:!text-gray-900 dark:[&_h1,&_h2,&_h3,&_h4]:!text-gray-100
              [&_h2]:!text-[1.875rem] [&_h2]:!leading-[1.2] [&_h2]:!mt-12 [&_h2]:!mb-4 [&_h2]:!border-0 [&_h2]:!pl-0 [&_h2]:!pt-0
              [&_h3]:!text-[1.375rem] [&_h3]:!mt-8 [&_h3]:!mb-3
              [&_a]:!text-gray-900 [&_a]:!underline [&_a]:!underline-offset-[3px] [&_a]:!decoration-1 [&_a]:!font-medium hover:[&_a]:!decoration-2 dark:[&_a]:!text-gray-100
              [&_blockquote]:!not-italic [&_blockquote]:!border-l-0 [&_blockquote]:!border-y [&_blockquote]:!border-gray-400 [&_blockquote]:!bg-transparent [&_blockquote]:!rounded-none [&_blockquote]:!py-6 [&_blockquote]:!px-0 [&_blockquote]:!my-10 [&_blockquote]:!text-2xl [&_blockquote]:!font-serif [&_blockquote]:!italic [&_blockquote]:!text-center [&_blockquote]:!text-gray-800 [&_blockquote]:!leading-snug dark:[&_blockquote]:!text-gray-200 dark:[&_blockquote]:!border-gray-600
              [&_strong]:!text-gray-900 [&_strong]:!font-semibold dark:[&_strong]:!text-gray-100
              [&_img]:!rounded-xl [&_img]:!shadow-lg [&_img]:!my-8
              [&_ul]:!font-serif [&_ul]:!text-[18px] [&_ul]:!leading-[1.75] [&_li]:!text-gray-800 dark:[&_li]:!text-gray-200 [&_li]:!my-2
              [&_hr]:!border-gray-300 [&_hr]:!my-12
            ">
              {children}
            </div>

            {/* Book-flip reader — page-turn animation + JS proximity scroll-snap per H2. */}
            <BookFlipReader />

            {/* FAQ Section — inside article column so sticky rails extend past it. */}
            {faqItems && faqItems.length > 0 && (
              <div className="mt-12 max-w-3xl">
                <FAQSchema items={faqItems} />
                <FAQAccordion items={faqItems} heading="Frequently Asked Questions" color="blue" />
              </div>
            )}

            {/* Server-rendered MoreFromHub — inside article column so sticky rails stay locked. */}
            {moreFromHub && moreFromHub.length > 0 && (
              <MoreFromHub
                items={moreFromHub}
                hubLabel={moreFromHubLabel ?? category}
                hubHref={moreFromHubHref}
              />
            )}
          </article>

          {/* Right rail — sticky Related Articles + Hub backlink. */}
          <aside>
            <div className="sticky top-6">
              <HubBacklink category={category} topicTag={topicTag} />
              <RelatedArticles
                currentSlug={slug ?? ''}
                category={category}
                tags={tags}
              />
            </div>
          </aside>

        </div>

        {/* Engagement stack — renders in a full-width row BELOW the grid.
            Both sticky rails naturally release here, right before comments. */}
        <div className="mt-12">
          <ArticleFooter
            slug={slug ?? ''}
            title={title}
            url={url}
            image={heroImage?.src}
            category={category}
            tags={tags}
            author={author}
          />
        </div>
      </div>

    </main>
  );
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export default NewsArticle;
