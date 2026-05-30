// app/api/cms/publish/route.ts
// THE GIT BRIDGE — turns a Supabase draft into a Git commit.
//
// Flow:
//   1. Verify caller is an authenticated editor
//   2. Fetch full draft article from Supabase (service role bypasses RLS)
//   3. Run E-E-A-T gate (same rules as alfasa-sentinel.ts)
//   4. Format to ArticleFull static JSON (the content/static/articles/ format)
//   5. Commit file to GitHub via Contents API (no octokit needed — plain fetch)
//   6. Update Supabase row status → 'published'
//   7. Return the live URL
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
import type { ArticleFull } from '@/lib/types';

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

// ─── page.tsx stub generator ──────────────────────────────────────────────────

/**
 * Generates the app/{routePath}/page.tsx content for an article.
 * routePath is derived from the canonical URL path, e.g. "tech/meta/my-slug"
 */
function generatePageStub(article: ArticleFull, routePath: string): string {
  const fullUrl = article.metadata?.alternates?.canonical
    ?? `https://www.ozonedailynews.com/${routePath}`;

  const tags = (article.tags ?? []).map((t) => `'${t}'`).join(', ');
  const keywords = (article.metadata?.keywords ?? []).map((k) => `    '${k}',`).join('\n');
  const componentName = routePath
    .split('/')
    .map((s) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') + 'Page';

  return `import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

const SLUG = '/${routePath}';
const ARTICLE_URL = \`${fullUrl}\`;

export const metadata: Metadata = {
  title: ${JSON.stringify(article.metadata?.title ?? article.title)},
  description: ${JSON.stringify(article.metadata?.description ?? '')},
  keywords: [
${keywords}
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: ${JSON.stringify(article.metadata?.title ?? article.title)},
    description: ${JSON.stringify(article.subtitle ?? article.metadata?.description ?? '')},
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: [${JSON.stringify(article.author_name ?? '')}],
    publishedTime: ${JSON.stringify(article.published_at ?? '')},
    modifiedTime: ${JSON.stringify(article.published_at ?? '')},
    section: ${JSON.stringify(article.category ?? 'News')},
    tags: [${tags}],
  },
  twitter: {
    card: 'summary_large_image',
    title: ${JSON.stringify(article.title)},
    description: ${JSON.stringify(article.subtitle ?? '')},
  },
};

export default function ${componentName}() {
  return <NewsArticleDB slug=${JSON.stringify(article.slug)} />;
}
`;
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
 */
async function commitFilesAtomically(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  files: Array<{ path: string; content: string }>,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    // 1. Get the current branch tip SHA
    const ref = await ghFetch<GitRef>(
      `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      token
    );
    const latestCommitSha = ref.object.sha;

    // 2. Get the tree SHA of the latest commit
    const commit = await ghFetch<GitCommit>(
      `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
      token
    );
    const baseTreeSha = commit.tree.sha;

    // 3. Create a new tree with all the files (base64 blobs)
    const treeItems = files.map((f) => ({
      path: f.path,
      mode: '100644',
      type: 'blob',
      content: f.content, // GitHub accepts raw UTF-8 string here
    }));

    const newTree = await ghFetch<GitTree>(
      `/repos/${owner}/${repo}/git/trees`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
      }
    );

    // 4. Create the commit
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

    // 5. Update the branch ref to point to the new commit
    await ghFetch(
      `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      token,
      {
        method: 'PATCH',
        body: JSON.stringify({ sha: newCommit.sha }),
      }
    );

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
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

  // 8. Derive the Next.js route path from the canonical URL
  //    e.g. "https://www.ozonedailynews.com/tech/meta/my-article" → "tech/meta/my-article"
  const canonical = article.metadata?.alternates?.canonical ?? '';
  let routePath: string;
  try {
    routePath = new URL(canonical).pathname.replace(/^\//, '').replace(/\/$/, '');
  } catch {
    // Fallback: use slug directly if canonical is malformed
    routePath = article.slug ?? '';
  }

  // Only auto-generate page.tsx if we have a valid multi-segment route path
  // (single-segment slugs go through [...slug] catch-all, so no stub needed)
  const needsPageStub = routePath.includes('/');
  const pageFilePath = needsPageStub
    ? `app/${routePath}/page.tsx`
    : null;

  const filesToCommit: Array<{ path: string; content: string }> = [
    { path: jsonFilePath, content: jsonContent },
  ];

  if (needsPageStub && pageFilePath) {
    const pageContent = generatePageStub(finalArticle as ArticleFull, routePath);
    filesToCommit.push({ path: pageFilePath, content: pageContent });
  }

  // 9. Commit all files atomically in a single Git commit
  const commitMessage = `publish: ${article.title}`;
  const commitResult = await commitFilesAtomically(
    GITHUB_OWNER,
    GITHUB_REPO,
    branch,
    GITHUB_TOKEN,
    filesToCommit,
    commitMessage
  );

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
    message: `Committed ${filesToCommit.length} file(s) to ${branch}. Railway will auto-deploy in ~1-2 minutes.${needsPageStub ? ` page.tsx stub created at app/${routePath}/page.tsx.` : ''}`,
  });
}
