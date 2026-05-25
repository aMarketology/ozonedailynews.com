import type { Metadata } from 'next';
import { ArticlePageDB } from '@/components/articles/ArticlePageDB';


const SLUG = '/youtube';
const PAGE_URL = `https://www.ozonenetwork.news${SLUG}`;

export const metadata: Metadata = {
  title: 'YouTube | Platform Overview, Creator Economy & History 2026',
  description: 'YouTube is the world\'s largest video platform with 2.7B monthly users and $34B in annual ad revenue. Full overview of history, Shorts, creator monetization, and 2026 platform updates.',
  keywords: [
    'YouTube',
    'YouTube platform overview',
    'YouTube creator economy 2026',
    'YouTube Shorts',
    'YouTube monetization',
    'YouTube Partner Program',
    'YouTube history',
    'YouTube revenue 2026',
    'YouTube vs TikTok',
    'YouTube Premium',
    'YouTube policy 2026',
    'YouTube AI features 2026',
    'Google YouTube',
    'YouTube monthly users',
    'YouTube advertising revenue',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'YouTube | Platform Overview, Creator Economy & History 2026',
    description: '2.7 billion monthly users, $34B in ad revenue, and the center of the global creator economy. Full YouTube platform profile covering history, Shorts, monetization, and 2026 updates.',
    type: 'article',
    url: PAGE_URL,
    siteName: 'OzoneNews',
    authors: ['OzoneNews Editorial Team'],
    section: 'Tech',
    tags: ['YouTube', 'Google', 'Creator Economy', 'Video Platform'],
    publishedTime: '2026-05-21T20:00:00-05:00',
    modifiedTime: '2026-05-21T20:00:00-05:00',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube | 2.7B Users, $34B Revenue, Creator Economy Platform Profile',
    description: 'Full YouTube platform overview: history, Shorts strategy, monetization, AI features, and 2026 policy updates.',
  },
};

export default function YouTubePage() {
  return <ArticlePageDB slug="youtube" />;
}
