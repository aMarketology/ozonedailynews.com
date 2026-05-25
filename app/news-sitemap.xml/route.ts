// app/news-sitemap.xml/route.ts
// Google News sitemap — articles from last 48h only (1,000 URL max per spec).
// Pre-generated at build time for static export.
// Reads content/static/articles/ directly — never Supabase.

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SITE_CONFIG } from '@/lib/site-config';
import type { ArticleFull } from '@/lib/types';

export const dynamic = 'force-static';

function getRecentArticles(): ArticleFull[] {
  const dir = path.join(process.cwd(), 'content', 'static', 'articles');
  if (!fs.existsSync(dir)) return [];

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== '_index.json')
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as ArticleFull;
      } catch {
        return null;
      }
    })
    .filter((a): a is ArticleFull => {
      if (!a) return false;
      return a.status === 'published' && new Date(a.published_at) > cutoff;
    })
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 1000);
}

export async function GET() {
  const articles = getRecentArticles();
  const baseUrl = SITE_CONFIG.url;

  const urlEntries = articles
    .map((a) => {
      const pubDate = new Date(a.published_at).toUTCString();
      return `
    <url>
      <loc>${baseUrl}${a.url}</loc>
      <lastmod>${new Date(a.published_at).toISOString()}</lastmod>
      <news:news>
        <news:publication>
          <news:name>${SITE_CONFIG.name}</news:name>
          <news:language>en</news:language>
        </news:publication>
        <news:publication_date>${pubDate}</news:publication_date>
        <news:title>${escapeXml(a.title)}</news:title>
      </news:news>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
