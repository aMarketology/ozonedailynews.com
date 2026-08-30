// app/[...slug]/page.tsx
// Universal article catchall. Handles both flat (/article-slug) and nested
// (/category/sub/article-slug) paths without needing individual page.tsx stubs.
// Specific stubs (e.g. app/google/news/article/page.tsx) always win in Next.js routing.
//
// ISR: revalidate = 60 — pages regenerate server-side within 60 seconds of a
// publish. This means an editor's typo fix is live within a minute without
// waiting for a full Railway/Vercel build pipeline to complete.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleByUrlSegments, getAllArticles } from '@/lib/article-service';
import { getAllEntries } from '@/lib/registry-service';
import { SITE_CONFIG } from '@/lib/site-config';
import { NewsArticle } from '@/components/articles/NewsArticle';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';
import { JackArticleDB } from '@/components/articles/JackArticleDB';
import { ArticlePageDB } from '@/components/articles/ArticlePageDB';
import { CreatorArticleDB } from '@/components/articles/CreatorArticleDB';
import { buildArticleSchema } from '@/lib/article-schema';
import type { Citation } from '@/lib/types';
import type { TopicTagType } from '@/components/articles/NewsArticle';

// Revalidate every 60 seconds — ISR means article edits go live within 1 minute
// without requiring a full build/deploy cycle.
export const revalidate = 60;

// Article pages use client auth/comments; skip build-time prerender (see generateStaticParams).
export const dynamic = 'force-dynamic';

// Registry-driven static paths disabled until client engagement is prerender-safe.
// Pages resolve on demand via getArticleByUrlSegments at request time.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleByUrlSegments(slug);
  if (!article) return {};

  const canonicalUrl = article.metadata?.alternates?.canonical
    ?? article.url
    ?? `${SITE_CONFIG.url}/${slug.join('/')}`;

  return {
    title: article.metadata?.title ?? article.title,
    description: article.metadata?.description ?? article.subtitle ?? '',
    keywords: article.metadata?.keywords ?? article.tags ?? [],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: (article.metadata?.openGraph?.title as string | undefined) ?? article.metadata?.title ?? article.title,
      description: (article.metadata?.openGraph?.description as string | undefined) ?? article.metadata?.description ?? article.subtitle ?? '',
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      // Prefer Satori-generated branded OG image; fall back to thumbnail if api/og unreachable
      images: [
        {
          url: `${SITE_CONFIG.url}/api/og?slug=${encodeURIComponent(article.slug)}`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
        ...(article.thumbnail_src
          ? [{ url: article.thumbnail_src, width: 1200, height: 675, alt: article.thumbnail_alt ?? article.title }]
          : []),
      ],
      publishedTime: article.published_at,
      authors: article.author_name ? [article.author_name] : [],
      section: article.category,
      tags: article.tags ?? [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metadata?.title ?? article.title,
      description: article.metadata?.description ?? article.subtitle ?? '',
      images: [`${SITE_CONFIG.url}/api/og?slug=${encodeURIComponent(article.slug)}`],
    },
  };
}

export default async function ArticleCatchallPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const article = await getArticleByUrlSegments(slug);
  if (!article) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articleAny = article as any;
  const htmlContent: string =
    articleAny.content_html ??
    (Array.isArray(articleAny.content)
      ? (articleAny.content.find((b: { type: string; content?: string }) => b.type === 'html')?.content ?? '')
      : '');

  const canonicalUrl = article.metadata?.alternates?.canonical
    ?? article.url
    ?? `${SITE_CONFIG.url}/${slug.join('/')}`;

  const articleType = (articleAny.article_type as string | undefined) ?? 'news_article';

  // Single source of article JSON-LD (lib/article-schema.ts):
  //  - picks NewsArticle vs Article from article_type + lifecycle (evergreen → Article)
  //  - links the byline to its full registered Person entity (@id, sameAs, jobTitle)
  //  - dateModified reflects the corrections ledger (modified_date_iso) when present
  // creator_article renders its own ProfilePage schema (richer for profiles), so we
  // skip the article block for that type to avoid emitting two conflicting schemas.
  const jsonLd = articleType === 'creator_article'
    ? null
    : buildArticleSchema({
        title: article.title,
        description: article.metadata?.description ?? article.subtitle ?? '',
        imageUrl: article.thumbnail_src ?? undefined,
        datePublished: article.published_at,
        dateModified: articleAny.modified_date_iso ?? articleAny.modified_at ?? article.published_at,
        authorName: article.author_name,
        authorSlug: article.author_slug ?? undefined,
        canonicalUrl,
        tags: article.tags ?? [],
        category: article.category,
        articleType,
        lifecycle: articleAny.lifecycle as string | undefined,
        citations: (articleAny.citations as Citation[] | undefined) ?? undefined,
      });

  // Build breadcrumbs from URL segments
  const breadcrumbs = [{ name: 'Home', item: '/' }];
  let cumPath = '';
  for (let i = 0; i < slug.length - 1; i++) {
    cumPath += '/' + slug[i];
    breadcrumbs.push({
      name: slug[i].charAt(0).toUpperCase() + slug[i].slice(1).replace(/-/g, ' '),
      item: cumPath,
    });
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {(() => {
        switch (articleType) {
          case 'jack_article':
            return <JackArticleDB slug={article.slug} />;
          case 'article_page':
          case 'wiki_article':   // wiki_article is now an alias for article_page
            return <ArticlePageDB slug={article.slug} />;
          case 'creator_article':
            return <CreatorArticleDB slug={article.slug} />;
          case 'news_article':
          default:
            return (
              <NewsArticle
                title={article.title}
                subtitle={article.subtitle ?? undefined}
                category={article.category}
                publishDate={new Date(article.published_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
                readTime={articleAny.read_time ?? undefined}
                topicTag={articleAny.topic_tag as TopicTagType | undefined}
                author={article.author_name ? {
                  name: article.author_name,
                  role: articleAny.author_role ?? undefined,
                  avatar: articleAny.author_avatar ?? undefined,
                  authorSlug: article.author_slug ?? undefined,
                } : undefined}
                heroImage={article.thumbnail_src ? {
                  src: article.thumbnail_src,
                  alt: article.thumbnail_alt ?? article.title,
                } : undefined}
                tags={article.tags ?? []}
                breaking={article.breaking ?? false}
                trending={articleAny.trending ?? false}
                slug={slug.join('-')}
                url={canonicalUrl}
                breadcrumbs={breadcrumbs}
              >
                {htmlContent ? (
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                ) : (
                  <p className="text-gray-500 italic">Content coming soon.</p>
                )}
              </NewsArticle>
            );
        }
      })()}
    </>
  );
}
