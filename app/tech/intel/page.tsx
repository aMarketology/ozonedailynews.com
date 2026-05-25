import type { Metadata } from 'next';
import { WikiArticle } from '@/components/articles/WikiArticle';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:migrate' to update content in Supabase.


export const metadata: Metadata = {
  title: 'Intel Corporation | Semiconductor Company Profile',
  description: 'Complete profile of Intel Corporation, American multinational semiconductor company. History, processor architectures, market position, and latest',
  keywords: [
    'Intel',
    'Intel Corporation',
    'semiconductor company',
    'microprocessors',
    'CPU',
    'Core processors',
    'Intel history',
    'chip manufacturing',
    'Santa Clara California',
  ],
  alternates: {
    canonical: 'https://www.ozonenetwork.news/intel',
  },
  openGraph: {
    title: 'Intel Corporation | Semiconductor Company Profile',
    description: 'American multinational semiconductor corporation: history, products, and latest developments.',
    type: 'article',
    url: 'https://www.ozonenetwork.news/intel',
    siteName: 'OzoneNews',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intel Corporation | Company Profile',
    description: 'Complete guide to Intel semiconductor company.',
  },
};

export default function IntelPage() {
  return <WikiArticle slug="intel" />;
}
