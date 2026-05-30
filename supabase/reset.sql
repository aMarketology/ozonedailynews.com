-- ============================================================================
-- OzoneNews | Supabase RESET — run ONCE before a fresh schema.sql
--
-- Drops all CMS tables (new + legacy). Does NOT touch auth.users or storage files.
-- Run in Supabase → SQL Editor → Run, then run schema.sql.
-- ============================================================================

-- New schema (5-table model)
drop table if exists public.articles      cascade;
drop table if exists public.profiles      cascade;
drop table if exists public.routing_table cascade;
drop table if exists public.redirects     cascade;

-- Legacy tables from older multi-table schema
drop table if exists public.jack_articles    cascade;
drop table if exists public.wiki_articles    cascade;
drop table if exists public.article_pages    cascade;
drop table if exists public.creator_articles cascade;
drop table if exists public.content_registry cascade;
drop table if exists public.news_articles    cascade;

-- Legacy enums (ignore errors if already gone)
drop type if exists public.lifecycle_state cascade;
drop type if exists public.article_status  cascade;
