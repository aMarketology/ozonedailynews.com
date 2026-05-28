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

// ─── GitHub Contents API ──────────────────────────────────────────────────────

interface GitHubFileResponse {
  sha?: string;
  message?: string;
}

async function getFileSha(
  owner: string,
  repo: string,
  filePath: string,
  branch: string,
  token: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status === 404) return null;
  const json = (await res.json()) as GitHubFileResponse;
  return json.sha ?? null;
}

async function commitFileToGitHub(
  owner: string,
  repo: string,
  filePath: string,
  content: string,   // base64-encoded file content
  message: string,
  branch: string,
  token: string,
  existingSha: string | null
): Promise<{ ok: boolean; error?: string }> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const body: Record<string, unknown> = { message, content, branch };
  if (existingSha) body.sha = existingSha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });

  if (res.ok) return { ok: true };
  const errJson = (await res.json()) as { message?: string };
  return { ok: false, error: errJson.message ?? `GitHub API ${res.status}` };
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
  const base64Content = Buffer.from(jsonContent).toString('base64');
  const filePath = `content/static/articles/${article.slug}.json`;

  // 8. Check if file already exists in GitHub (need SHA to update)
  const existingSha = await getFileSha(GITHUB_OWNER, GITHUB_REPO, filePath, branch, GITHUB_TOKEN);

  // 9. Commit to GitHub
  const commitMessage = `publish: ${article.title}`;
  const commitResult = await commitFileToGitHub(
    GITHUB_OWNER,
    GITHUB_REPO,
    filePath,
    base64Content,
    commitMessage,
    branch,
    GITHUB_TOKEN,
    existingSha
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
    message: `Committed to ${branch}. Railway will auto-deploy in ~1-2 minutes.`,
  });
}
