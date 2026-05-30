// lib/routing-service.ts
// Decoupled URL routing layer.
//
// The core principle: a Git file path (content/articles/[id].json) is
// PERMANENT and IMMUTABLE. A public URL (/tech/meta/my-article) is just
// a pointer stored in Supabase's routing_table. Authors can update the
// pointer at any time without renaming or moving any Git files.
//
// Tables (see supabase/routing-migration.sql):
//   routing_table — url_path (PK) → content_id, content_store
//   redirects     — old_path (PK) → new_path, status_code
//
// Server-side only. Not Edge-compatible — use plain fetch in middleware.ts
// for the redirect lookup.

import { createServiceClient } from './supabase/server';

export interface RouteEntry {
  url_path:      string;
  content_id:    string;
  content_store: string; // 'articles' | 'jack_articles' | etc.
  brand_slug:    string;
}

export interface RedirectEntry {
  old_path:    string;
  new_path:    string;
  status_code: number;
}

// ─── Resolve URL path → content_id ───────────────────────────────────────────

/**
 * Given a public URL path (e.g. "/tech/meta/my-article"), returns the
 * routing_table row that identifies which Git file to serve.
 * Returns null if the path is not in the routing table (legacy slug fallback).
 */
export async function resolveUrlPath(urlPath: string): Promise<RouteEntry | null> {
  const service = createServiceClient();
  if (!service) return null;

  // Normalize: always lead with /, never trail with /
  const normalized = '/' + urlPath.replace(/^\/+|\/+$/g, '');

  const { data, error } = await service
    .from('routing_table')
    .select('url_path, content_id, content_store, brand_slug')
    .eq('url_path', normalized)
    .single();

  if (error || !data) return null;
  return data as RouteEntry;
}

/**
 * Given a content_id, returns all URL paths that point to it.
 * Used by the admin panel to show all active routes for a given article.
 */
export async function getRoutesForContent(contentId: string): Promise<RouteEntry[]> {
  const service = createServiceClient();
  if (!service) return [];
  const { data } = await service
    .from('routing_table')
    .select('url_path, content_id, content_store, brand_slug')
    .eq('content_id', contentId);
  return (data ?? []) as RouteEntry[];
}

// ─── Upsert a route mapping ───────────────────────────────────────────────────

/**
 * Maps a public URL path to a content_id. Safe to call on re-publish.
 * If the url_path already maps to a DIFFERENT content_id, this overwrites it
 * (the old mapping is lost, but the old content_id file still exists in Git).
 */
export async function upsertRoute(
  urlPath:      string,
  contentId:    string,
  contentStore: string = 'articles',
  brandSlug:    string = 'ozone'
): Promise<void> {
  const service = createServiceClient();
  if (!service) return;

  const normalized = '/' + urlPath.replace(/^\/+|\/+$/g, '');

  await service
    .from('routing_table')
    .upsert(
      { url_path: normalized, content_id: contentId, content_store: contentStore, brand_slug: brandSlug },
      { onConflict: 'url_path' }
    );
}

// ─── Redirect operations ──────────────────────────────────────────────────────

/**
 * Creates a permanent (301) redirect rule.
 * Called automatically by rerouteArticle() when a URL is changed.
 */
export async function createRedirect(
  oldPath:    string,
  newPath:    string,
  statusCode: number = 301
): Promise<void> {
  const service = createServiceClient();
  if (!service) return;

  // Don't create a self-redirect
  const normalOld = '/' + oldPath.replace(/^\/+|\/+$/g, '');
  const normalNew = '/' + newPath.replace(/^\/+|\/+$/g, '');
  if (normalOld === normalNew) return;

  await service
    .from('redirects')
    .upsert(
      { old_path: normalOld, new_path: normalNew, status_code: statusCode },
      { onConflict: 'old_path' }
    );
}

/**
 * Looks up a redirect rule for a given path.
 * Used server-side; for middleware use the plain REST fetch in middleware.ts.
 */
export async function lookupRedirect(urlPath: string): Promise<RedirectEntry | null> {
  const service = createServiceClient();
  if (!service) return null;

  const normalized = '/' + urlPath.replace(/^\/+|\/+$/g, '');

  const { data } = await service
    .from('redirects')
    .select('old_path, new_path, status_code')
    .eq('old_path', normalized)
    .single();

  return (data as RedirectEntry | null) ?? null;
}

// ─── Reroute an article (change its public URL) ───────────────────────────────

/**
 * Changes the public URL of a live article without moving any Git files.
 *
 * Steps:
 *   1. Look up current route for the content_id
 *   2. If it exists and differs, create a 301 redirect from old → new path
 *   3. Remove the old routing_table row (old_path is now a redirect, not a route)
 *   4. Upsert new routing_table row (new_path → content_id)
 *
 * The Git file at content/articles/[content_id].json is NEVER touched.
 * Google follows the 301 and transfers ranking signals to the new URL within days.
 */
export async function rerouteArticle(
  contentId:    string,
  newUrlPath:   string,
  contentStore: string = 'articles',
  brandSlug:    string = 'ozone'
): Promise<{ previousPath: string | null; newPath: string }> {
  const service = createServiceClient();
  if (!service) throw new Error('DB not configured');

  const normalNew = '/' + newUrlPath.replace(/^\/+|\/+$/g, '');

  // 1. Find existing routes for this content_id
  const existing = await getRoutesForContent(contentId);
  const primary = existing[0] ?? null;

  // 2. If the content already has a URL and it's different, create 301 redirect
  if (primary && primary.url_path !== normalNew) {
    await createRedirect(primary.url_path, normalNew, 301);

    // Remove old routing_table row — requests for old_path now hit the redirects table
    await service
      .from('routing_table')
      .delete()
      .eq('url_path', primary.url_path)
      .eq('content_id', contentId);
  }

  // 3. Upsert the new path
  await upsertRoute(normalNew, contentId, contentStore, brandSlug);

  return { previousPath: primary?.url_path ?? null, newPath: normalNew };
}
