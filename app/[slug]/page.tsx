// app/[slug]/page.tsx
// Universal article page. Reads from content/static/articles/{slug}.json
// Falls back to Supabase if not found on disk.
// Renders with the NewsArticle component from Object-wire26-.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getAllArticles } from '@/lib/article-service';
import { SITE_CONFIG } from '@/lib/site-config';
import { NewsArticle } from '@/components/articles/NewsArticle';
import type { TopicTagType } from '@/components/articles/NewsArticle';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const canonicalUrl = `${SITE_CONFIG.url}/${slug}`;
  return {
    title: article.metadata?.title ?? article.title,
    description: article.metadata?.description ?? article.subtitle ?? '',
    keywords: article.tags ?? [],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: article.metadata?.title ?? article.title,
      description: article.metadata?.description ?? article.subtitle ?? '',
      url: canonicalUrl,
      images: article.thumbnail_src ? [{ url: article.thumbnail_src }] : [],
      publishedTime: article.published_at,
      authors: article.author_name ? [article.author_name] : [],
      section: article.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metadata?.title ?? article.title,
      description: article.metadata?.description ?? article.subtitle ?? '',
      images: article.thumbnail_src ? [article.thumbnail_src] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Derive the HTML body from content array or content_html field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articleAny = article as any;
  const htmlContent: string =
    articleAny.content_html ??
    (Array.isArray(articleAny.content)
      ? (articleAny.content.find((b: { type: string; content?: string }) => b.type === 'html')?.content ?? '')
      : '');

  const canonicalUrl = `${SITE_CONFIG.url}/${slug}`;

  return (
    <NewsArticle
      title={article.title}
      subtitle={article.subtitle ?? undefined}
      category={article.category}
      publishDate={new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })}
      readTime={articleAny.read_time ?? undefined}
      author={article.author_name ? {
        name: article.author_name,
        role: articleAny.author_role ?? undefined,
        avatar: articleAny.author_avatar ?? undefined,
        authorSlug: article.author_slug ?? undefined,
      } : undefined}
      heroImage={article.thumbnail_src ? {
        src: article.thumbnail_src,
        alt: article.title,
      } : undefined}
      tags={article.tags ?? []}
      breaking={article.breaking ?? false}
      trending={articleAny.trending ?? false}
      slug={slug}
      url={canonicalUrl}
      breadcrumbs={[
        { name: 'Home', item: '/' },
        { name: article.category, item: `/${article.category.toLowerCase()}` },
        { name: article.title, item: `/${slug}` },
      ]}
    >
      {htmlContent ? (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      ) : (
        <p className="text-gray-500 italic">Content coming soon.</p>
      )}
    </NewsArticle>
  );
}
