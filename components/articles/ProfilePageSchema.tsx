/**
 * ProfilePageSchema — JSON-LD structured data for /influencer creator profile pages.
 *
 * Uses schema.org ProfilePage + Person, which enables:
 *  - Google Knowledge Panel eligibility
 *  - People Also Search cards
 *  - Social profile sameAs links in search results
 *
 * Replace NewsArticleSchema on all CreatorArticle pages.
 */

export interface ProfilePageSchemaProps {
  /** Creator's full display name */
  personName: string;
  /** Page title / SEO title */
  pageTitle: string;
  /** Meta description */
  description: string;
  /** Canonical page URL — must be https://www.ozonenetwork.news/... */
  pageUrl: string;
  /** Full image URL for the person */
  imageUrl?: string;
  /** ISO-8601 published timestamp */
  publishedTime: string;
  /** ISO-8601 modified timestamp */
  modifiedTime?: string;
  /**
   * Social profile URLs extracted from the sidebar infobox rows.
   * Any row with an href that starts with http is included.
   */
  sameAs?: string[];
  /** Keywords / tags for the page */
  keywords?: string[];
}

export function ProfilePageSchema({
  personName,
  pageTitle,
  description,
  pageUrl,
  imageUrl,
  publishedTime,
  modifiedTime,
  sameAs = [],
  keywords = [],
}: ProfilePageSchemaProps) {
  // Filter to real external social URLs only
  const socialUrls = sameAs.filter(
    (url) =>
      url.startsWith('http') &&
      !url.startsWith('https://www.ozonenetwork.news') &&
      !url.startsWith('mailto:'),
  );

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'name': pageTitle,
    'description': description,
    'url': pageUrl,
    'datePublished': publishedTime,
    'dateModified': modifiedTime || publishedTime,
    'inLanguage': 'en-US',
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'OzoneNews News',
      'url': 'https://www.ozonenetwork.news',
    },
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.ozonenetwork.news' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Influencer', 'item': 'https://www.ozonenetwork.news/influencer' },
        { '@type': 'ListItem', 'position': 3, 'name': personName, 'item': pageUrl },
      ],
    },
    'mainEntity': {
      '@type': 'Person',
      'name': personName,
      'description': description,
      ...(imageUrl && {
        'image': {
          '@type': 'ImageObject',
          'url': imageUrl.startsWith('http')
            ? imageUrl
            : `https://www.ozonenetwork.news${imageUrl}`,
          'width': 1200,
          'height': 675,
        },
      }),
      'url': pageUrl,
      ...(socialUrls.length > 0 && { 'sameAs': socialUrls }),
      ...(keywords.length > 0 && { 'knowsAbout': keywords.slice(0, 8) }),
    },
    'author': {
      '@type': 'Organization',
      'name': 'OzoneNews News',
      'url': 'https://www.ozonenetwork.news',
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'OzoneNews News',
      'url': 'https://www.ozonenetwork.news',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.ozonenetwork.news/OzoneNews-logo.png',
        'width': 600,
        'height': 60,
      },
    },
    ...(keywords.length > 0 && { 'keywords': keywords.join(', ') }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
