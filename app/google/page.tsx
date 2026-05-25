import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllEntries } from '@/lib/registry-service';

export const revalidate = 3600;

const SLUG = '/google';

export const metadata: Metadata = {
  title: 'Google News | Search, AI & Android 2026',
  description: 'Google news covering Search, AI, Android, YouTube, and Google Cloud from OzoneNews.',
  alternates: { canonical: `https://www.ozonenetwork.news${SLUG}` },
  openGraph: {
    title: 'Google News | Search, AI & Android 2026',
    description: 'Google news covering Search, AI, Android, YouTube, and Google Cloud from OzoneNews.',
    type: 'website',
    url: `https://www.ozonenetwork.news${SLUG}`,
    siteName: 'OzoneNews',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google News | Search, AI & Android 2026',
    description: 'Google news covering Search, AI, Android, YouTube, and Google Cloud from OzoneNews.',
  },
};

export default async function Page() {
  const all = await getAllEntries();

  // Pull articles for this hub
  const articles = all
    .filter((e) => {
      const slugMatch = e.slug.startsWith('/google/');
      const catMatch = ['Tech', 'Technology', 'tech'].some(
        (c: string) => e.category.toLowerCase() === c.toLowerCase()
      );
      const tagMatch = e.tags?.some((t: string) =>
        t.toLowerCase().includes('google')
      );
      const depthOk = e.slug.split('/').filter(Boolean).length >= 2;
      return depthOk && (slugMatch || catMatch || tagMatch);
    })
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 60);

  return (
    <div className="min-h-screen bg-white">
      {/* Hub header */}
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">→</span>
            <span className="text-black font-semibold">Google</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="h-12 w-1.5 bg-blue-700 shrink-0 mt-1" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black">
                Google
              </h1>
              <p className="mt-2 text-gray-600 text-base sm:text-lg max-w-2xl">
                Search, AI, Android, YouTube, and Google Cloud.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {articles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 text-lg">No articles found yet.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">← Back to home</Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-6">
              {articles.length} articles
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
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
                    <div className="w-full aspect-[16/9] bg-blue-50 border-blue-200 border-b flex items-center justify-center shrink-0">
                      <span className="text-blue-700 text-3xl font-black opacity-30">OW</span>
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[9px] font-black px-2 py-0.5 tracking-[.15em] uppercase text-white bg-blue-700 self-start mb-2">
                      {article.category}
                    </span>
                    <h2 className="font-serif text-base font-black leading-snug group-hover:underline line-clamp-3 flex-1">
                      {article.title.replace(/\s*[|]\s*OzoneNews.*$/i, '')}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-3 pt-2 border-t border-gray-100">
                      {article.author} · {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
