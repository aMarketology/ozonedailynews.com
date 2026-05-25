import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';


const SLUG = '/tech/news/gitlab-restructuring-may-2026-workforce-agentic-ai-pivot';

export const metadata: Metadata = {
  title: 'GitLab Restructuring May 2026 | 60 Autonomous Teams, Agentic AI Pivot',
  description:
    'GitLab announced a major restructuring on May 11, 2026: up to 30 percent reduction in operating countries, three management layers removed, R&D reorganized into roughly 60 autonomous teams, and the CREDIT values framework retired. CEO Bill Staples frames it as a once-in-a-generation repositioning for agentic AI.',
  keywords: [
    'GitLab restructuring 2026',
    'GitLab layoffs May 2026',
    'GitLab agentic AI pivot',
    'Bill Staples GitLab CEO',
    'GitLab autonomous teams 2026',
    'GitLab workforce reduction 2026',
    'GitLab CREDIT values retired',
    'GitLab June 2 earnings 2026',
    'GitLab Transcend June 10 2026',
    'GitLab machine scale AI infrastructure',
    'DevOps agentic AI 2026',
    'tech layoffs May 2026',
    'GitLab fiscal 2027 guidance',
    'GitLab voluntary separation May 18',
  ],
  alternates: { canonical: `https://www.objectwire.org${SLUG}` },
  openGraph: {
    title: 'GitLab Restructuring May 2026 | 60 Autonomous Teams, Agentic AI Pivot',
    description:
      'GitLab flattens three management layers, cuts operating countries by up to 30%, doubles R&D into 60 autonomous teams, and retires CREDIT values to reposition for agentic AI. Voluntary separation closes May 18. Final structure June 1.',
    type: 'article',
    url: `https://www.objectwire.org${SLUG}`,
    siteName: 'ObjectWire',
    authors: ['Jack Sterling'],
    publishedTime: '2026-05-11T23:00:00Z',
    modifiedTime: '2026-05-11T23:00:00Z',
    section: 'Tech',
    tags: ['GitLab', 'Agentic AI', 'Tech Layoffs', 'DevOps', 'Bill Staples'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitLab Restructuring May 2026 | 60 Teams, 3 Layers Cut, Agentic AI Pivot',
    description:
      'GitLab cuts countries, flattens management, doubles R&D teams to 60, retires CREDIT values. CEO: once-in-a-generation repositioning. Voluntary window closes May 18.',
  },
};

export default function GitLabRestructuringMay2026Page() {
  return (
    <NewsArticleDB slug="tech-news-gitlab-restructuring-may-2026-workforce-agentic-ai-pivot" />
  );
}
