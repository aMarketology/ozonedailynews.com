import type { Metadata } from 'next';
import { JackArticleDB } from '@/components/articles/JackArticleDB';


const SLUG = '/tech/news/tesla-fsd-nyc-la-cannonball-zero-interventions-may-2026';
const ARTICLE_URL = `https://www.objectwire.org${SLUG}`;
const OG_IMAGE = 'https://images.unsplash.com/photo-1772171386187-bc14e6cd7804?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'Tesla FSD 14.3.2 | NYC to LA Cannonball Run Zero Interventions 2026',
  description:
    'Tesla FSD version 14.3.2 completes the 2,833-mile NYC to LA Cannonball Run in 49 hours 55 minutes with zero human interventions, beating the prior record by 8.5 hours. State of self-driving cars 2026.',
  keywords: [
    'Tesla FSD NYC to LA',
    'Tesla Full Self-Driving Cannonball Run 2026',
    'FSD 14.3.2 zero interventions',
    'Tesla autonomous driving record',
    'Tesla FSD Cannonball Run zero disengagements',
    'self-driving car 2026',
    'FSD v14.3.2',
    'Tesla Model 3 autonomous coast to coast',
    'state of self-driving cars 2026',
    'SAE Level 2 autonomy',
    'Tesla Supercharger autonomous parking',
    'Alex Roy FSD record',
    'BLKMDL3 Cannonball Run',
    'Tesla FSD supervised driving',
    'autonomous vehicle progress 2026',
    'Waymo Cruise self-driving comparison 2026',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'Tesla FSD 14.3.2 | NYC to LA Cannonball Run, Zero Interventions',
    description:
      '2,833 miles. 49 hours 55 minutes. Zero human interventions. Tesla FSD 14.3.2 completes the full Cannonball Run coast to coast — and what it reveals about the state of self-driving in 2026.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'ObjectWire',
    authors: ['Jack Sterling'],
    publishedTime: '2026-05-12T10:00:00Z',
    modifiedTime: '2026-05-12T10:00:00Z',
    section: 'Tech',
    images: [{ url: OG_IMAGE, width: 1200, height: 675, alt: 'Car dashboard displaying autonomous driving interface' }],
    tags: ['Tesla', 'FSD', 'Self-Driving', 'Autonomous Vehicles'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tesla FSD 14.3.2 drives NYC to LA — 49h 55m, zero interventions',
    description: '2,833 miles. Zero disengagements. A Cannonball record and a benchmark for autonomous driving in 2026.',
    images: [OG_IMAGE],
  },
};

export default function TeslaFSDCannonballPage() {
  return <JackArticleDB slug="tech-news-tesla-fsd-nyc-la-cannonball-zero-interventions-may-2026" />;
}
