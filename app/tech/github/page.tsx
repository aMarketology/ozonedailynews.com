import type { Metadata } from 'next';
import { WikiArticle } from '@/components/articles/WikiArticle';
import { generateArticleMetadata } from '@/lib/seo-utils';

export const revalidate = 3600;

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:migrate' to update content in Supabase.


export const metadata: Metadata = generateArticleMetadata({
  title: "GitHub | Company Profile, History & Open Source Impact",
  description: "Comprehensive overview of GitHub Inc., the world's largest code hosting platform with 100M+ developers. Explore GitHub's history, acquisition by Microsoft, products like Copilot, and impact on open source software development.",
  keywords: [
    "GitHub",
    "GitHub company",
    "GitHub history",
    "Microsoft GitHub",
    "GitHub Copilot",
    "code hosting platform",
    "open source software",
    "version control",
    "Git repository",
    "developer platform",
    "GitHub Actions",
    "software development",
    "GitHub 2026",
  ],
  canonicalUrl: "https://www.ozonenetwork.news/github",
  publishedTime: "2026-01-24T00:00:00Z",
  modifiedTime: "2026-01-24T00:00:00Z",
  authors: ["OzoneNews Technology Desk"],
  category: "Technology",
  tags: ["GitHub", "Microsoft", "Open Source", "Software Development", "Developer Tools"],
});

export default function GitHubPage() {
  return <WikiArticle slug="github" />;
}
