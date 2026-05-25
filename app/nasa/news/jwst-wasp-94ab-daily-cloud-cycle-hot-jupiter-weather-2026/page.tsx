import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';


const SLUG = '/nasa/news/jwst-wasp-94ab-daily-cloud-cycle-hot-jupiter-weather-2026';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`;
const OG_IMAGE = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=675&fit=crop&q=80';

export const metadata: Metadata = {
  title: 'JWST Captures First Daily Cloud Cycle on Hot Jupiter WASP-94A b',
  description:
    'Webb\'s NIRSpec separated morning and evening atmospheres on WASP-94A b 700 light-years away. Silicate sand clouds form at dawn and vaporize above 1,000°C by dusk, published in Science May 21, 2026.',
  keywords: [
    'JWST WASP-94A b',
    'Hot Jupiter daily cloud cycle',
    'WASP-94A b weather',
    'JWST exoplanet atmosphere 2026',
    'silicate cloud exoplanet',
    'James Webb Space Telescope hot jupiter',
    'NIRSpec transmission spectroscopy',
    'WASP-94A b magnesium silicate clouds',
    'tidally locked exoplanet weather',
    'exoplanet cloud cycle Science journal',
    'Nathan Mayne University of Exeter JWST',
    'WASP-39b WASP-17b cloud cycle',
    'hot jupiter atmospheric limb separation',
    'exoplanet meteorology 2026',
    'JWST NIRSpec morning evening limb',
    'exoplanet sand clouds vaporize',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'JWST Captures First Daily Cloud Cycle on Hot Jupiter WASP-94A b | Sand Clouds Form at Dawn, Vanish by Dusk',
    description:
      'Webb isolated morning and evening atmospheric limbs on WASP-94A b 700 light-years away. Silicate sand clouds build overnight and vaporize past 1,000°C each day, per Science journal May 21, 2026.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['OzoneNews Editorial Team'],
    publishedTime: '2026-05-21T18:00:00-05:00',
    modifiedTime: '2026-05-21T18:00:00-05:00',
    section: 'Science',
    tags: ['JWST', 'WASP-94A b', 'Hot Jupiter', 'Exoplanet', 'NASA', 'Astronomy'],
    images: [{ url: OG_IMAGE, width: 1200, height: 675, alt: 'Deep space stars and nebula | JWST WASP-94A b daily cloud cycle discovery' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JWST Sees Daily Sand Cloud Cycle on Planet 700 Light-Years Away',
    description: 'Silicate clouds form every morning and vaporize above 1,000°C by nightfall on Hot Jupiter WASP-94A b. First weather cycle ever observed on an exoplanet.',
    images: [OG_IMAGE],
  },
};

export default function JWSTHotJupiterCloudCyclePage() {
  return <NewsArticleDB slug="nasa-news-jwst-wasp-94ab-daily-cloud-cycle-hot-jupiter-weather-2026" />;
}
