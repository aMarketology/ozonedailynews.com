// lib/article-schema.ts
// ── THE SINGLE SOURCE OF ARTICLE JSON-LD ──────────────────────────────────────
// One builder, used by the article catch-all and SEOWrapper, so every page emits
// exactly one correct Article/NewsArticle block — never two, never the wrong type.
//
// WHY @type matters for a news network:
//   - NewsArticle is a Top-Stories / Google-News eligible type. Using it on
//     evergreen reference content (guides, glossaries) misrepresents the page and
//     can trigger structured-data quality flags.
//   - Evergreen + reference content must be a plain Article (or a subtype), which
//     ranks in normal Search without claiming news freshness it doesn't have.
//
// Type resolution:
//   lifecycle 'evergreen' | 'feature'           → Article   (promoted/evergreen)
//   article_type wiki_article | article_page    → Article   (reference / guides)
//   everything else (news, jack, review)        → NewsArticle

import { SITE_CONFIG } from './site-config';
import { getAuthor, authorUrl } from './authors';
import type { Citation } from './types';

export type SchemaArticleType = 'NewsArticle' | 'Article';

const EVERGREEN_ARTICLE_TYPES = new Set([
  'wiki_article', 'WikiArticle',
  'article_page', 'ArticlePage',
]);

const EVERGREEN_LIFECYCLES = new Set(['evergreen', 'feature']);

/** Decide NewsArticle vs Article from the raw article_type and lifecycle (handles snake_case + PascalCase). */
export function resolveSchemaType(articleType?: string | null, lifecycle?: string | null): SchemaArticleType {
  if (lifecycle && EVERGREEN_LIFECYCLES.has(lifecycle)) return 'Article';
  if (articleType && EVERGREEN_ARTICLE_TYPES.has(articleType)) return 'Article';
  return 'NewsArticle';
}

export interface ArticleSchemaInput {
  title: string;
  description?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  authorSlug?: string;
  canonicalUrl: string;
  tags?: string[];
  category?: string;
  articleType?: string | null;
  lifecycle?: string | null;
  citations?: Citation[];
}

/** Build the author node — rich registered Person entity when known, else a bare Person. */
function buildAuthorNode(authorSlug?: string, authorName?: string) {
  const registered = getAuthor(authorSlug);
  if (registered) {
    return {
      '@type': 'Person',
      '@id': authorUrl(registered.slug),
      name: registered.name,
      url: authorUrl(registered.slug),
      jobTitle: registered.jobTitle,
      knowsAbout: registered.knowsAbout,
      ...(registered.sameAs.length > 0 && { sameAs: registered.sameAs }),
    };
  }
  return {
    '@type': 'Person',
    name: authorName ?? '',
    ...(authorSlug && { url: authorUrl(authorSlug) }),
  };
}

/** Build the canonical Article/NewsArticle JSON-LD object. */
export function buildArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  const type = resolveSchemaType(input.articleType, input.lifecycle);
  const datePublished = input.datePublished;
  const dateModified = input.dateModified ?? input.datePublished;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: input.title,
    description: input.description ?? '',
    ...(input.imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: input.imageUrl,
        width: input.imageWidth ?? 1200,
        height: input.imageHeight ?? 675,
      },
    }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: buildAuthorNode(input.authorSlug, input.authorName),
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.publisherName,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.logo,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl,
    },
    isAccessibleForFree: true,
    ...(input.tags?.length ? { keywords: input.tags.join(', ') } : {}),
    ...(input.category ? { articleSection: input.category } : {}),
    ...(input.citations?.length
      ? {
          citation: input.citations.map((cit: Citation) => ({
            '@type': 'CreativeWork',
            name: cit.title,
            url: cit.url,
            publisher: {
              '@type': 'Organization',
              name: cit.publisher,
            },
            ...(cit.datePublished && { datePublished: cit.datePublished }),
          })),
        }
      : {}),
  };
}
