// components/SEOWrapper.tsx
// Injects NewsArticle + BreadcrumbList JSON-LD on any page that uses it.
// Driven by content registry — slug must exist in content_registry.json.

import { getEntry } from '@/lib/registry-service';
import { SITE_CONFIG } from '@/lib/site-config';

interface SEOWrapperProps {
  slug: string;
  children: React.ReactNode;
}

export async function SEOWrapper({ slug, children }: SEOWrapperProps) {
  const entry = await getEntry(slug);
  if (!entry) return <>{children}</>;

  const authorUrl = entry.authorSlug
    ? `${SITE_CONFIG.url}/authors/${entry.authorSlug}`
    : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: entry.title,
    description: entry.description,
    datePublished: entry.publishDate,
    dateModified: entry.modifiedDate,
    author: {
      '@type': 'Person',
      name: entry.author,
      ...(authorUrl && { url: authorUrl }),
    },
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
      '@id': `${SITE_CONFIG.url}${entry.slug}`,
    },
    ...(entry.imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: entry.imageUrl,
        width: entry.imageWidth ?? 1200,
        height: entry.imageHeight ?? 675,
      },
    }),
    keywords: entry.tags.join(', '),
  };

  const segments = entry.slug.split('/').filter(Boolean);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.url,
      },
      ...segments.map((segment, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        item: `${SITE_CONFIG.url}/${segments.slice(0, i + 1).join('/')}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
