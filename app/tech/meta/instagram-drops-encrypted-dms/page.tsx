import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

// Page renders dynamically — content served from on-prem static JSON.
// Run 'npm run wiki:publish -- --file <path>' to update the on-prem static JSON.

const SLUG = '/tech/meta/instagram-drops-encrypted-dms';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`; // restored by wiki:publish
const OG_IMAGE = '';

export const metadata: Metadata = {
  title: 'Instagram Ends Encrypted DMs | Meta Reversal May 2026',
  description: 'Meta ends end-to-end encryption for Instagram direct messages on May 8, 2026. What changed, who is affected, and what users should do before the cutoff.',
  keywords: [
    'Instagram end-to-end encryption',
    'Meta removes Instagram E2EE',
    'Instagram encrypted DMs ending',
    'Instagram privacy May 2026',
    'Meta Instagram encryption removed',
    'Instagram DM privacy change',
    'Meta privacy reversal 2026',
    'Instagram messaging security',
    'download Instagram encrypted chats',
    'Instagram vs WhatsApp encryption',
    'Meta data access Instagram messages',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'Instagram Ends Encrypted DMs | Meta Reversal May 2026',
    description: 'Meta is removing optional end-to-end encryption from Instagram DMs on May 8, 2026. Affected users must download their encrypted chats before access disappears.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['Max DeLeonardis'],
    publishedTime: '2026-05-07T10:00:00Z',
    modifiedTime: '2026-05-07T10:00:00Z',
    section: 'Tech',
    tags: ['Meta', 'Instagram', 'Privacy', 'Encryption'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instagram Is Dropping Encrypted DMs on May 8',
    description: 'Meta says almost nobody used it. Here is what changes, who it affects, and how to export your chats before the deadline.',
  },
};

export default function TechMetaInstagramDropsEncryptedDmsPage() {
  return <NewsArticleDB slug="tech-meta-instagram-drops-encrypted-dms" />;
}
