import type { Metadata } from 'next';
import { WikiArticle } from '@/components/articles/WikiArticle';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Red Bull News 2026 | Sports, Racing & Culture',
  description: 'Latest Red Bull news: F1 racing, extreme sports, events and energy drink company updates.',
  alternates: { canonical: 'https://www.ozonenetwork.news/redbull' },
  openGraph: {
    title: 'Red Bull News 2026 | Sports, Racing & Culture',
    description: 'Latest Red Bull news: F1 racing, extreme sports, events and energy drink company updates.',
    type: 'website',
    url: 'https://www.ozonenetwork.news/redbull',
    siteName: 'OzoneNews',
  },
};

export default function Page() {
  return <WikiArticle slug="redbull" />;
}
