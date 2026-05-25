import type { Metadata } from 'next';
import { WikiArticle } from '@/components/articles/WikiArticle';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:migrate' to update content in Supabase.


export const metadata: Metadata = {
  title: "NASA (National Aeronautics and Space Administration) | Missi",
  description: "Comprehensive overview of NASA's missions, discoveries, and contributions to space exploration. From Artemis Moon missions to Europa ice measurements,",
  keywords: [
    "NASA",
    "National Aeronautics and Space Administration",
    "space exploration",
    "Artemis mission",
    "Juno spacecraft",
    "Europa",
    "Mars rovers",
    "James Webb Space Telescope",
    "ISS",
    "space agency",
  ],
  alternates: {
    canonical: 'https://www.ozonenetwork.news/nasa',
  },
  openGraph: {
    title: "NASA: America's Space Agency - Missions, Discoveries & Exploration",
    description: "Complete overview of NASA's current missions, recent discoveries, and contributions to space science. From Moon missions to Europa's ocean.",
    type: "article",
    url: "https://www.ozonenetwork.news/nasa",
    images: [
      {
        url: "https://www.ozonenetwork.news/images/nasa-overview-og.jpg",
        width: 1200,
        height: 630,
        alt: "NASA Space Exploration",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NASA: America',
    description: 'Complete overview of NASA',
  },
};

export default function NASAPage() {
  return <WikiArticle slug="nasa" />;
}
