import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import { BeehiivSignup } from '@/components/newsletter/BeehiivSignup';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ozone Dispatch | Weekly Science Newsletter',
  description:
    'Subscribe to the Ozone Dispatch. Space exploration, climate data, and atmospheric science delivered every Friday. Free newsletter from OzoneNews.',
  alternates: { canonical: `${SITE_CONFIG.url}/newsletter` },
  openGraph: {
    title: 'Ozone Dispatch | Weekly Science Newsletter',
    description:
      'Space exploration, climate data, and atmospheric science every Friday. Free newsletter from OzoneNews.',
    url: `${SITE_CONFIG.url}/newsletter`,
    type: 'website',
  },
};

const WHAT_TO_EXPECT = [
  {
    icon: '🛸',
    title: 'Space Exploration',
    desc: 'Mission updates from NASA, ESA, and SpaceX. JWST discoveries. Launch milestones. When humanity does something remarkable, we cover it.',
  },
  {
    icon: '🌡️',
    title: 'Climate Data',
    desc: 'Monthly temperature anomalies, CO2 readings from Mauna Loa, Arctic sea ice extents. The measured numbers, not the politics.',
  },
  {
    icon: '🌍',
    title: 'Atmospheric Science',
    desc: 'Ozone layer recovery data, air quality reports, wildfire smoke tracking, methane measurements. The air we breathe, explained.',
  },
  {
    icon: '⚡',
    title: 'Energy Transition',
    desc: 'Solar and wind capacity records, battery storage cost curves, EV adoption data. The energy system is changing. We track how fast.',
  },
];

export default function NewsletterPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">

      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Free Weekly Newsletter
        </p>
        <h1 className="text-4xl font-bold text-slate-900 leading-tight">
          The Ozone Dispatch
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Space exploration, climate science, and atmospheric data from{' '}
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            OzoneNews
          </Link>
          . Every Friday. Free.
        </p>
      </div>

      {/* Signup form */}
      <div className="mb-16">
        <BeehiivSignup variant="page" />
      </div>

      {/* What to expect */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-slate-800 border-b pb-3">
          What you get each Friday
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {WHAT_TO_EXPECT.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust note */}
      <section className="rounded-xl bg-slate-900 px-6 py-5 text-sm text-slate-300">
        <p>
          No sponsored content. No affiliate links. No tracking pixels in email.
          Unsubscribe in one click, any time.{' '}
          <Link href="/editorial-standards" className="text-blue-400 hover:text-blue-300 underline">
            Read our editorial standards.
          </Link>
        </p>
      </section>

    </main>
  );
}
