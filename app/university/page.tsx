import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllEntries } from '@/lib/registry-service';
import { SITE_CONFIG } from '@/lib/site-config';

export const revalidate = 3600;

const SLUG = '/university';

export const metadata: Metadata = {
  title: 'University News | Higher Education, Research & Campus Life',
  description: 'University news covering campus policy, academic research, student life, and higher education developments from OzoneNews.',
  alternates: { canonical: `${SITE_CONFIG.url}${SLUG}` },
  openGraph: {
    title: 'University News | Higher Education, Research & Campus Life',
    description: 'University news covering campus policy, academic research, student life, and higher education developments from OzoneNews.',
    type: 'website',
    url: `${SITE_CONFIG.url}${SLUG}`,
    siteName: SITE_CONFIG.publisherName,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'University News | Higher Education, Research & Campus Life',
    description: 'University news covering campus policy, academic research, student life, and higher education developments.',
  },
};

export default async function UniversityPage() {
  const all = await getAllEntries();

  const articles = all
    .filter((e) => {
      if (e.lifecycle === 'pruned') return false;
      if (e.slug.startsWith('/university/')) return true;
      if (e.category.toLowerCase() === 'news' && (e.title.toLowerCase().includes('university') || e.title.toLowerCase().includes('college') || e.title.toLowerCase().includes('campus') || e.title.toLowerCase().includes('student'))) return true;
      return false;
    })
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 60);

  const hero = articles[0] ?? null;
  const grid = articles.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">→</span>
            <span className="text-black font-semibold">University</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="h-12 w-1.5 bg-rose-600 shrink-0 mt-1" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black">University</h1>
              <p className="mt-2 text-gray-600 text-base sm:text-lg max-w-2xl">
                Higher education policy, campus life, academic research, and student affairs.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {articles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 text-lg">No articles found yet.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-rose-600 hover:underline">← Back to home</Link>
          </div>
        ) : (
          <>
            {hero && (
              <Link
                href={hero.slug}
                className="group flex flex-col sm:flex-row gap-6 mb-10 border border-gray-200 rounded-sm overflow-hidden hover:border-black hover:shadow-md transition-all"
              >
                {hero.imageUrl ? (
                  <div className="relative w-full sm:w-80 aspect-[16/9] sm:aspect-auto shrink-0 bg-gray-100 overflow-hidden">
                    <Image
                      src={hero.imageUrl}
                      alt={hero.imageAlt ?? hero.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-80 aspect-[16/9] sm:aspect-auto bg-rose-50 border-r border-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-400 text-4xl font-black opacity-40">⬡</span>
                  </div>
                )}
                <div className="p-5 sm:p-6 flex flex-col justify-center flex-1">
                  {hero.breaking && (
                    <span className="text-[9px] font-black px-2 py-0.5 tracking-[.15em] uppercase text-white bg-red-600 self-start mb-2">Breaking</span>
                  )}
                  <span className="text-[9px] font-black px-2 py-0.5 tracking-[.15em] uppercase text-white bg-rose-600 self-start mb-3">
                    {hero.category}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-black leading-snug group-hover:underline mb-2">{hero.title}</h2>
                  {hero.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{hero.description}</p>
                  )}
                  <p className="text-[10px] text-gray-400 font-mono">
                    {hero.author} · {new Date(hero.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            )}

            {grid.length > 0 && (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-6">{articles.length} articles</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grid.map((article) => (
                    <Link
                      key={article.slug}
                      href={article.slug}
                      className="group flex flex-col border border-gray-200 rounded-sm overflow-hidden hover:border-black hover:shadow-md transition-all"
                    >
                      {article.imageUrl ? (
                        <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden shrink-0">
                          <Image
                            src={article.imageUrl}
                            alt={article.imageAlt ?? article.title}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[16/9] bg-rose-50 border-b border-rose-100 flex items-center justify-center shrink-0">
                          <span className="text-rose-400 text-3xl font-black opacity-30">⬡</span>
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        {article.breaking && (
                          <span className="text-[9px] font-black px-2 py-0.5 tracking-[.15em] uppercase text-white bg-red-600 self-start mb-1">Breaking</span>
                        )}
                        <span className="text-[9px] font-black px-2 py-0.5 tracking-[.15em] uppercase text-white bg-rose-600 self-start mb-2">
                          {article.category}
                        </span>
                        <h2 className="font-serif text-base font-black leading-snug group-hover:underline line-clamp-3 flex-1">{article.title}</h2>
                        <p className="text-[10px] text-gray-500 font-mono mt-3 pt-2 border-t border-gray-100">
                          {article.author} · {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}