-- ============================================================
-- NodeLX CMS — Decoupled Routing Layer
-- Run this migration once against your Supabase project.
-- ============================================================

-- ─── routing_table ───────────────────────────────────────────
-- Maps every public URL path to an immutable content_id.
-- The content_id is the filename in content/articles/[id].json.
-- Authors can change the url_path at any time; the Git file never moves.

CREATE TABLE IF NOT EXISTS public.routing_table (
  url_path       TEXT        PRIMARY KEY,            -- e.g. /tech/meta/wearables-for-work-2026
  content_id     TEXT        NOT NULL,               -- e.g. 550e8400-e29b-41d4-a716-446655440000
  content_store  TEXT        NOT NULL DEFAULT 'articles', -- maps to content/[store]/[id].json
  brand_slug     TEXT        NOT NULL DEFAULT 'ozone',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups from middleware + catch-all route
CREATE INDEX IF NOT EXISTS routing_table_content_id_idx ON public.routing_table (content_id);
CREATE INDEX IF NOT EXISTS routing_table_brand_idx      ON public.routing_table (brand_slug);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.set_routing_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS routing_table_updated_at ON public.routing_table;
CREATE TRIGGER routing_table_updated_at
  BEFORE UPDATE ON public.routing_table
  FOR EACH ROW EXECUTE FUNCTION public.set_routing_updated_at();

-- RLS: public reads, authenticated writes only
ALTER TABLE public.routing_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routing_table_public_read"
  ON public.routing_table FOR SELECT
  USING (true);

CREATE POLICY "routing_table_service_write"
  ON public.routing_table FOR ALL
  USING (auth.role() = 'service_role');

-- ─── redirects ────────────────────────────────────────────────
-- 301/302 redirect rules. Next.js Middleware reads this table
-- in <2ms to issue redirects before any route handler fires.
-- When an author changes a URL, the old path is written here automatically.

CREATE TABLE IF NOT EXISTS public.redirects (
  old_path     TEXT        PRIMARY KEY,             -- e.g. /tech/meta/old-slug
  new_path     TEXT        NOT NULL,                -- e.g. /tech/meta/new-slug
  status_code  INT         NOT NULL DEFAULT 301,    -- 301 = permanent, 302 = temporary
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for the middleware lookup (reads by old_path)
CREATE INDEX IF NOT EXISTS redirects_new_path_idx ON public.redirects (new_path);

-- RLS: public reads (middleware uses anon key), service role writes
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redirects_public_read"
  ON public.redirects FOR SELECT
  USING (true);

CREATE POLICY "redirects_service_write"
  ON public.redirects FOR ALL
  USING (auth.role() = 'service_role');
