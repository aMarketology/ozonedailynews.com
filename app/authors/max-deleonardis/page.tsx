import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';

const AUTHOR_URL = `${SITE_CONFIG.url}/authors/max-deleonardis`;

export const metadata: Metadata = {
  title: 'Max DeLeonardis | Founder & Publisher, OzoneNews Network',
  description:
    'Max DeLeonardis is the founder and publisher of OzoneNews Network, an independent news operation covering science, technology, climate, and global affairs.',
  alternates: { canonical: AUTHOR_URL },
  openGraph: {
    title: 'Max DeLeonardis | Founder & Publisher, OzoneNews Network',
    description:
      'Max DeLeonardis is the founder and publisher of OzoneNews Network, an independent news operation covering science, technology, and global affairs.',
    url: AUTHOR_URL,
    type: 'profile',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Max DeLeonardis',
  url: AUTHOR_URL,
  jobTitle: 'Founder & Publisher',
  worksFor: {
    '@type': 'NewsMediaOrganization',
    name: 'Ozone Network News LLC',
    url: SITE_CONFIG.url,
    publishingPrinciples: `${SITE_CONFIG.url}/editorial-standards`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE_CONFIG.email,
      contactType: 'editorial',
    },
  },
  description:
    'Max DeLeonardis is the founder and publisher of Ozone Network News LLC, operator of OzoneNews and the broader ONN network of independent digital news brands.',
  // sameAs: add real profile URLs before Google News submission
  sameAs: [
    // 'https://twitter.com/maxdeleonardis',
    // 'https://www.linkedin.com/in/max-deleonardis',
  ],
};

export default function MaxDeleonardisPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start gap-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
            MD
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Max DeLeonardis</h1>
            <p className="mt-1 text-lg text-slate-500">Founder &amp; Publisher</p>
            <p className="mt-1 text-sm text-slate-400">
              <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                OzoneNews Network
              </Link>{' '}
              &middot; Ozone Network News LLC
            </p>
          </div>
        </div>

        {/* Bio */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-800 border-b pb-2">About</h2>
          <p className="text-slate-700 leading-relaxed">
            Max DeLeonardis is the founder and publisher of{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
              OzoneNews
            </Link>
            , an independent digital news network focused on science, technology, climate, and
            global affairs. He built the platform to deliver fast, fact-checked coverage of the
            stories that matter most to a scientifically literate audience.
          </p>
          <p className="mt-3 text-slate-700 leading-relaxed">
            Max DeLeonardis is the founder and publisher of OzoneNews and the author of the network's reporting across science, technology, climate, and space.
          </p>
        </section>

        {/* Network section */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-800 border-b pb-2">
            OzoneNews Network
          </h2>
          <p className="text-slate-700 leading-relaxed">
            OzoneNews publishes original reporting across Science, Technology, Climate, Space, and
            World categories. The network operates under a strict{' '}
            <Link
              href="/editorial-standards"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              editorial standards policy
            </Link>{' '}
            with named authorship required on every article, verified external sources, and a
            published{' '}
            <Link href="/corrections" className="text-blue-600 hover:text-blue-800 underline">
              corrections policy
            </Link>
            .
          </p>
        </section>

        {/* Contact */}
        <section className="rounded-lg bg-slate-50 border border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-600">
            Editorial inquiries:{' '}
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {SITE_CONFIG.email}
            </a>
            . For corrections, visit the{' '}
            <Link href="/corrections" className="text-blue-600 hover:text-blue-800 underline">
              corrections page
            </Link>
            . For press or partnership inquiries, use the{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
              contact form
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
