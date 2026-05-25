import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:publish -- --file <path>' to update content in Supabase.


const SLUG = '/google/news/flash-attention-3-vs-turboquant-vs-paged-kv-cache-llm-optimization';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`;
const OG_IMAGE = 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'FlashAttention 3 vs TurboQuant vs Paged KV Cache | LLM Stack',
  description:
    'FlashAttention 3 speeds up attention compute 1.5-2x on H100. TurboQuant compresses KV cache 6x at 3 bits. Paged KV Cache cuts memory waste from 60-80% to',
  keywords: [
    'FlashAttention 3 vs TurboQuant comparison',
    'Paged KV Cache vs FlashAttention',
    'LLM optimization stack 2026',
    'FlashAttention 3 H100 Hopper speedup',
    'TurboQuant KV cache compression Google',
    'PagedAttention vLLM memory management',
    'FlashAttention 3 FP8 throughput',
    'KV cache memory fragmentation solution',
    'LLM inference optimization techniques',
    'FlashAttention vs TurboQuant vs vLLM',
    'Tri Dao FlashAttention 3 Hopper',
    'Google Research TurboQuant PolarQuant QJL',
    'vLLM paged attention memory waste',
    'LLM serving stack architecture 2026',
    'attention compute bottleneck GPU',
    'KV cache 60 percent memory waste',
    'FP8 attention kernel H100',
    'complementary LLM optimization layers',
  ],
  alternates: {
    canonical: ARTICLE_URL,
  },
  openGraph: {
    title: 'FlashAttention 3 vs TurboQuant vs Paged KV Cache | LLM Stack',
    description:
      'Three LLM optimization techniques that solve different bottlenecks and stack together. Compute speed, memory compression, and allocation efficiency',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['Jack Wang'],
    publishedTime: '2026-04-01T14:00:00Z',
    modifiedTime: '2026-04-01T14:00:00Z',
    section: 'Tech',
    tags: ['FlashAttention 3', 'TurboQuant', 'Paged KV Cache', 'LLM', 'vLLM', 'Google Research'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlashAttention 3 vs TurboQuant vs Paged KV Cache',
    description:
      'They don\'t compete, they stack. Attention speed, memory compression, and allocation efficiency explained for production LLM inference.',
  },
};

export default function GoogleNewsFlashAttention3VsTurboquantVsPagedKvCacheLlmOptimizationPage() {
  return <NewsArticleDB slug="google-news-flash-attention-3-vs-turboquant-vs-paged-kv-cache-llm-optimization" />;
}
