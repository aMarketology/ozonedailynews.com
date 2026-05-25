import type { Metadata } from 'next';
import { JackArticleDB } from '@/components/articles/JackArticleDB';


const SLUG = '/intel/news/server-cpu-market-share-amd-arm-data-center-may-2026';
const ARTICLE_URL = `https://www.objectwire.org${SLUG}`;
const OG_IMAGE =
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'Intel Server CPU Share Falls to 54.9% | AMD and Arm Gain',
  description:
    'Intel server CPU unit share fell from 64.4% to 54.9% in Q1 2026 as AMD expanded to 27.4% and Arm climbed to 17.7%. Intel stock dropped below $116 on May 15 — fourth consecutive loss session.',
  keywords: [
    'Intel server CPU market share 2026',
    'Intel AMD Arm server market share Q1 2026',
    'Intel stock drop May 2026',
    'AMD server CPU share 2026',
    'Arm server CPU market share 2026',
    'Intel data center revenue decline',
    'Intel Coral Rapids architecture',
    'UBS Intel server market report 2026',
    'agentic AI server CPU demand 2026',
    'Intel x86 revenue share 490 basis points',
    'AMD server unit shipments Q1 2026',
    'Intel stock below $116',
    'PC shipment forecast decline 2026',
    'data center silicon diversification 2026',
    'Intel foundry valuation 2026',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title:
      'Intel Server CPU Market Share Erosion | AMD and Arm Capture Data Center Revenue as Stock Falls Below $116',
    description:
      'Intel server CPU unit share collapsed from 64.4% to 54.9% in Q1 2026. AMD hit 27.4%, Arm 17.7%, in a market that grew 19% year-over-year. Intel shares fell below $116 on May 15.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'ObjectWire',
    authors: ['Jack Sterling'],
    publishedTime: '2026-05-15T14:00:00Z',
    modifiedTime: '2026-05-15T14:00:00Z',
    section: 'Tech',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 675,
        alt: 'Intel computer processor chip macro photography',
      },
    ],
    tags: ['Intel', 'AMD', 'Arm Holdings', 'Server CPU', 'Data Center', 'Semiconductors'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intel Server CPU Share Collapses to 54.9% — AMD at 27.4%, Arm at 17.7%',
    description:
      'UBS confirms Intel lost 9.5 pts of server CPU share in Q1 2026. Stock below $116. Full analysis.',
    images: [OG_IMAGE],
  },
};

export default function IntelServerCPUSharePage() {
  return (
    <JackArticleDB slug="intel-news-server-cpu-market-share-amd-arm-data-center-may-2026" />
  );
}
