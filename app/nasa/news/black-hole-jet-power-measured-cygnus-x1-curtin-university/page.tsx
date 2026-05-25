import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:publish -- --file <path>' to update content in Supabase.


const SLUG = '/nasa/news/black-hole-jet-power-measured-cygnus-x1-curtin-university';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`; // restored by wiki:publish
const OG_IMAGE = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'Black Hole Jet Power Measured | Cygnus X-1 First Direct',
  description: 'Astronomers made the first direct measurement of a black hole jet\'s instantaneous power, finding Cygnus X-1\'s jets carry energy equivalent to 10,000',
  keywords: [
    'black hole jet power measured',
    'Cygnus X-1 black hole jets',
    'black hole jet speed light',
    'Curtin University black hole research',
    'Steve Prabu Oxford black hole',
    'Nature Astronomy black hole 2026',
    'black hole jet kinetic power',
    'Cygnus X-1 radio imaging',
    'galaxy evolution black hole jets',
    'black hole measurement 2026',
    'black hole 10000 suns energy',
    'radio astronomy black hole jets',
    'black hole companion star wind',
    'first black hole confirmed Cygnus',
    'black hole jet speed 150000 km',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'Black Hole Jet Power Measured for the First Time | Cygnus',
    description: 'A Curtin University-led team used 18 years of radio imaging to directly measure the jets of Cygnus X-1, finding they carry energy equal to 10,000 suns and',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['OzoneNews Science Desk'],
    publishedTime: '2026-04-17T21:00:00Z',
    modifiedTime: '2026-04-17T21:00:00Z',
    section: 'Science',
    tags: ['Black Hole', 'Cygnus X-1', 'Astronomy', 'Nature Astronomy'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'First-ever direct measurement of a black hole jet\'s power',
    description: '10,000 suns of energy. Half the speed of light. 18 years of data. Cygnus X-1 jets measured for the first time.',
  },
};

export default function NasaNewsBlackHoleJetPowerMeasuredCygnusX1CurtinUniversityPage() {
  return <NewsArticleDB slug="nasa-news-black-hole-jet-power-measured-cygnus-x1-curtin-university" />;
}
