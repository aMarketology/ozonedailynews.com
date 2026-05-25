// app/sitemap.ts
// Driven entirely by content_registry.json. No deploy-timestamp faking.
// Never hardcode canonical in layout.tsx. Each page.tsx sets its own.

import type { MetadataRoute } from 'next';
import { getAllEntries } from '@/lib/registry-service';
import { SITE_CONFIG } from '@/lib/site-config';

export const revalidate = 86400; // Daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const entries = await getAllEntries();

  const articleUrls: MetadataRoute.Sitemap = entries
    .filter((e) => e.lifecycle !== 'pruned')
    .map((entry) => ({
      url: `${baseUrl}${entry.slug}`,
      lastModified: new Date(entry.modifiedDate || entry.publishDate),
      changeFrequency: entry.changeFrequency,
      priority: entry.lifecycle === 'feature' ? 0.9 : entry.priority,
    }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                             lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/about`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/editorial-standards`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/corrections`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${baseUrl}/contact`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [...staticPages, ...articleUrls];
}
