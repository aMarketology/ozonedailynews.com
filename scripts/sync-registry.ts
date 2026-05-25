#!/usr/bin/env ts-node
// scripts/sync-registry.ts
// Syncs content/static/articles (and other stores) into content_registry.json.
// Run after publishing new articles to make them visible to sitemap, JSON-LD, related.
// Usage: npx ts-node scripts/sync-registry.ts --write
//        npx ts-node scripts/sync-registry.ts       (dry run, prints diff)

import fs from 'fs';
import path from 'path';
import type { ContentEntry } from '../lib/types';

const WRITE = process.argv.includes('--write');
const REGISTRY_PATH = path.join(process.cwd(), 'content', 'static', 'content_registry.json');
const STATIC_BASE = path.join(process.cwd(), 'content', 'static');

const STORES: Array<{ table: string; articleType: ContentEntry['articleType'] }> = [
  { table: 'articles',         articleType: 'NewsArticle'    },
  { table: 'jack_articles',    articleType: 'JackArticle'    },
  { table: 'article_pages',    articleType: 'ArticlePage'    },
  { table: 'creator_articles', articleType: 'CreatorArticle' },
  { table: 'wiki_articles',    articleType: 'WikiArticle'    },
];

// Load existing registry
let existing: ContentEntry[] = [];
if (fs.existsSync(REGISTRY_PATH)) {
  try {
    existing = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    existing = [];
  }
}

const existingSlugs = new Set(existing.map((e) => e.slug));
const newEntries: ContentEntry[] = [];

for (const { table, articleType } of STORES) {
  const dir = path.join(STATIC_BASE, table);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== '_index.json');

  for (const file of files) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const article: Record<string, any> = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const slug = article.url ?? article.slug ?? '';
      if (!slug || existingSlugs.has(slug)) continue;

      const entry: ContentEntry = {
        slug,
        title:           article.title ?? '',
        description:     article.metadata?.description ?? article.subtitle ?? '',
        publishDate:     article.published_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        modifiedDate:    article.published_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        category:        article.category ?? 'News',
        tags:            Array.isArray(article.tags) ? article.tags : [],
        author:          article.author_name ?? '',
        authorSlug:      article.author_slug,
        priority:        0.7,
        changeFrequency: 'daily',
        imageUrl:        article.thumbnail_src,
        articleType,
        lifecycle:       article.lifecycle ?? 'news',
        breaking:        article.breaking ?? false,
      };

      newEntries.push(entry);
      existingSlugs.add(slug);
    } catch {
      console.warn(`  Warning: Failed to parse ${file}`);
    }
  }
}

if (newEntries.length === 0) {
  console.log('\n✔ sync-registry: Registry is up to date. No new entries to add.\n');
  process.exit(0);
}

console.log(`\n  sync-registry: Found ${newEntries.length} new article(s) to register:`);
newEntries.forEach((e) => console.log(`    + ${e.slug}`));

if (WRITE) {
  const merged = [...existing, ...newEntries].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(merged, null, 2) + '\n');
  console.log(`\n  ✔ Registry updated: ${merged.length} total entries.\n`);
} else {
  console.log('\n  Dry run. Run with --write to apply changes.\n');
}
