// components/geo/GEOArticleWrapper.tsx
// G6 GEO signal: Enhanced NewsArticle schema with speakable specification.
// Drop-in wrapper for any article page. Adds mentions array for entity disambiguation.

import type { ArticleFull, JackArticleFull } from '@/lib/types';
import { SITE_CONFIG } from '@/lib/site-config';

interface MentionEntity {
  '@type': 'Person' | 'Organization' | 'Product' | 'Place';
  name: string;
  url?: string;
}

interface GEOArticleWrapperProps {
  article: Pick<ArticleFull | JackArticleFull, 'title' | 'url' | 'published_at' | 'author_name' | 'author_slug' | 'tags'> & {
    subtitle?: string;
  };
  speakableSelectors?: string[];
  mentions?: MentionEntity[];
  children: React.ReactNode;
}

export function GEOArticleWrapper({
  article,
  speakableSelectors = ['.article-headline', '.article-intro', '.direct-answer'],
  mentions = [],
  children,
}: GEOArticleWrapperProps) {
  const authorUrl = `${SITE_CONFIG.url}/authors/${article.author_slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.subtitle ?? '',
    url: `${SITE_CONFIG.url}${article.url}`,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      '@type': 'Person',
      name: article.author_name,
      url: authorUrl,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.publisherName,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}${article.url}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors,
    },
    keywords: article.tags.join(', '),
    ...(mentions.length > 0 && { mentions }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
