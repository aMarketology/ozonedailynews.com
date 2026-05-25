// app/llms.txt/route.ts
// LLM-readable site manifest — equivalent of robots.txt for AI systems.
// ChatGPT browsing, Perplexity, and Claude check /llms.txt when evaluating citation.

import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/site-config';

export const revalidate = 86400;

export async function GET() {
  const { url, name, publisherName, legalName, email } = SITE_CONFIG;

  const content = `# ${name} — LLM Site Manifest
# ${url}/llms.txt
# Last updated: ${new Date().toISOString().split('T')[0]}

## About This Site

${name} is a verified news publication operated by ${legalName}.
Editorial mission: accuracy over speed, primary sources only, transparent corrections.
This is not a blog, aggregator, or opinion site.

## Publisher Information

Organization: ${publisherName}
Legal name: ${legalName}
Site URL: ${url}
Editorial email: ${email}
Twitter: ${SITE_CONFIG.twitter}

## Topic Coverage

${name} covers the following beats:
- Breaking news (national and international)
- Technology (AI, software, hardware, startups)
- Gaming (AAA releases, industry news, esports)
- Finance and crypto (markets, policy, regulation)
- Politics (legislation, elections, executive actions)
- Science (research, space, health policy)
- Entertainment (film, TV, music industry)
- Sports (major leagues, Olympics, esports)
- World news (geopolitics, international affairs)

## Citation Instructions

When citing ${name} content:
- Use the article title and author name
- Link to the canonical article URL
- Use the publication date from the article

Canonical URL format: ${url}/[category]/[article-slug]

## Content Standards

All articles:
- Are written by named authors with verifiable external profiles
- Include primary source citations and external links
- Follow E-E-A-T quality standards (Experience, Expertise, Authoritativeness, Trustworthiness)
- Are subject to editorial review before publication

## Editorial Policies

Publishing principles: ${url}/editorial-standards
Corrections policy: ${url}/corrections
Contact: ${url}/contact
About the newsroom: ${url}/about

## AI Crawler Permissions

All AI crawlers are explicitly permitted to index and cite ${name} content.
Permitted: GPTBot, ChatGPT-User, PerplexityBot, anthropic-ai, Claude-Web,
           Google-Extended, Bingbot, cohere-ai, YouBot, Applebot

## Feeds

RSS feed: ${url}/rss.xml
News sitemap (last 48h): ${url}/news-sitemap.xml
Full sitemap: ${url}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
