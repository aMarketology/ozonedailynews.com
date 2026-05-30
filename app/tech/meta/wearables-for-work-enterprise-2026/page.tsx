import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

const SLUG = '/tech/meta/wearables-for-work-enterprise-2026';
const ARTICLE_URL = `https://www.ozonedailynews.com${SLUG}`;

export const metadata: Metadata = {
  title: 'Meta Wearables for Work | Enterprise Push 2026',
  description:
    "Meta's leaked memo reveals Wearables for Work, an enterprise platform targeting 10 million wearable sales in H2 2026 as Reality Labs posts $4B losses.",
  keywords: [
    'Meta Wearables for Work',
    'Meta enterprise wearables 2026',
    'Alex Himel Meta memo',
    'Reality Labs losses 2026',
    'Meta smart glasses enterprise',
    'Meta AI pendant Limitless',
    'Meta Ray-Ban smart glasses lineup',
    'Meta hardware roadmap 2026',
    'Reality Labs Q1 2026 revenue',
    'Meta wearables 10 million devices',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'Meta Wearables for Work | Enterprise Push 2026',
    description:
      "A leaked memo from Meta VP Alex Himel reveals a new enterprise wearables platform, an AI pendant, and a goal to sell 10 million devices in H2 2026.",
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['Max DeLeonardis'],
    publishedTime: '2026-05-29T09:00:00-05:00',
    modifiedTime: '2026-05-29T09:00:00-05:00',
    section: 'Tech',
    tags: ['Meta', 'Reality Labs', 'Smart Glasses', 'Wearables'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meta Is Building Wearables for Work | Enterprise Pivot 2026',
    description:
      'A leaked internal memo reveals Meta plans enterprise smart glasses, an AI pendant, and 10 million device sales in H2 2026 as Reality Labs bleeds $4B.',
  },
};

export default function MetaWearablesForWorkPage() {
  return <NewsArticleDB slug="tech-meta-wearables-for-work-enterprise-2026" />;
}
