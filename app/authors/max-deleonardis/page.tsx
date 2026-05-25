import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Max DeLeonardis | Owner, OzoneNews Network',
  description: 'Max DeLeonardis is the founder and owner of the OzoneNews Network, an independent digital news operation covering technology, science, finance, and world affairs.',
  alternates: { canonical: `${SITE_CONFIG.url}/authors/max-deleonardis` },
};

export default function MaxDeleonardisPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-start gap-6">
        <div className="h-20 w-20 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
          MD
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Max DeLeonardis</h1>
          <p className="mt-1 text-lg text-slate-600">Owner, OzoneNews Network</p>
          <p className="mt-3 text-slate-700">
            Max DeLeonardis is the founder and owner of OzoneNews, an independent digital news
            network. He built the platform to deliver fast, accurate, and well-sourced coverage of
            technology, science, and global affairs. Day-to-day editorial operations are led by{' '}
            <Link href="/authors/alfred-minter" className="text-blue-600 hover:text-blue-800 underline">
              Alfred Minter
            </Link>
            , Chief of Staff.
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-800 border-b pb-2">
          OzoneNews Network
        </h2>
        <p className="text-slate-700">
          OzoneNews publishes original reporting across Tech, Science, Finance, World, and more.
          The network operates under a strict{' '}
          <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">
            editorial standards policy
          </Link>{' '}
          and is committed to transparent, independent journalism.
        </p>
      </section>
    </main>
  );
}
