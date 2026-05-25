/**
 * CreatorArticleDB — Server Component
 *
 * Fetches a row from the `creator_articles` table by slug and renders it
 * using the <CreatorArticle> display component.
 *
 * JSONB columns (breadcrumbs, hero_badges, hero_cta_buttons, sidebar_infobox_rows,
 * sidebar_callout, sidebar_timeline, sidebar_related_links) are stored as-is in
 * the DB and passed through directly — no manual mapping required.
 *
 * Usage in a page.tsx:
 *   export const dynamic = 'force-dynamic';
 *   export default function Page() {
 *     return <CreatorArticleDB slug="winter-olympics/usa/alysa-liu" />;
 *   }
 */

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreatorArticle from './CreatorArticle';
import { ContentRenderer } from './ContentRenderer';

const STATIC_DIR = path.join(process.cwd(), 'content', 'static', 'creator_articles');

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

type CreatorIndexEntry = {
  slug: string;
  hero_name?: string;
  hero_subtitle?: string;
  sidebar_infobox_image_src?: string;
  sidebar_infobox_image_alt?: string;
  schema_article_url?: string;
  status?: string;
};

let _creatorIndex: CreatorIndexEntry[] | null = null;
function getCreatorIndex(): CreatorIndexEntry[] {
  if (_creatorIndex) return _creatorIndex;
  try {
    const indexPath = path.join(STATIC_DIR, '_index.json');
    if (fs.existsSync(indexPath)) {
      _creatorIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as CreatorIndexEntry[];
    }
  } catch {
    _creatorIndex = [];
  }
  return _creatorIndex ?? [];
}

interface CreatorArticleDBProps {
  slug: string;
}

export async function CreatorArticleDB({ slug }: CreatorArticleDBProps) {
  let rowRaw: Record<string, unknown> | null = loadStaticRow(slug);
  if (!rowRaw) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from('creator_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      rowRaw = data ?? null;
    }
  }
  if (!rowRaw) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = rowRaw as any;

  // Build related creators from static index
  const relatedCreators = getCreatorIndex()
    .filter((c) => c.slug !== slug && c.status === 'published' && c.sidebar_infobox_image_src)
    .slice(0, 5)
    .map((r) => {
      let href = '/influencer';
      if (r.schema_article_url) {
        try { href = new URL(r.schema_article_url).pathname; } catch { href = `/${r.slug}`; }
      } else {
        href = `/${r.slug}`;
      }
      return {
        name:     r.hero_name ?? r.slug,
        subtitle: r.hero_subtitle ?? 'Creator Profile',
        imageSrc: r.sidebar_infobox_image_src ?? '',
        imageAlt: r.sidebar_infobox_image_alt ?? r.hero_name ?? '',
        href,
      };
    })
    .filter((c) => c.imageSrc);

  return (
    <CreatorArticle
      schema={{
        title:         row.schema_title,
        description:   row.schema_description,
        author:        row.schema_author,
        authorUrl:     row.schema_author_url ?? undefined,
        articleUrl:    row.schema_article_url,
        imageUrl:      row.schema_image_url ?? undefined,
        section:       row.schema_section,
        keywords:      row.schema_keywords ?? [],
        publishedTime: row.schema_published_time,
        modifiedTime:  row.schema_modified_time,
      }}
      breadcrumbs={row.breadcrumbs ?? []}
      hero={{
        image:       { src: row.hero_image_src, alt: row.hero_image_alt },
        gradient:    row.hero_gradient ?? undefined,
        name:        row.hero_name,
        subtitle:    row.hero_subtitle,
        description: row.hero_description,
        badges:      row.hero_badges ?? [],
        ctaButtons:  row.hero_cta_buttons?.length ? row.hero_cta_buttons : undefined,
      }}
      sidebar={{
        infobox: {
          image:    { src: row.sidebar_infobox_image_src, alt: row.sidebar_infobox_image_alt },
          name:     row.sidebar_infobox_name,
          subtitle: row.sidebar_infobox_subtitle,
          rows:     row.sidebar_infobox_rows ?? [],
        },
        callout:      row.sidebar_callout ?? undefined,
        timeline:     row.sidebar_timeline?.length ? row.sidebar_timeline : undefined,
        relatedLinks: row.sidebar_related_links?.length ? row.sidebar_related_links : undefined,
        meta: {
          publishedDate: row.sidebar_meta_published_date,
          updatedDate:   row.sidebar_meta_updated_date ?? undefined,
          author:        row.sidebar_meta_author,
          category:      row.sidebar_meta_category,
        },
      }}
      tiktokEmbed={row.tiktok_embed ?? false}
      tags={row.schema_keywords?.length ? row.schema_keywords : undefined}
      relatedCreators={relatedCreators.length > 0 ? relatedCreators : undefined}
    >
      <ContentRenderer html={row.content_html ?? ''} />
    </CreatorArticle>
  );
}
