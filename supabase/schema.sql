-- ============================================================================
-- OzoneNews | Supabase Schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type article_status  as enum ('published', 'draft');
  create type lifecycle_state as enum ('news', 'review', 'feature', 'pruned');
  create type article_layout  as enum ('news', 'report', 'investigation');
  create type reaction_type   as enum ('fire', 'mind_blown', 'clap', 'sad', 'angry');
exception when duplicate_object then null; end $$;


-- ============================================================================
-- CONTENT TABLES
-- ============================================================================

-- ─── articles (NewsArticleDB) ─────────────────────────────────────────────────
create table if not exists articles (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        unique not null,
  url           text        not null,
  title         text        not null,
  subtitle      text,
  category      text        not null,
  status        article_status not null default 'draft',
  brand_slug    text        not null default 'ozone',
  breaking      boolean     not null default false,
  trending      boolean     not null default false,
  exclusive     boolean     not null default false,
  topic_tag     text,
  content_html  text        not null,
  publish_date  text        not null,       -- display string: "March 12, 2026"
  published_at  timestamptz not null,
  author_name   text        not null,
  author_slug   text        not null,
  read_time     text,
  thumbnail_src text,
  thumbnail_alt text,
  tags          text[]      not null default '{}',
  lifecycle     lifecycle_state not null default 'news',
  metadata      jsonb,                      -- { title, description, keywords, alternates, openGraph }
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_slug_idx       on articles (slug);
create index if not exists articles_brand_idx      on articles (brand_slug);
create index if not exists articles_status_idx     on articles (status);
create index if not exists articles_published_idx  on articles (published_at desc);
create index if not exists articles_breaking_idx   on articles (breaking) where breaking = true;
create index if not exists articles_category_idx   on articles (category);
create index if not exists articles_lifecycle_idx  on articles (lifecycle);
-- Full-text search index for site search + GEO extraction
create index if not exists articles_fts_idx on articles
  using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' || coalesce(content_html,'')));


-- ─── jack_articles (JackArticleDB — investigations / premium) ─────────────────
create table if not exists jack_articles (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        unique not null,
  url             text        not null,
  title           text        not null,
  subtitle        text,
  department      text,
  category        text        not null,
  accent_color    text,
  layout          article_layout not null default 'news',
  status          article_status not null default 'draft',
  content_html    text        not null,
  publish_date    text        not null,
  published_at    timestamptz not null,
  author_name     text        not null,
  author_slug     text        not null,
  read_time       text,
  thumbnail_src   text,
  thumbnail_alt   text,
  tags            text[]      not null default '{}',
  timeline        jsonb       not null default '[]',   -- TimelineItem[]
  sources         jsonb       not null default '[]',   -- Source[]
  related_articles jsonb      not null default '[]',  -- RelatedArticle[]
  breadcrumbs     jsonb       not null default '[]',   -- {label, href}[]
  lifecycle       lifecycle_state not null default 'news',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists jack_articles_slug_idx      on jack_articles (slug);
create index if not exists jack_articles_status_idx    on jack_articles (status);
create index if not exists jack_articles_published_idx on jack_articles (published_at desc);


-- ─── article_pages (ArticlePageDB — evergreen / wiki-style) ──────────────────
create table if not exists article_pages (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        unique not null,
  url           text        not null,
  title         text        not null,
  subtitle      text,
  category      text        not null,
  status        article_status not null default 'draft',
  content_html  text        not null,
  publish_date  text        not null,
  published_at  timestamptz not null,
  author_name   text        not null,
  author_slug   text        not null,
  read_time     text,
  thumbnail_src text,
  thumbnail_alt text,
  tags          text[]      not null default '{}',
  lifecycle     lifecycle_state not null default 'feature',  -- evergreen stays featured
  info_box      jsonb,
  table_of_contents jsonb,
  related_links jsonb,
  back_link     jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists article_pages_slug_idx on article_pages (slug);
create index if not exists article_pages_status_idx on article_pages (status);


-- ─── creator_articles (CreatorArticleDB — profiles) ──────────────────────────
create table if not exists creator_articles (
  id                       uuid        primary key default gen_random_uuid(),
  slug                     text        unique not null,
  url                      text        not null,
  title                    text        not null,
  subtitle                 text,
  status                   article_status not null default 'draft',
  content_html             text        not null,
  publish_date             text        not null,
  published_at             timestamptz not null,
  author_name              text        not null,
  author_slug              text        not null,
  read_time                text,
  thumbnail_src            text,
  thumbnail_alt            text,
  tags                     text[]      not null default '{}',
  creator_name             text,
  platform_primary         text,
  follower_count_primary   text,
  infobox                  jsonb,       -- CreatorInfoboxRow[]
  stats                    jsonb,       -- CreatorStat[]
  cta_buttons              jsonb,       -- {label, href, icon?}[]
  -- Extended JSONB columns used by CreatorArticleDB component
  hero_badges              jsonb,
  hero_cta_buttons         jsonb,
  sidebar_infobox_rows     jsonb,
  sidebar_callout          jsonb,
  sidebar_timeline         jsonb,
  sidebar_related_links    jsonb,
  sidebar_infobox_image_src text,
  schema_article_url       text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists creator_articles_slug_idx   on creator_articles (slug);
create index if not exists creator_articles_status_idx on creator_articles (status);


-- ─── wiki_articles (WikiArticleDB — reference / glossary) ────────────────────
create table if not exists wiki_articles (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        unique not null,
  url           text        not null,
  title         text        not null,
  subtitle      text,
  category      text        not null,
  status        article_status not null default 'draft',
  content_html  text        not null,
  publish_date  text        not null,
  published_at  timestamptz not null,
  author_name   text        not null,
  author_slug   text        not null,
  read_time     text,
  thumbnail_src text,
  thumbnail_alt text,
  tags          text[]      not null default '{}',
  lifecycle     lifecycle_state not null default 'feature',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists wiki_articles_slug_idx on wiki_articles (slug);


-- ─── content_registry (master index — sitemap + JSON-LD) ─────────────────────
create table if not exists content_registry (
  slug             text        primary key,
  title            text        not null,
  description      text        not null,
  publish_date     text        not null,       -- display string
  modified_date    text        not null,
  category         text        not null,
  tags             text[]      not null default '{}',
  author           text        not null,
  author_slug      text,
  priority         numeric(3,1) not null default 0.7,
  change_frequency text        not null default 'daily',
  image_url        text,
  image_alt        text,
  image_width      integer,
  image_height     integer,
  article_type     text,       -- 'NewsArticle' | 'JackArticle' | 'ArticlePage' | 'CreatorArticle' | 'WikiArticle'
  lifecycle        lifecycle_state not null default 'news',
  breaking         boolean     not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists content_registry_category_idx  on content_registry (category);
create index if not exists content_registry_lifecycle_idx on content_registry (lifecycle);
create index if not exists content_registry_breaking_idx  on content_registry (breaking) where breaking = true;


-- ============================================================================
-- ENGAGEMENT TABLES (browser-client writes, never in Git)
-- ============================================================================

-- ─── reactions ────────────────────────────────────────────────────────────────
create table if not exists reactions (
  id           uuid          primary key default gen_random_uuid(),
  article_slug text          not null,
  reaction     reaction_type not null,
  fingerprint  text,         -- hashed IP+UA for soft dedup (no auth required)
  created_at   timestamptz   not null default now()
);

create index if not exists reactions_slug_idx on reactions (article_slug);
-- Count query: SELECT reaction, count(*) FROM reactions WHERE article_slug = $1 GROUP BY reaction


-- ─── saves ────────────────────────────────────────────────────────────────────
create table if not exists saves (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  article_slug text        not null,
  article_type text        not null default 'NewsArticle',
  created_at   timestamptz not null default now(),
  unique (user_id, article_slug)
);

create index if not exists saves_user_idx on saves (user_id);
create index if not exists saves_slug_idx on saves (article_slug);


-- ============================================================================
-- GEO / SEO TABLES (maximize AI citation + lifecycle management)
-- ============================================================================

-- ─── topic_clusters ───────────────────────────────────────────────────────────
-- Groups articles under a topic pillar to signal topical authority to AI systems.
-- Referenced by RelatedArticles sidebar and llms.txt generation.
create table if not exists topic_clusters (
  id          uuid  primary key default gen_random_uuid(),
  slug        text  unique not null,   -- e.g. "ai-agents", "cloudflare-pages"
  label       text  not null,          -- display: "AI Agents"
  description text,                    -- 1-2 sentences for llms.txt
  category    text  not null,
  pillar_url  text,                    -- canonical pillar page URL
  created_at  timestamptz not null default now()
);

-- junction: many articles → many clusters
create table if not exists article_cluster_map (
  article_slug  text not null,
  cluster_slug  text not null references topic_clusters (slug) on delete cascade,
  primary key (article_slug, cluster_slug)
);

create index if not exists cluster_map_article_idx on article_cluster_map (article_slug);
create index if not exists cluster_map_cluster_idx on article_cluster_map (cluster_slug);


-- ─── search_performance ───────────────────────────────────────────────────────
-- Stores Google Search Console data for lifecycle-manager auto-promotion.
-- Populated by: npm run lifecycle:promote (GSC API pull)
create table if not exists search_performance (
  id            uuid        primary key default gen_random_uuid(),
  article_slug  text        not null,
  query         text        not null,     -- the GSC search query
  clicks        integer     not null default 0,
  impressions   integer     not null default 0,
  position      numeric(6,2),             -- avg ranking position
  ctr           numeric(6,4),             -- click-through rate
  date          date        not null,
  created_at    timestamptz not null default now(),
  unique (article_slug, query, date)
);

create index if not exists search_perf_slug_idx  on search_performance (article_slug);
create index if not exists search_perf_date_idx  on search_performance (date desc);
-- Lifecycle promotion query: SELECT article_slug, sum(clicks), min(position)
-- FROM search_performance WHERE date >= now() - interval '7 days'
-- GROUP BY article_slug HAVING sum(clicks) >= 5 OR min(position) <= 30


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Articles: anyone can read published, only service_role can write
alter table articles       enable row level security;
alter table jack_articles  enable row level security;
alter table article_pages  enable row level security;
alter table creator_articles enable row level security;
alter table wiki_articles  enable row level security;
alter table content_registry enable row level security;
alter table reactions      enable row level security;
alter table saves          enable row level security;
alter table topic_clusters enable row level security;
alter table article_cluster_map enable row level security;
alter table search_performance  enable row level security;

-- Public read policies
create policy "anon read published articles"
  on articles for select using (status = 'published');

create policy "anon read published jack_articles"
  on jack_articles for select using (status = 'published');

create policy "anon read published article_pages"
  on article_pages for select using (status = 'published');

create policy "anon read published creator_articles"
  on creator_articles for select using (status = 'published');

create policy "anon read published wiki_articles"
  on wiki_articles for select using (status = 'published');

create policy "anon read content_registry"
  on content_registry for select using (true);

create policy "anon read topic_clusters"
  on topic_clusters for select using (true);

create policy "anon read article_cluster_map"
  on article_cluster_map for select using (true);

-- Reactions: anyone can insert + read (fingerprint dedup in app layer)
create policy "anon read reactions"
  on reactions for select using (true);

create policy "anon insert reactions"
  on reactions for insert with check (true);

-- Saves: auth users only (own rows)
create policy "auth read own saves"
  on saves for select using (auth.uid() = user_id);

create policy "auth insert own saves"
  on saves for insert with check (auth.uid() = user_id);

create policy "auth delete own saves"
  on saves for delete using (auth.uid() = user_id);

-- Search performance: service_role write, anon read denied
create policy "anon deny search_performance"
  on search_performance for select using (false);


-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger articles_updated_at
  before update on articles
  for each row execute function set_updated_at();

create or replace trigger jack_articles_updated_at
  before update on jack_articles
  for each row execute function set_updated_at();

create or replace trigger article_pages_updated_at
  before update on article_pages
  for each row execute function set_updated_at();

create or replace trigger creator_articles_updated_at
  before update on creator_articles
  for each row execute function set_updated_at();

create or replace trigger wiki_articles_updated_at
  before update on wiki_articles
  for each row execute function set_updated_at();

create or replace trigger content_registry_updated_at
  before update on content_registry
  for each row execute function set_updated_at();


-- ============================================================================
-- STORAGE — Media bucket (thumbnails, OG images, author avatars)
-- Run AFTER the schema above. Supabase Storage must be enabled on the project.
-- ============================================================================

-- Create the public media bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,  -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Public read: anyone can access published media (needed for OG images + Google crawlers)
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Upload: service_role only (server-side publish scripts, never the browser)
create policy "media service upload"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'service_role');

-- Replace / update: service_role only
create policy "media service update"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'service_role');

-- Delete: service_role only
create policy "media service delete"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'service_role');

-- Naming convention for uploaded assets:
--   thumbnails/{slug}.webp            ← article hero / OG image (1200x675)
--   thumbnails/{slug}-thumb.webp      ← card thumbnail (400x225)
--   authors/{author-slug}.webp        ← author avatar (200x200)
--   logos/{brand-slug}.webp           ← per-brand logo
-- Access URL: {SUPABASE_URL}/storage/v1/object/public/media/{path}
