import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb component with visible navigation + JSON-LD schema
 * Improves SEO, user navigation, and site structure clarity
 */
function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate JSON-LD schema for breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.item}`,
    })),
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visible Breadcrumb Navigation */}
      <nav 
        aria-label="Breadcrumb" 
        className={`text-sm text-gray-600 mb-6 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.item} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-gray-400" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast ? (
                  <span 
                    className="font-medium text-gray-900" 
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link 
                    href={item.item}
                    className="hover:text-gray-900 hover:underline transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * Helper function to generate breadcrumbs from a path
 * Example: "/news/technology/ai-breakthrough" 
 * → [Home, News, Technology, AI Breakthrough]
 */
export function generateBreadcrumbsFromPath(
  pathname: string,
  customLabels?: Record<string, string>
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'Home', item: '/' }];
  
  // Remove leading/trailing slashes and split
  const segments = pathname.replace(/^\/|\/$/g, '').split('/');
  
  let currentPath = '';
  
  for (const segment of segments) {
    if (!segment) continue;
    
    currentPath += `/${segment}`;
    
    // Use custom label if provided, otherwise format the segment
    const label = customLabels?.[segment] || 
      segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    items.push({
      name: label,
      item: currentPath,
    });
  }
  
  return items;
}

/**
 * Common breadcrumb patterns for the site
 */
export const breadcrumbPatterns = {
  news: (title: string, slug: string): BreadcrumbItem[] => [
    { name: 'Home', item: '/' },
    { name: 'News', item: '/news' },
    { name: title, item: `/${slug}` },
  ],
  
  newsCategory: (category: string, title: string, slug: string): BreadcrumbItem[] => [
    { name: 'Home', item: '/' },
    { name: 'News', item: '/news' },
    { name: category, item: `/news/${category.toLowerCase()}` },
    { name: title, item: `/${slug}` },
  ],
  
  author: (authorName: string, authorSlug: string): BreadcrumbItem[] => [
    { name: 'Home', item: '/' },
    { name: 'Authors', item: '/about' },
    { name: authorName, item: `/author/${authorSlug}` },
  ],
  
  topic: (topicName: string, topicSlug: string): BreadcrumbItem[] => [
    { name: 'Home', item: '/' },
    { name: topicName, item: `/${topicSlug}` },
  ],
  
  nestedTopic: (parent: string, parentSlug: string, child: string, childSlug: string): BreadcrumbItem[] => [
    { name: 'Home', item: '/' },
    { name: parent, item: `/${parentSlug}` },
    { name: child, item: `/${parentSlug}/${childSlug}` },
  ],
};

// Export both as default and named export for compatibility
export default Breadcrumb;
export { Breadcrumb };
