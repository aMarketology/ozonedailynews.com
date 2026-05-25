// app/rss.xml/route.ts
// RSS feed for article subscribers and feed aggregators.

import { NextResponse } from 'next/server';
import { getLatestArticles } from '@/lib/registry-service';
import { SITE_CONFIG } from '@/lib/site-config';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const articles = await getLatestArticles(50);
  const baseUrl = SITE_CONFIG.url;
  const buildDate = new Date().toUTCString();

  const items = articles
    .map((a) => {
      const pubDate = new Date(a.publishDate).toUTCString();
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${baseUrl}${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}${a.slug}</guid>
      <description>${escapeXml(a.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.category)}</category>
      <author>${escapeXml(a.author)}</author>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)}</title>
    <link>${baseUrl}</link>
    <description>Objective news from ${escapeXml(SITE_CONFIG.publisherName)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <managingEditor>${SITE_CONFIG.email}</managingEditor>
    <webMaster>${SITE_CONFIG.email}</webMaster>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
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
