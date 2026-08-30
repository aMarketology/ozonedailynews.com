// ─── Core Types for Ozone Daily News ────────────────────────────────────────
// All article types mirror their static JSON stores in content/static/

export type Lifecycle = 'news' | 'review' | 'feature' | 'pruned' | 'evergreen';

// ─── Citation (ScholarlyArticle-compatible source object) ─────────────────────
// Every published article should carry at least one citation for EEAT signals.
// These feed both the SourcesInterlink component and the JSON-LD citation array.
export interface Citation {
  title: string;
  url: string;
  publisher: string;
  datePublished?: string; // ISO-8601, e.g. "2026-08-12"
}

// ─── Corrections / Updates ledger ──────────────────────────────────────────────
// Transparency by design: every post-publish change is logged with WHY and WHEN.
export type CorrectionType = 'correction' | 'update' | 'clarification';

export interface CorrectionEntry {
  type: CorrectionType;
  /** Human-readable note, e.g. "Added statement from Intel spokesperson." */
  note: string;
  /** ISO-8601 timestamp with timezone. */
  timestamp: string;
  /** Email or name of the editor who made the change. */
  editor: string;
}

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
  status: 'published' | 'draft' | 'review';
  brand_slug?: string;
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
  modified_date_iso?: string;     // ISO-8601 of last correction/update
  corrections?: CorrectionEntry[]; // transparency ledger, newest last
  citations?: Citation[];
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    alternates?: { canonical: string };
    openGraph?: Record<string, unknown>;
  };
}

// ─── SterlingArticleDB ──────────────────────────────────────────────────────
export interface TimelineItem {
  date: string;
  event?: string;
  description?: string;
  highlight?: boolean;
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

export interface SterlingArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  department?: string;
  category: Category;
  accentColor?: string;
  layout?: 'news' | 'report' | 'investigation';
  status: 'published' | 'draft' | 'review';
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
  citations?: Citation[];
}

// ─── ArticlePageDB ────────────────────────────────────────────────────────────
export interface ArticlePageFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  category: Category;
  status: 'published' | 'draft' | 'review';
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
  citations?: Citation[]; // NEW: array of citations for the article
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
  status: 'published' | 'draft' | 'review';
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
  citations?: Citation[]; // NEW: array of citations for the article
}

// ─── WikiArticleDB ────────────────────────────────────────────────────────────
export interface WikiArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  category: Category;
  status: 'published' | 'draft' | 'review';
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
  citations?: Citation[]; // NEW: array of citations for the article
}

// ─── JackArticleFull (long-form / investigation) ────────────────────────────
export interface JackArticleFull {
  id?: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  department?: string;
  category: Category;
  accentColor?: string;
  status: 'published' | 'draft' | 'review';
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
  sources?: Array<{ url: string; title: string; publisher?: string }>;
  timeline?: Array<{ date: string; event?: string; description?: string; highlight?: boolean }>;
  relatedArticles?: Array<{ url: string; title: string; category?: string }>;
  breadcrumbs?: Array<{ href: string; label: string }>;
  citations?: Citation[]; // NEW: array of citations for the article
}

// ─── Content Registry ─────────────────────────────────────────────────────────
export interface ContentEntry {
  slug: string;
  filePath?: string;  // NEW: relative path from content/static/ for sharded access (e.g., "articles/2026/06/slug.json")
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
  articleType?: 'NewsArticle' | 'JackArticle' | 'SterlingArticle' | 'ArticlePage' | 'CreatorArticle' | 'WikiArticle';
  lifecycle?: Lifecycle;
  breaking?: boolean;
  citations?: Citation[]; // NEW: array of citations for the article
}
