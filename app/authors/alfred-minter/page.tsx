import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Alfred Minter | Chief of Staff, OzoneNews',
  description: 'Alfred Minter is Chief of Staff at OzoneNews, overseeing editorial operations, team coordination, and publishing standards across all coverage verticals.',
  alternates: { canonical: `${SITE_CONFIG.url}/authors/alfred-minter` },
};

export default function AlfredMinterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-start gap-6">
        <div className="h-20 w-20 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600">
          AM
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alfred Minter</h1>
          <p className="mt-1 text-lg text-slate-600">Chief of Staff, OzoneNews</p>
          <p className="mt-3 text-slate-700">
            Alfred Minter serves as Chief of Staff at OzoneNews, directing editorial operations and
            coordinating coverage across Tech, Science, Finance, and World verticals. He works
            alongside a team of reporters and editors, reporting directly to network owner{' '}
            <Link href="/authors/max-deleonardis" className="text-blue-600 hover:text-blue-800 underline">
              Max DeLeonardis
            </Link>
            .
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-800 border-b pb-2">
          About OzoneNews
        </h2>
        <p className="text-slate-700">
          OzoneNews is an independent digital news network covering technology, science, and global
          affairs. The network is owned and operated by Max DeLeonardis and is committed to
          original, fact-checked reporting.{' '}
          <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">
            Read our editorial standards.
          </Link>
        </p>
      </section>
    </main>
  );
}
