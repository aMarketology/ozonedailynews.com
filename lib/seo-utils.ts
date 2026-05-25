import type { Metadata } from 'next';
import { SITE_CONFIG } from './site-config';

interface ArticleMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  category?: string;
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
}

export function generateArticleMetadata(opts: ArticleMetadataOptions): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: opts.canonicalUrl },
    openGraph: {
      title: opts.title,
      description: opts.description,
      type: 'article',
      url: opts.canonicalUrl,
      siteName: SITE_CONFIG.name,
      ...(opts.publishedTime && { publishedTime: opts.publishedTime }),
      ...(opts.modifiedTime && { modifiedTime: opts.modifiedTime }),
      ...(opts.authors && { authors: opts.authors }),
      ...(opts.category && { section: opts.category }),
      ...(opts.tags && { tags: opts.tags }),
      ...(opts.imageUrl && {
        images: [{ url: opts.imageUrl, width: 1200, height: 675, alt: opts.imageAlt ?? opts.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
    },
  };
}
