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
import { getAuthor } from '@/lib/authors';
import { extractAndInjectToc } from '@/lib/toc-utils';
import JackArticle from './JackArticle';
import { ContentRenderer } from './ContentRenderer';
import { SourcesInterlink } from './SourcesInterlink';
import type { Citation } from '@/lib/types';
import { SisterSiteCallout } from '@/components/ui/SisterSiteLink';

const STATIC_DIR = path.join(process.cwd(), 'content', 'static', 'jack_articles');

function findJsonFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findJsonFilesRecursive(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) results.push(full);
  }
  return results;
}

function loadStaticRow(slug: string): Record<string, unknown> | null {
  try {
    // 1. Flat path (legacy: jack_articles/slug.json)
    const safeSlug = slug.replace(/\//g, '__');
    const fp = path.join(STATIC_DIR, `${safeSlug}.json`);
    if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf8')) as Record<string, unknown>;

    // 2. Sharded subdirectory scan (jack_articles/YYYY/MM/slug.json)
    const target = `${safeSlug}.json`;
    const match = findJsonFilesRecursive(STATIC_DIR).find(f => path.basename(f) === target);
    if (match) return JSON.parse(fs.readFileSync(match, 'utf8')) as Record<string, unknown>;

    return null;
  } catch {
    return null;
  }
}

interface JackArticleDBProps {
  slug: string;
}

export async function JackArticleDB({ slug }: JackArticleDBProps) {
  // Static JSON is source of truth — always read it first. This guarantees the
  // Git-committed version (with correct article_type + full content) always wins
  // over any stale Supabase row left by a mis-routed update.
  let rowRaw: Record<string, unknown> | null = loadStaticRow(slug);

  // Only fall back to Supabase when there is no static file (e.g. breaking news
  // inserted directly into the DB before a Git commit). Always check jack_articles
  // first, then articles as a legacy fallback.
  if (!rowRaw) {
    const supabase = await createClient();
    if (supabase) {
      const { data: jackData } = await supabase
        .from('jack_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      rowRaw = jackData ?? null;

      if (!rowRaw) {
        const { data: articleData } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();
        rowRaw = articleData ?? null;
      }
    }
  }

  if (!rowRaw) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = rowRaw as any;

  // ── TOC: extract H2 headings and inject anchor IDs into the HTML ──
  const { processedHtml, tocHeadings } = extractAndInjectToc(row.content_html ?? '');

  // ── Author: prefer explicit author object, fall back to registry lookup ──
  // Most articles store only author_name + author_slug at top level; the
  // AuthorEntity registry has the full initials, jobTitle, and avatarUrl.
  const resolvedAuthor = (() => {
    if (row.author) return row.author;
    const entity = getAuthor(row.author_slug as string | undefined);
    if (!entity) return undefined;
    return {
      name:       entity.name,
      slug:       entity.slug,
      avatar:     entity.avatarUrl ?? undefined,
      initials:   entity.initials,
      department: entity.jobTitle,
      beats:      entity.beats,
      url:        `/authors/${entity.slug}`,
    };  })();

  return (
    <JackArticle
      slug={slug}
      emitSchema={false}
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
      author={resolvedAuthor}
      tocHeadings={tocHeadings.length > 0 ? tocHeadings : undefined}
      relatedArticles={
        Array.isArray(row.related_articles)
          ? row.related_articles.map((a: Record<string, unknown>) => ({
              ...a,
              // JSON uses "url"; component uses "href" — normalise both
              href: (a.href ?? a.url ?? '#') as string,
            }))
          : undefined
      }
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
      <ContentRenderer html={processedHtml} />
      <SourcesInterlink
        sources={Array.isArray(row.sources) ? row.sources.map((s: { url: string; title: string; publisher?: string }, i: number) => ({
          number: i + 1,
          url: s.url,
          title: s.title,
          author: s.publisher,
        })) : []}
        citations={Array.isArray(row.citations) ? (row.citations as Citation[]) : []}
      />
    </JackArticle>
  );
}
