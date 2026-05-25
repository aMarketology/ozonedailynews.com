/**
 * ArticlePageDB — Server Component
 *
 * Fetches a row from the `article_pages` table by slug and renders it
 * using the <ArticlePage> display component.
 *
 * JSONB columns (info_box, table_of_contents, related_links, back_link) are
 * stored in the DB matching their TypeScript shapes and passed through directly.
 *
 * Usage in a page.tsx:
 *   export const dynamic = 'force-dynamic';
 *   export default function Page() {
 *     return <ArticlePageDB slug="my-page-slug" />;
 *   }
 */

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArticlePage, TableOfContents } from './ArticlePage';
import { ContentRenderer } from './ContentRenderer';

const STATIC_DIR = path.join(process.cwd(), 'content', 'static', 'article_pages');

function loadStaticRow(slug: string): Record<string, unknown> | null {
  try {
    const safeSlug = slug.replace(/\//g, '__');
    const fp = path.join(STATIC_DIR, `${safeSlug}.json`);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface ArticlePageDBProps {
  slug: string;
}

export async function ArticlePageDB({ slug }: ArticlePageDBProps) {
  let rowRaw: Record<string, unknown> | null = loadStaticRow(slug);
  if (!rowRaw) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from('article_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      rowRaw = data ?? null;
    }
  }
  if (!rowRaw) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = rowRaw as any;

  return (
    <ArticlePage
      title={row.title}
      subtitle={row.subtitle ?? undefined}
      category={row.category ?? undefined}
      lastUpdated={row.last_updated ?? undefined}
      infoBox={row.info_box ?? undefined}
      tableOfContents={row.table_of_contents ?? undefined}
      relatedLinks={row.related_links ?? undefined}
      backLink={row.back_link ?? undefined}
      breadcrumbs={Array.isArray(row.breadcrumbs) && row.breadcrumbs.length > 0 ? row.breadcrumbs : undefined}
      slug={slug}
      url={row.url ?? `/${slug}`}
    >
      {row.table_of_contents && row.table_of_contents.length > 0 && (
        <TableOfContents items={row.table_of_contents} />
      )}
      <ContentRenderer html={row.content_html ?? ''} />
    </ArticlePage>
  );
}
