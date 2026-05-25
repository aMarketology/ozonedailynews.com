// app/robots.ts
// All major AI crawlers are explicitly permitted (GEO requirement).
// Never place robots.txt in /public — this file takes precedence.

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/'],
      },
      // AI crawlers — explicitly permitted (GEO requirement)
      { userAgent: 'GPTBot',        allow: '/' },
      { userAgent: 'ChatGPT-User',  allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'anthropic-ai',  allow: '/' },
      { userAgent: 'Claude-Web',    allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Bingbot',       allow: '/' },
      { userAgent: 'cohere-ai',     allow: '/' },
      { userAgent: 'YouBot',        allow: '/' },
      { userAgent: 'Applebot',      allow: '/' },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
