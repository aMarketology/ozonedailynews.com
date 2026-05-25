import type { Metadata } from 'next';
import { ArticlePageDB } from '@/components/articles/ArticlePageDB';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:publish -- --file <path>' to update content in Supabase.
export const revalidate = 3600;

const SLUG = '/tech/oracle';
const ARTICLE_URL = `https://www.objectwire.org${SLUG}`; // restored by wiki:publish
const OG_IMAGE = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'Oracle | Company Profile, Cloud, AI Strategy 2026',
  description: 'Oracle Corporation profile: $57B revenue, OCI hyperscaler rivalry with AWS, 200+ AI data center deals, Larry Ellison\'s national security cloud push, and the $500B Stargate partnership in 2026.',
  keywords: [
    'Oracle company profile',
    'Oracle Corporation 2026',
    'Oracle Cloud Infrastructure OCI',
    'Oracle AI data centers',
    'Larry Ellison Oracle',
    'Oracle Stargate AI',
    'Oracle revenue 2026',
    'Oracle vs AWS cloud',
    'Oracle database market share',
    'Oracle national security cloud',
    'Oracle Cerner health cloud',
    'Oracle stock 2026',
    'Oracle autonomous database',
    'Oracle GPU clusters AI',
    'Oracle cloud regions 2026',
    'ORCL NYSE',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'Oracle | $57B Revenue, OCI AI Cloud, Stargate Partner 2026',
    description: 'Oracle built 200+ AI data center deals in 12 months. OCI is the fastest-growing hyperscaler. Larry Ellison is betting national security on Oracle Cloud.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'ObjectWire',
    authors: ['ObjectWire Tech Desk'],
    publishedTime: '2026-04-23T14:00:00Z',
    modifiedTime: '2026-04-23T14:00:00Z',
    section: 'Tech',
    images: [{ url: OG_IMAGE, width: 1200, height: 675, alt: 'Oracle Corporation headquarters Austin Texas cloud AI 2026' }],
    tags: ['Oracle', 'Cloud Computing', 'AI Infrastructure', 'Larry Ellison'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oracle built 200+ AI data center deals in 12 months. This is the full breakdown.',
    description: 'OCI is outgrowing AWS in percentage terms. $57B revenue. $500B Stargate. Larry Ellison is not done.',
    images: [OG_IMAGE],
  },
};

export default function TechOraclePage() {
  return <ArticlePageDB slug="tech-oracle" />;
}
