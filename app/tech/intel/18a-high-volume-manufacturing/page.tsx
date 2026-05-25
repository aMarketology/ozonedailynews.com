import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:migrate' to update content in Supabase.


export const metadata: Metadata = {
  title: 'Intel Completes 18A Process Node, Begins High-Volume',
  description: 'Intel announces 18A process node has entered high-volume manufacturing, completing its ambitious "5 Nodes in 4 Years" roadmap. Panther Lake and Clearwater',
  keywords: [
    'Intel',
    'Intel 18A',
    '18A process node',
    'semiconductor manufacturing',
    'high-volume production',
    'Pat Gelsinger',
    'Panther Lake',
    'Clearwater Forest',
    'TSMC competitor',
    'chip foundry',
    'Intel foundry services',
    'Arizona fab',
  ],
  alternates: {
    canonical: 'https://www.ozonenetwork.news/intel/18a-high-volume-manufacturing',
  },
  openGraph: {
    title: 'Intel Completes 18A Process Node, Enters High-Volume',
    description: 'Intel achieves critical milestone in semiconductor manufacturing comeback, positioning itself as credible TSMC alternative with advanced 18A process',
    type: 'article',
    url: 'https://www.ozonenetwork.news/intel/18a-high-volume-manufacturing',
    siteName: 'OzoneNews',
    publishedTime: '2026-01-31T09:00:00Z',
    section: 'Technology',
    tags: ['Intel', 'Semiconductors', 'Manufacturing', 'Technology'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intel Completes 18A Process Node Production Milestone',
    description: 'Intel enters high-volume 18A manufacturing, completing "5 Nodes in 4 Years" roadmap.',
  },
};

export default function Intel18AProductionPage() {
  return <NewsArticleDB slug="intel-18a-high-volume-manufacturing" />;
}
