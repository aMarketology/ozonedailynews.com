// ─── Core Types for Ozone Daily News ────────────────────────────────────────
// All article types mirror their static JSON stores in content/static/

export type Lifecycle = 'news' | 'review' | 'feature' | 'pruned';

export type Category =
  | 'News'
  | 'Tech'
  | 'Finance'
  | 'Entertainment'
  | 'World'
  | 'Politics'
  | 'Science'
  | 'Sports'
  | 'Culture'
  | 'Crypto'
  | 'Gaming';

export type TopicTagType =
  | 'gaming'
  | 'entertainment'
  | 'ai'
  | 'tech'
  | 'finance'
  | 'politics'
  | 'science'
  | 'sports'
  | 'world'
  | 'crypto'
  | 'culture'
  | 'health'
  | 'business';

// ─── NewsArticleDB ────────────────────────────────────────────────────────────
export interface ArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  category: Category;
  status: 'published' | 'draft';
  breaking?: boolean;
  trending?: boolean;
  exclusive?: boolean;
  topic_tag?: TopicTagType;
  content_html: string;
  publish_date: string;           // Display: "March 12, 2026"
  published_at: string;           // ISO-8601: "2026-03-12T00:00:00Z"
  author_name: string;
  author_slug: string;
  read_time?: string;
  thumbnail_src?: string;
  thumbnail_alt?: string;
  tags: string[];
  lifecycle?: Lifecycle;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    alternates?: { canonical: string };
    openGraph?: Record<string, unknown>;
  };
}

// ─── JackArticleDB ────────────────────────────────────────────────────────────
export interface TimelineItem {
  date: string;
  event: string;
}

export interface Source {
  title: string;
  url: string;
  publisher?: string;
}

export interface RelatedArticle {
  title: string;
  url: string;
  category: string;
  categoryColor?: string;
}

export interface JackArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  department?: string;
  category: Category;
  accentColor?: string;
  layout?: 'news' | 'report' | 'investigation';
  status: 'published' | 'draft';
  content_html: string;
  publish_date: string;
  published_at: string;
  author_name: string;
  author_slug: string;
  read_time?: string;
  thumbnail_src?: string;
  thumbnail_alt?: string;
  tags: string[];
  timeline?: TimelineItem[];
  sources: Source[];
  relatedArticles?: RelatedArticle[];
  breadcrumbs?: Array<{ label: string; href: string }>;
  lifecycle?: Lifecycle;
}

// ─── ArticlePageDB ────────────────────────────────────────────────────────────
export interface ArticlePageFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  category: Category;
  status: 'published' | 'draft';
  content_html: string;
  publish_date: string;
  published_at: string;
  author_name: string;
  author_slug: string;
  read_time?: string;
  thumbnail_src?: string;
  thumbnail_alt?: string;
  tags: string[];
  lifecycle?: Lifecycle;
}

// ─── CreatorArticleDB ─────────────────────────────────────────────────────────
export interface CreatorStat {
  label: string;
  value: string;
}

export interface CreatorInfoboxRow {
  label: string;
  value: string;
  href?: string;
}

export interface CreatorArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  status: 'published' | 'draft';
  content_html: string;
  publish_date: string;
  published_at: string;
  author_name: string;
  author_slug: string;
  read_time?: string;
  thumbnail_src?: string;
  thumbnail_alt?: string;
  tags: string[];
  // Creator-specific
  creator_name?: string;
  platform_primary?: string;
  follower_count_primary?: string;
  infobox?: CreatorInfoboxRow[];
  stats?: CreatorStat[];
  cta_buttons?: Array<{ label: string; href: string; icon?: string }>;
}

// ─── WikiArticleDB ────────────────────────────────────────────────────────────
export interface WikiArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  category: Category;
  status: 'published' | 'draft';
  content_html: string;
  publish_date: string;
  published_at: string;
  author_name: string;
  author_slug: string;
  read_time?: string;
  thumbnail_src?: string;
  thumbnail_alt?: string;
  tags: string[];
  lifecycle?: Lifecycle;
}

// ─── Content Registry ─────────────────────────────────────────────────────────
export interface ContentEntry {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  modifiedDate: string;
  category: string;
  tags: string[];
  author: string;
  authorSlug?: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  articleType?: 'NewsArticle' | 'JackArticle' | 'ArticlePage' | 'CreatorArticle' | 'WikiArticle';
  lifecycle?: Lifecycle;
  breaking?: boolean;
}
