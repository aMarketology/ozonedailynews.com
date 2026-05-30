// app/api/cms/publish/route.ts
// THE GIT BRIDGE — turns a Supabase draft into a Git commit.
//
// Flow:
//   1. Verify caller is an authenticated editor
//   2. Fetch full draft article from Supabase (service role bypasses RLS)
//   3. Run E-E-A-T gate (same rules as alfasa-sentinel.ts)
//   4. Format to ArticleFull static JSON (the content/static/articles/ format)
//   5. Upsert registry entry in-process (busts in-memory cache immediately)
//   6. Commit 2 files atomically to GitHub: article JSON + updated registry
//      NOTE: page.tsx stubs are NOT generated — app/[...slug]/page.tsx handles
//      all article routing dynamically. Generating stubs would bloat the file
//      tree and slow Railway builds as the site scales.
//   7. If Git commit fails → delete uploaded media from Supabase Storage (rollback)
//   8. Update Supabase row status → 'published'
//   9. Return the live URL
//
// Required env vars:
//   GITHUB_TOKEN          — Fine-grained PAT with contents:write on this repo ONLY
//   GITHUB_OWNER          — e.g. "aMarketology"
//   GITHUB_REPO           — e.g. "ozonedailynews.com"
//   GITHUB_DEFAULT_BRANCH — fallback branch if brand_slug has no mapping (usually "master")
//
// Brand → Branch mapping (extend as you launch new sites):
//   ozone     → master
//   basil     → basil
//   obsidian  → obsidian
//   honey     → honey
//   onyx      → onyx
//   clover    → clover
//   content   → content
//   objective → objective

import { NextRequest, NextResponse } from 'next/server';
import { createSSRClient } from '@/lib/supabase/ssr';
import { createServiceClient } from '@/lib/supabase/server';
import { upsertRegistryEntry } from '@/lib/registry-service';
import type { ArticleFull } from '@/lib/types';
import type { ContentEntry } from '@/lib/types';

// ─── Brand → Git branch map ───────────────────────────────────────────────────

const BRAND_BRANCH: Record<string, string> = {
  ozone:     'master',
  basil:     'basil',
  obsidian:  'obsidian',
  honey:     'honey',
  onyx:      'onyx',
  clover:    'clover',
  content:   'content',
  objective: 'objective',
};

// ─── E-E-A-T gate (mirrors alfasa-sentinel.ts) ───────────────────────────────

const AI_BOILERPLATE = [
  'in conclusion',
  'it is important to note',
  'it is important to remember',
  'furthermore, it is crucial',
  "in today's fast-paced world",
  'in the ever-evolving landscape',
  'it is worth noting that',
  'moreover, it should be noted',
  'navigating the complex',
  'delve into',
  'in summary',
];

const KNOWN_AUTHORS = [
  'max-deleonardis',
  'simon-minter',
  'ozonedailynews-editorial-team',
];

function runEeatGate(article: ArticleFull): string[] {
  const errors: string[] = [];
  const text = article.content_html ?? '';
  const lower = text.toLowerCase();

  // H1 — author
  if (!article.author_name || !article.author_slug) {
    errors.push('Missing author_name or author_slug.');
  }
  if (!KNOWN_AUTHORS.includes(article.author_slug ?? '')) {
    errors.push(`author_slug "${article.author_slug}" is not in KNOWN_AUTHORS. Add them first.`);
  }

  // H2 — ISO timestamp with timezone
  const isoWithTz = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/;
  if (!isoWithTz.test(article.published_at ?? '')) {
    errors.push('published_at must be ISO-8601 with timezone offset (e.g. 2026-05-26T14:00:00-05:00). Date-only values are banned.');
  }

  // H3 — word count ≥ 300
  const words = text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length < 300) {
    errors.push(`content_html has only ${words.length} words. Minimum is 300.`);
  }

  // H4 — no em/en dashes
  if (/[—–]/.test(article.title ?? '') || /[—–]/.test(text)) {
    errors.push('Em dash (—) or en dash (–) found. Replace with | or a comma.');
  }

  // H5 — metadata.description 130-155 chars
  const desc = article.metadata?.description ?? '';
  if (desc.length < 130 || desc.length > 155) {
    errors.push(`metadata.description is ${desc.length} chars. Must be 130-155.`);
  }

  // H6 — canonical URL
  const canonical = article.metadata?.alternates?.canonical ?? '';
  if (!canonical.startsWith('https://')) {
    errors.push('metadata.alternates.canonical is missing or not a full HTTPS URL.');
  }

  // H7 — at least one <h2>
  if (!/<h2[\s>]/i.test(text)) {
    errors.push('content_html has no <h2> tag. At least one is required.');
  }

  // H8 — no AI boilerplate
  for (const phrase of AI_BOILERPLATE) {
    if (lower.includes(phrase)) {
      errors.push(`Banned AI phrase detected: "${phrase}"`);
    }
  }

  return errors;
}

// ─── GitHub Git Trees API (atomic multi-file commit) ─────────────────────────

interface GitRef    { object: { sha: string } }
interface GitCommit { tree: { sha: string } }
interface GitTree   { sha: string }
interface GitNewCommit { sha: string }

async function ghFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    throw new Error(err.message ?? `GitHub API ${res.status} at ${path}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Commits multiple files atomically using the Git Data API.
 * All files land in a single commit — no intermediate states.
 *
 * Concurrency safety: the final ref PATCH uses `force: false` (default), so
 * GitHub rejects it with 422 if another commit landed between our read and
 * write. We retry up to MAX_RETRIES times, re-fetching the latest ref each
 * time, so two simultaneous publishes resolve cleanly without data loss.
 */
async function commitFilesAtomically(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  files: Array<{ path: string; content: string }>,
  message: string,
  maxRetries = 3
): Promise<{ ok: boolean; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Get the CURRENT branch tip (re-fetch on every retry to get latest SHA)
      const ref = await ghFetch<GitRef>(
        `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
        token
      );
      const latestCommitSha = ref.object.sha;

      // 2. Get the base tree SHA of the latest commit
      const commit = await ghFetch<GitCommit>(
        `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
        token
      );
      const baseTreeSha = commit.tree.sha;

      // 3. Create a new tree containing all files
      const treeItems = files.map((f) => ({
        path: f.path,
        mode: '100644',
        type: 'blob',
        content: f.content, // GitHub accepts raw UTF-8 here
      }));

      const newTree = await ghFetch<GitTree>(
        `/repos/${owner}/${repo}/git/trees`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
        }
      );

      // 4. Create the commit object
      const newCommit = await ghFetch<GitNewCommit>(
        `/repos/${owner}/${repo}/git/commits`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            message,
            tree: newTree.sha,
            parents: [latestCommitSha],
          }),
        }
      );

      // 5. Advance the branch ref — will fail with 422 if another commit
      //    landed since step 1 (concurrency collision). We catch and retry.
      await ghFetch(
        `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
        token,
        {
          method: 'PATCH',
          body: JSON.stringify({ sha: newCommit.sha, force: false }),
        }
      );

      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isConflict = msg.includes('Update is not a fast forward') || msg.includes('422');

      if (isConflict && attempt < maxRetries) {
        // Exponential backoff: 200ms, 400ms, 800ms
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt - 1)));
        continue;
      }

      return { ok: false, error: msg };
    }
  }
  return { ok: false, error: 'Max retries exceeded (concurrent publish collision)' };
}

// ─── POST /api/cms/publish ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth — must be an editor
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

  // 2. Parse request
  let body: { slug: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  // 3. Fetch article from Supabase (service role — reads drafts past RLS)
  const { data: article, error: fetchErr } = await service
    .from('articles')
    .select('*')
    .eq('slug', body.slug)
    .single();

  if (fetchErr || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  if (article.status === 'published') {
    // Allow re-publishing — this will overwrite the existing static JSON on GitHub.
    // Intentional: editors can update live articles through the CMS.
  }

  // Check brand access
  const brandSlug = article.brand_slug ?? 'ozone';
  if (
    profile.brand_slugs?.length > 0 &&
    !profile.brand_slugs.includes(brandSlug)
  ) {
    return NextResponse.json({ error: 'Forbidden: not your brand' }, { status: 403 });
  }

  // 4. E-E-A-T gate
  const eeatErrors = runEeatGate(article as ArticleFull);
  if (eeatErrors.length > 0) {
    return NextResponse.json(
      { error: 'E-E-A-T gate failed. Fix the following before publishing:', details: eeatErrors },
      { status: 422 }
    );
  }

  // 5. Verify GitHub env vars
  const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER  = process.env.GITHUB_OWNER;
  const GITHUB_REPO   = process.env.GITHUB_REPO;
  const defaultBranch = process.env.GITHUB_DEFAULT_BRANCH ?? 'master';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json(
      { error: 'GitHub env vars not configured (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO).' },
      { status: 503 }
    );
  }

  // 6. Determine target branch
  const branch = BRAND_BRANCH[brandSlug] ?? defaultBranch;

  // 7. Format article to static JSON (strip DB-only fields)
  const { id: _id, brand_slug: _brand, ...staticArticle } = article;
  const finalArticle = {
    ...staticArticle,
    status: 'published' as const,
    lifecycle: staticArticle.lifecycle ?? 'news',
  };

  const jsonContent = JSON.stringify(finalArticle, null, 2);
  const jsonFilePath = `content/static/articles/${article.slug}.json`;

  // 8. Build registry entry and upsert locally (busts in-process cache immediately)
  //    app/[...slug]/page.tsx handles all routing — NO page.tsx stubs are generated.
  //    Generating stubs would bloat the file tree and slow builds at scale.
  const canonical = article.metadata?.alternates?.canonical ?? '';
  let routePath: string;
  try {
    routePath = new URL(canonical).pathname.replace(/^\//, '').replace(/\/$/, '');
  } catch {
    routePath = article.slug ?? '';
  }

  const registryEntry: ContentEntry = {
    slug:            `/${routePath}`,
    title:           finalArticle.title ?? '',
    description:     finalArticle.metadata?.description ?? '',
    publishDate:     finalArticle.published_at ?? new Date().toISOString(),
    modifiedDate:    finalArticle.published_at ?? new Date().toISOString(),
    category:        finalArticle.category ?? 'News',
    tags:            finalArticle.tags ?? [],
    author:          finalArticle.author_name ?? '',
    authorSlug:      finalArticle.author_slug ?? undefined,
    priority:        0.8,
    changeFrequency: 'daily',
    imageUrl:        finalArticle.thumbnail_src ?? undefined,
    imageAlt:        finalArticle.thumbnail_alt ?? undefined,
    articleType:     'NewsArticle',
    lifecycle:       finalArticle.lifecycle ?? 'news',
    breaking:        finalArticle.breaking ?? false,
  };

  upsertRegistryEntry(registryEntry);

  // Read the freshly-written registry to include in the atomic commit
  const { default: fs } = await import('fs');
  const { default: nodePath } = await import('path');
  const registryPath = nodePath.join(process.cwd(), 'content', 'static', 'content_registry.json');
  const registryContent = fs.readFileSync(registryPath, 'utf8');

  const filesToCommit: Array<{ path: string; content: string }> = [
    { path: jsonFilePath,                               content: jsonContent },
    { path: 'content/static/content_registry.json',    content: registryContent },
  ];

  // 9. Commit all files atomically (retries up to 3x on concurrency collision)
  const commitMessage = `publish: ${article.title}`;
  const commitResult = await commitFilesAtomically(
    GITHUB_OWNER,
    GITHUB_REPO,
    branch,
    GITHUB_TOKEN,
    filesToCommit,
    commitMessage
  );

  // 9b. If Git commit failed AND the article has a Supabase Storage thumbnail,
  //     delete it to prevent orphaned media accumulation in the bucket.
  if (!commitResult.ok && finalArticle.thumbnail_src) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const storageCdnBase = `${supabaseUrl}/storage/v1/object/public/media/`;
      if (finalArticle.thumbnail_src.startsWith(storageCdnBase)) {
        const storagePath = finalArticle.thumbnail_src.replace(storageCdnBase, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
        await fetch(`${supabaseUrl}/storage/v1/object/media/${storagePath}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
        });
      }
    } catch {
      // Rollback is best-effort — log but don't mask the real commit error
    }
    return NextResponse.json(
      { error: `GitHub commit failed: ${commitResult.error}. Uploaded media was rolled back.` },
      { status: 502 }
    );
  }

  if (!commitResult.ok) {
    return NextResponse.json(
      { error: `GitHub commit failed: ${commitResult.error}` },
      { status: 502 }
    );
  }

  // 10. Update Supabase status → published
  await service
    .from('articles')
    .update({ status: 'published', published_at: article.published_at ?? new Date().toISOString() })
    .eq('slug', article.slug);

  // 11. Build the live URL for the response
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ozonedailynews.com';
  const articleUrl = article.url ?? `${siteUrl}/${article.slug}`;

  return NextResponse.json({
    ok: true,
    slug: article.slug,
    branch,
    url: articleUrl,
    filesCommitted: filesToCommit.map((f) => f.path),
    message: `Committed ${filesToCommit.length} file(s) to ${branch}. Railway will auto-deploy in ~1-2 minutes.`,
  });
}
