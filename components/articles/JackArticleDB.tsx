/**
 * JackArticleDB — Server Component
 *
 * Fetches a row from the `jack_articles` table by slug and renders it
 * using the <JackArticle> display component.
 *
 * JSONB columns (categories, hero_image, breadcrumbs, author, related_articles,
 * timeline, documents, sources, footer_links) are stored as-is in the DB and
 * passed through directly — no manual mapping required.
 *
 * Usage in a page.tsx:
 *   export const dynamic = 'force-dynamic';
 *   export default function Page() {
 *     return <JackArticleDB slug="my-article-slug" />;
 *   }
 */

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JackArticle from './JackArticle';
import { ContentRenderer } from './ContentRenderer';
import { SisterSiteCallout } from '@/components/ui/SisterSiteLink';

const STATIC_DIR = path.join(process.cwd(), 'content', 'static', 'jack_articles');

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

interface JackArticleDBProps {
  slug: string;
}

export async function JackArticleDB({ slug }: JackArticleDBProps) {
  // Try static file first, fallback to Supabase
  let rowRaw: Record<string, unknown> | null = loadStaticRow(slug);
  if (!rowRaw) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from('jack_articles')
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
    <JackArticle
      slug={slug}
      layout={row.layout ?? undefined}
      title={row.title}
      subtitle={row.subtitle ?? undefined}
      subject={row.subject ?? undefined}
      description={row.description ?? undefined}
      categoryLabel={row.category_label ?? undefined}
      categories={row.categories ?? undefined}
      publishDate={row.publish_date ?? ''}
      publishDateISO={row.publish_date_iso ?? undefined}
      modifiedDateISO={row.modified_date_iso ?? undefined}
      readTime={row.read_time ?? undefined}
      heroImage={
        row.hero_image
          ? typeof row.hero_image === 'string'
            ? { src: row.hero_image as string, alt: (row.thumbnail_alt as string) ?? (row.title as string) ?? '' }
            : row.hero_image
          : undefined
      }
      breadcrumbs={row.breadcrumbs ?? undefined}
      author={row.author ?? undefined}
      relatedArticles={row.related_articles ?? undefined}
      timeline={row.timeline ?? undefined}
      documents={row.documents ?? undefined}
      showNewsletter={row.show_newsletter ?? undefined}
      newsletterTitle={row.newsletter_title ?? undefined}
      newsletterDescription={row.newsletter_description ?? undefined}
      sources={row.sources ?? undefined}
      showCorrections={row.show_corrections ?? undefined}
      showEditorialStandards={row.show_editorial_standards ?? undefined}
      footerTagline={row.footer_tagline ?? undefined}
      footerLinks={row.footer_links ?? undefined}
      accentColor={row.accent_color ?? undefined}
      articleUrl={row.article_url ?? undefined}
      section={row.section ?? undefined}
      keywords={row.keywords ?? undefined}
      uuid={row.uuid ?? undefined}
      version={row.version ?? undefined}
    >
      {row.owire_link && (
        <SisterSiteCallout
          heading={row.owire_link.heading ?? 'More on owire.org'}
          description={row.owire_link.description ?? ''}
          href={row.owire_link.href}
          ctaLabel={row.owire_link.cta ?? 'Read on owire.org →'}
        />
      )}
      <ContentRenderer html={row.content_html ?? ''} />
    </JackArticle>
  );
}
