import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:migrate' to update content in Supabase.


const SLUG = '/tech/news/87-percent-ai-agent-pull-requests-security-flaws-dryrun-report-2026';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`;

export const metadata: Metadata = {
  title:
    '87% of AI Agent Pull Requests Introduce Security Flaws',
  description:
    'A new DryRun Security report tested Claude, Codex, and Gemini building real apps autonomously, 26 of 30 AI-generated pull requests introduced at least one',
  keywords: [
    'AI agent security flaws 2026',
    'DryRun Security agentic coding report',
    '87 percent AI pull requests security vulnerabilities',
    'Claude Codex Gemini security comparison',
    'agentic AI coding security blind',
    'AI code security vulnerabilities high severity',
    'autonomous software development security risk',
    'OpenAI Codex GPT-5 security coding',
    'Anthropic Claude security coding vulnerabilities',
    'AI native development security flaws report',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: '87% of AI Agent Pull Requests Introduce Security Flaws',
    description:
      'DryRun Security tested Claude, Codex, and Gemini building full apps autonomously. 26 of 30 PRs had at least one high-severity security flaw. Claude',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    publishedTime: '2026-03-12T00:00:00Z',
    modifiedTime: '2026-03-12T00:00:00Z',
    section: 'Technology',
    tags: ['AI Security', 'DryRun Security', 'Claude', 'Codex', 'Gemini', 'Agentic AI', 'Developer Tools'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '87% of AI Agent Pull Requests Have High-Severity',
    description:
      'DryRun Security: Claude, Codex, Gemini tested on real apps. 26/30 PRs introduced a high-severity flaw. Claude worst for unresolved issues. Codex cleanest',
  },
};

export default function AIAgentSecurityFlawsPage() {
  return <NewsArticleDB slug="tech-news-87-percent-ai-agent-pull-requests-security-flaws-dryrun-report-2026" />;
}
