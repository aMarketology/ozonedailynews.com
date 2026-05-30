// proxy.ts — Edge proxy (Next.js 16+)
// 1. Supabase redirects table → 301/302 before any route handler
// 2. @supabase/ssr session refresh — keeps auth cookies valid

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap|rss.xml|news-sitemap|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

async function applyRedirect(req: NextRequest): Promise<NextResponse | null> {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) return null;

  const { pathname } = req.nextUrl;
  if (pathname === '/') return null;

  try {
    const encoded = encodeURIComponent(pathname);
    const apiUrl  = `${supabaseUrl}/rest/v1/redirects?old_path=eq.${encoded}&select=new_path,status_code&limit=1`;

    const res = await fetch(apiUrl, {
      headers: {
        apikey:        supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,
        Accept:        'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const rows = await res.json() as Array<{ new_path: string; status_code: number }>;

      if (rows.length > 0) {
        const { new_path, status_code } = rows[0];
        const destination = new URL(new_path, req.nextUrl.origin);
        req.nextUrl.searchParams.forEach((v, k) => {
          if (!destination.searchParams.has(k)) destination.searchParams.set(k, v);
        });

        return NextResponse.redirect(destination, {
          status: status_code ?? 301,
          headers: {
            'Cache-Control': status_code === 301
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=3600',
          },
        });
      }
    }
  } catch {
    /* fall through */
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const redirect = await applyRedirect(request);
  if (redirect) return redirect;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.next();
  }

  // Wrap the whole session-refresh block so a Supabase error (bad cookie,
  // JWT decode failure, network hiccup) never crashes the Edge proxy and
  // returns a 500 for every page request.
  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    await supabase.auth.getUser();

    return supabaseResponse;
  } catch {
    // Session refresh failed — pass the request through without updating auth cookies.
    return NextResponse.next();
  }
}
