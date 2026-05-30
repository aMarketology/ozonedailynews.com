// app/api/cms/reroute/route.ts
// Changes the public URL of a live article without touching any Git files.
//
// This is the "URL freedom" endpoint. Call it whenever an author wants to:
//   - Fix a typo in a slug after publish  ("grpah" → "graph")
//   - Restructure categories              (/tech/ai/... → /ai/...)
//   - A/B test different URL structures for SEO
//
// What happens under the hood:
//   1. Auth + editor guard
//   2. Look up the article's current route in routing_table
//   3. If current URL != new URL:
//      a. Write a 301 redirect (old → new) into the `redirects` table
//      b. Next.js Middleware picks it up in <2ms — Google follows the 301 instantly
//      c. Remove the old routing_table row
//   4. Upsert the new URL path into routing_table (content_id unchanged)
//   5. Update content_registry.slug to the new path so sitemaps stay current
//   6. Bust ISR cache on both old and new paths
//   7. Return { previousPath, newPath }
//
// The Git file at content/articles/[content_id].json is NEVER touched.
// Git history stays clean. Ranking signals transfer via the 301.

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSSRClient } from '@/lib/supabase/ssr';
import { createServiceClient } from '@/lib/supabase/server';
import { rerouteArticle } from '@/lib/routing-service';

export async function POST(req: NextRequest) {
  // 1. Auth — editor only
  const ssr = await createSSRClient();
  if (!ssr) return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });

  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createServiceClient();
  if (!service) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

  const { data: profile } = await service
    .from('profiles')
    .select('is_editor, brand_slugs')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_editor) {
    return NextResponse.json({ error: 'Forbidden: editor access required' }, { status: 403 });
  }

  // 2. Parse body
  let body: { content_id?: string; slug?: string; new_url_path: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.new_url_path) {
    return NextResponse.json({ error: 'new_url_path is required' }, { status: 400 });
  }
  if (!body.content_id && !body.slug) {
    return NextResponse.json({ error: 'content_id or slug is required' }, { status: 400 });
  }

  // 3. Resolve the article to get its content_id and brand
  let contentId: string;
  let brandSlug = 'ozone';

  if (body.content_id) {
    contentId = body.content_id;

    // Verify the article exists and get brand_slug for permission check
    const { data: article } = await service
      .from('articles')
      .select('id, brand_slug')
      .eq('id', contentId)
      .single();

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    brandSlug = article.brand_slug ?? 'ozone';
  } else {
    // Resolve from slug
    const { data: article } = await service
      .from('articles')
      .select('id, brand_slug')
      .eq('slug', body.slug!)
      .single();

    if (!article) {
      return NextResponse.json({ error: 'Article not found for slug: ' + body.slug }, { status: 404 });
    }
    contentId = article.id;
    brandSlug = article.brand_slug ?? 'ozone';
  }

  // 4. Brand access check
  if (
    profile.brand_slugs?.length > 0 &&
    !profile.brand_slugs.includes(brandSlug)
  ) {
    return NextResponse.json({ error: 'Forbidden: not your brand' }, { status: 403 });
  }

  // 5. Validate new_url_path format (lowercase, hyphens, slashes only)
  const newPath = body.new_url_path.startsWith('/')
    ? body.new_url_path
    : '/' + body.new_url_path;

  if (!/^\/[a-z0-9\-\/]+$/.test(newPath)) {
    return NextResponse.json(
      { error: 'new_url_path must be lowercase with hyphens and slashes only (e.g. /tech/meta/my-article)' },
      { status: 400 }
    );
  }

  // 6. Check the target path isn't already claimed by a different article
  const { data: existingRoute } = await service
    .from('routing_table')
    .select('content_id')
    .eq('url_path', newPath)
    .single();

  if (existingRoute && existingRoute.content_id !== contentId) {
    return NextResponse.json(
      { error: `URL path ${newPath} is already claimed by a different article (content_id: ${existingRoute.content_id})` },
      { status: 409 }
    );
  }

  // 7. Execute the reroute (creates redirect, updates routing_table)
  let result: { previousPath: string | null; newPath: string };
  try {
    result = await rerouteArticle(contentId, newPath, 'articles', brandSlug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Reroute failed: ${msg}` }, { status: 500 });
  }

  // 8. Update content_registry.slug so sitemaps stay current
  if (result.previousPath) {
    await service
      .from('content_registry')
      .update({ slug: newPath })
      .eq('slug', result.previousPath);
  }

  // 9. Bust ISR caches on both old and new paths
  try {
    if (result.previousPath) revalidatePath(result.previousPath);
    revalidatePath(newPath);
    revalidatePath('/'); // sitemap + homepage may reference either path
  } catch {
    // Safe to swallow — revalidatePath requires Next.js server context
  }

  return NextResponse.json({
    ok: true,
    content_id: contentId,
    previousPath: result.previousPath,
    newPath: result.newPath,
    redirectCreated: result.previousPath !== null && result.previousPath !== result.newPath,
    message: result.previousPath
      ? `URL changed. 301 redirect created: ${result.previousPath} → ${result.newPath}. Google will transfer ranking signals within days.`
      : `URL set to ${result.newPath}. No previous path to redirect.`,
  });
}
