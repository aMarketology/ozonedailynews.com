import Link from "next/link";
import { getAllArticles } from "@/lib/article-service";
import { SITE_CONFIG } from "@/lib/site-config";
import type { Metadata } from "next";

// Revalidate every 60 seconds so new articles appear without a full rebuild
export const revalidate = 60;

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | Objective News Network`,
  description: "Breaking news, analysis and verified reporting from Ozone Network News. Finance, Tech, Politics, World and more.",
  alternates: { canonical: SITE_CONFIG.url },
  openGraph: {
    type: "website",
    title: `${SITE_CONFIG.name} | Objective News Network`,
    description: "Breaking news, analysis and verified reporting from Ozone Network News.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.publisherName,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  News: "bg-red-600",
  Tech: "bg-blue-600",
  Finance: "bg-green-700",
  Entertainment: "bg-purple-600",
  World: "bg-sky-600",
  Politics: "bg-rose-700",
  Science: "bg-teal-600",
  Sports: "bg-indigo-600",
  Culture: "bg-fuchsia-600",
  Crypto: "bg-amber-600",
  Gaming: "bg-violet-600",
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "bg-gray-700";
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white ${color}`}>
      {category}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function HomePage() {
  const articles = await getAllArticles();
  const hero = articles[0] ?? null;
  const secondary = articles.slice(1, 5);
  const remaining = articles.slice(5, 17);

  return (
    <main className="min-h-screen bg-white">
      {/* ── Breaking news ticker ────────────────────────────────────────────── */}
      {hero?.breaking && (
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-white text-red-600 px-2 py-0.5">
              Breaking
            </span>
            <Link
              href={hero.url ? new URL(hero.url).pathname : `/${hero.slug}`}
              className="text-xs font-semibold truncate hover:underline"
            >
              {hero.title}
            </Link>
          </div>
        </div>
      )}

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-gray-900 hover:text-gray-700">
            {SITE_CONFIG.name}
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-widest text-gray-600">
            {["News","Finance","Tech","World","Politics","Crypto"].map((c) => (
              <Link key={c} href={`/${c.toLowerCase()}`} className="hover:text-gray-900 transition-colors">{c}</Link>
            ))}
          </nav>
          <Link href="/rss.xml" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors font-medium">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
            RSS
          </Link>
        </div>
      </div>

      {/* ── Category strip ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {["All","News","Finance","Tech","World","Politics","Science","Sports","Culture","Crypto","Gaming","Entertainment"].map((c) => (
              <Link
                key={c}
                href={c === "All" ? "/" : `/${c.toLowerCase()}`}
                className="shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-white border-b-2 border-transparent hover:border-gray-900 transition-all"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {articles.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No articles published yet</h2>
            <p className="text-gray-500 max-w-sm mb-6">
              Drop a JSON file in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">content/static/articles/</code> and run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">npm run wiki:sync -- --write</code> to publish your first story.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">Editorial Standards</Link>
              <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">About OzoneNews</Link>
              <Link href="/rss.xml" className="text-blue-600 hover:text-blue-800 underline">RSS Feed</Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Hero + secondary grid ────────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-0 border border-gray-200 mb-8">
              {/* Hero */}
              {hero && (
                <div className="lg:col-span-2 border-r border-gray-200">
                  {hero.thumbnail_src && (
                    <div className="aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={hero.thumbnail_src} alt={hero.title} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <CategoryBadge category={hero.category} />
                      {hero.breaking && <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Breaking</span>}
                    </div>
                    <Link href={hero.url ? new URL(hero.url).pathname : `/${hero.slug}`}>
                      <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight text-gray-900 hover:text-gray-700 transition-colors mb-3">
                        {hero.title}
                      </h1>
                    </Link>
                    {hero.subtitle && (
                      <p className="text-gray-600 text-lg leading-relaxed mb-4 font-serif italic">{hero.subtitle}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {hero.author_name && <span className="font-semibold text-gray-700">{hero.author_name}</span>}
                      <span>{formatDate(hero.published_at)}</span>
                      {hero.read_time && <span>{hero.read_time}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary stack */}
              <div className="flex flex-col divide-y divide-gray-200">
                {secondary.map((a) => (
                  <div key={a.slug} className="p-5 hover:bg-gray-50 transition-colors flex gap-3">
                    {a.thumbnail_src && (
                      <div className="shrink-0 w-20 h-14 overflow-hidden rounded">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.thumbnail_src} alt={a.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CategoryBadge category={a.category} />
                      <Link href={a.url ? new URL(a.url).pathname : `/${a.slug}`}>
                        <h3 className="font-serif font-bold text-sm leading-snug text-gray-900 hover:text-gray-700 mt-1.5 line-clamp-3">
                          {a.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(a.published_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Article grid ─────────────────────────────────────────────── */}
            {remaining.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-serif font-bold text-xl text-gray-900">Latest Stories</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {remaining.map((a) => (
                    <article key={a.slug} className="group border border-gray-200 hover:border-gray-400 transition-colors">
                      {a.thumbnail_src && (
                        <div className="aspect-video overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.thumbnail_src} alt={a.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <CategoryBadge category={a.category} />
                        <Link href={a.url ? new URL(a.url).pathname : `/${a.slug}`}>
                          <h3 className="font-serif font-bold text-base leading-snug text-gray-900 group-hover:text-gray-700 transition-colors mt-2 mb-2 line-clamp-3">
                            {a.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {a.author_name && <span className="text-gray-600 font-medium">{a.author_name}</span>}
                          <span>{formatDate(a.published_at)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {/* ── Load more ────────────────────────────────────────────────── */}
            {articles.length > 17 && (
              <div className="text-center mt-10">
                <Link href="/news" className="inline-block border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors">
                  View All Stories
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
