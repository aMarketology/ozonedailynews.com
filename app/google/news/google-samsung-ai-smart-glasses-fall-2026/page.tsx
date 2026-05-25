import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';


const SLUG = '/google/news/google-samsung-ai-smart-glasses-fall-2026';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`;
const OG_IMAGE =
  'https://images.unsplash.com/photo-1617802690658-1173a812650d?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'Google Samsung AI Smart Glasses | Fall 2026 Launch',
  description:
    'Google and Samsung revealed audio-first AI smart glasses at Google I/O 2026 built on Android XR with Gemini AI. Warby Parker and Gentle Monster designs launch fall 2026.',
  keywords: [
    'Google Samsung AI smart glasses',
    'Android XR smart glasses 2026',
    'Google I/O 2026 wearables',
    'Google Gemini smart glasses',
    'Samsung smart glasses fall 2026',
    'Warby Parker smart glasses Google',
    'Gentle Monster smart glasses Google',
    'Google smart glasses vs Meta Ray-Ban',
    'Project Aura display glasses',
    'AI eyewear 2026',
    'hands-free AI wearable',
    'Google smart glasses real-time translation',
    'Android XR platform wearables',
    'Google I/O 2026 announcements',
    'Samsung Google wearable partnership',
    'smart glasses Bluetooth smartphone',
  ],
  alternates: {
    canonical: ARTICLE_URL,
  },
  openGraph: {
    title: 'Google & Samsung AI Smart Glasses | Fall 2026 Launch at Google I/O',
    description:
      'Google and Samsung unveiled audio-first AI glasses at Google I/O 2026. Gemini AI, real-time translation, turn-by-turn nav, and Warby Parker designs. Ships fall 2026.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['OzoneNews Editorial Team'],
    publishedTime: '2026-05-20T18:00:00-05:00',
    modifiedTime: '2026-05-20T18:00:00-05:00',
    section: 'Tech',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 675,
        alt: 'Google and Samsung AI smart glasses unveiled at Google I/O 2026',
      },
    ],
    tags: ['Google', 'Samsung', 'Smart Glasses', 'Android XR', 'Gemini AI', 'Google I/O 2026', 'Warby Parker', 'Wearables'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google and Samsung reveal AI smart glasses, launching fall 2026',
    description:
      'Gemini-powered audio glasses with real-time translation, nav, and camera. Built with Warby Parker and Gentle Monster. Direct challenge to Meta Ray-Ban.',
    images: [OG_IMAGE],
  },
};

export default function GoogleSamsungAISmartGlassesFall2026Page() {
  return <NewsArticleDB slug="google-news-google-samsung-ai-smart-glasses-fall-2026" />;
}
