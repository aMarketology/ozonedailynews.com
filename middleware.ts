// middleware.ts
// Edge Middleware — runs before any Next.js route handler.
//
// Responsibility: check Supabase `redirects` table for 301/302 rules.
// If a redirect rule exists for the incoming path, issue the redirect
// immediately without hitting any Next.js page code.
//
// Performance profile:
//   - Supabase REST call via plain fetch (Edge-compatible, no Node.js APIs)
//   - Single indexed PK lookup → ~1-2ms latency
//   - Matcher excludes static assets, _next internals, and API routes so
//     non-article traffic pays zero overhead.
//
// Security:
//   - Uses the public anon key (redirects table has public SELECT RLS policy)
//   - Never writes to the DB — read-only in middleware

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap|rss.xml|news-sitemap|api/).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, pass through — no redirects available
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Ignore root — never redirect /
  if (pathname === '/') return NextResponse.next();

  try {
    // Plain fetch — Edge runtime has no Node.js APIs, can't use Supabase SDK here.
    // The redirects table has a public SELECT RLS policy, so anon key is sufficient.
    const encoded = encodeURIComponent(pathname);
    const apiUrl  = `${supabaseUrl}/rest/v1/redirects?old_path=eq.${encoded}&select=new_path,status_code&limit=1`;

    const res = await fetch(apiUrl, {
      headers: {
        apikey:        supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,
        Accept:        'application/json',
      },
      // Keep the lookup fast — abort after 3 seconds to avoid blocking the request
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const rows = await res.json() as Array<{ new_path: string; status_code: number }>;

      if (rows.length > 0) {
        const { new_path, status_code } = rows[0];

        // Preserve query string and hash on the redirect
        const destination = new URL(new_path, req.nextUrl.origin);
        req.nextUrl.searchParams.forEach((v, k) => {
          if (!destination.searchParams.has(k)) destination.searchParams.set(k, v);
        });

        return NextResponse.redirect(destination, {
          status: status_code ?? 301,
          headers: {
            // Let CDNs and browsers cache permanent redirects for 1 year
            'Cache-Control': status_code === 301
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=3600',
          },
        });
      }
    }
  } catch {
    // Timeout or network error — never break a user request for a redirect lookup.
    // Fall through to normal routing.
  }

  return NextResponse.next();
}
