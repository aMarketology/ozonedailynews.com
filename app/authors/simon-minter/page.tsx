import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';

const AUTHOR_URL = `${SITE_CONFIG.url}/authors/simon-minter`;

export const metadata: Metadata = {
  title: 'Simon Alfred Minter | Science & Technology Reporter, OzoneNews',
  description:
    'Simon Alfred Minter covers space exploration, climate science, and emerging technology for OzoneNews. His reporting draws on primary sources including NASA, NOAA, ESA, and peer-reviewed research.',
  alternates: { canonical: AUTHOR_URL },
  openGraph: {
    title: 'Simon Alfred Minter | Science & Technology Reporter, OzoneNews',
    description:
      'Simon Alfred Minter covers space exploration, climate science, and emerging technology for OzoneNews.',
    url: AUTHOR_URL,
    type: 'profile',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Simon Alfred Minter',
  url: AUTHOR_URL,
  jobTitle: 'Science & Technology Reporter',
  worksFor: {
    '@type': 'NewsMediaOrganization',
    name: 'OzoneNews',
    url: SITE_CONFIG.url,
    publishingPrinciples: `${SITE_CONFIG.url}/editorial-standards`,
  },
  description:
    'Simon Alfred Minter is a science and technology reporter covering space exploration, atmospheric science, climate data, and AI for OzoneNews.',
  knowsAbout: [
    'Space Exploration',
    'NASA',
    'SpaceX',
    'Atmospheric Science',
    'Ozone Layer',
    'Climate Science',
    'Artificial Intelligence',
    'Emerging Technology',
  ],
  // sameAs: update these with real profile URLs before Google News submission
  sameAs: [
    // 'https://twitter.com/alfredminter',
    // 'https://www.linkedin.com/in/simon-minter',
  ],
};

const RECENT_ARTICLES = [
  {
    title: 'Flash Attention 3 vs TurboQuant vs Paged KV Cache | LLM Optimization Compared',
    href: '/tech/google/google-news-flash-attention-3-vs-turboquant-vs-paged-kv-cache-llm-optimization',
  },
  {
    title: 'Google & Samsung AI Smart Glasses | Fall 2026 Launch',
    href: '/tech/google/google-news-google-samsung-ai-smart-glasses-fall-2026',
  },
  {
    title: 'Black Hole Jet Power Measured | Cygnus X-1 Study',
    href: '/nasa/news/nasa-news-black-hole-jet-power-measured-cygnus-x1-curtin-university',
  },
  {
    title: 'JWST Hot Jupiter Weather | Daily Cloud Cycle Confirmed on WASP-94Ab',
    href: '/nasa/news/nasa-news-jwst-wasp-94ab-daily-cloud-cycle-hot-jupiter-weather-2026',
  },
  {
    title: 'Waymo Hits 500,000 Rides Per Week | 10-City Expansion 2026',
    href: '/tech/google/google-waymo-waymo-500000-rides-per-week-10-cities-2026',
  },
  {
    title: 'Intel 18A | High-Volume Manufacturing Confirmed',
    href: '/tech/intel/intel-18a-high-volume-manufacturing',
  },
];

const BEATS = ['Space', 'Climate', 'Atmospheric Science', 'AI', 'Technology'];

export default function AlfredMinterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start gap-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white">
            AM
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Simon Alfred Minter</h1>
            <p className="mt-1 text-lg text-slate-500">Science &amp; Technology Reporter</p>
            <p className="mt-1 text-sm text-slate-400">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                OzoneNews
              </Link>{' '}
              &middot; Reporting since 2026
            </p>
            {/* Beat tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {BEATS.map((beat) => (
                <span
                  key={beat}
                  className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600"
                >
                  {beat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-800 border-b pb-2">About</h2>
          <p className="text-slate-700 leading-relaxed">
            Simon Alfred Minter is a science and technology reporter for OzoneNews. He covers space
            exploration, atmospheric science, climate data, and artificial intelligence, drawing
            directly on primary sources including{' '}
            <a
              href="https://www.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              NASA
            </a>
            ,{' '}
            <a
              href="https://www.noaa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              NOAA
            </a>
            ,{' '}
            <a
              href="https://www.esa.int"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ESA
            </a>
            , and peer-reviewed scientific literature. His reporting focuses on translating complex
            scientific data into clear, sourced news coverage.
          </p>
          <p className="mt-3 text-slate-700 leading-relaxed">
            Alfred reports on the full arc of the space economy, from NASA flagship missions and
            commercial launch milestones to the atmospheric science of Earth&apos;s ozone layer and
            global climate indicators. He also covers the AI and technology industry with a focus
            on technical infrastructure, model performance benchmarks, and hardware development.
          </p>
        </section>

        {/* Recent Articles */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-800 border-b pb-2">
            Recent Articles
          </h2>
          <ul className="space-y-2">
            {RECENT_ARTICLES.map((article) => (
              <li key={article.href}>
                <Link
                  href={article.href}
                  className="text-blue-600 hover:text-blue-800 underline text-sm leading-relaxed"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Editorial note */}
        <section className="rounded-lg bg-slate-50 border border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-600">
            All articles published under this byline follow the{' '}
            <Link
              href="/editorial-standards"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              OzoneNews editorial standards
            </Link>
            , including source attribution, independent verification, and the{' '}
            <Link
              href="/corrections"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              corrections policy
            </Link>
            . OzoneNews is owned and operated by{' '}
            <Link
              href="/authors/max-deleonardis"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Max DeLeonardis
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
