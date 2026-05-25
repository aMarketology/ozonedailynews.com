import type { Metadata } from 'next';
import { NewsArticleDB } from '@/components/articles/NewsArticleDB';

// Page renders dynamically — content fetched from Supabase at request time.
// Run 'npm run wiki:publish -- --file <path>' to update content in Supabase.


const SLUG = '/google/news/turboquant-llm-kv-cache-compression';
const ARTICLE_URL = `https://www.ozonenetwork.news${SLUG}`;
const OG_IMAGE = 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=675&fit=crop';

export const metadata: Metadata = {
  title: 'TurboQuant KV Cache Compression | 6x Memory, 8x Speed',
  description:
    'Google Research TurboQuant cuts LLM KV cache memory 6x and attention speed 8x at 3 bits per value with zero accuracy loss, no retraining. PolarQuant plus',
  keywords: [
    'TurboQuant KV cache compression',
    'LLM KV cache memory reduction',
    'PolarQuant polar coordinate quantization',
    'QJL Quantized Johnson-Lindenstrauss transform',
    'Google Research LLM compression 2026',
    'training-free KV cache quantization',
    'data-oblivious quantization LLM',
    'GPU VRAM LLM inference bottleneck',
    'ICLR 2026 PolarQuant paper',
    'AISTATS 2026 QJL paper',
    'long context LLM memory optimization',
    '3-bit KV cache quantization accuracy',
    '70B parameter model VRAM usage',
    'attention speedup 8x LLM inference',
    'KV cache 40GB VRAM 100K tokens',
    'Flash Attention vs TurboQuant',
    'calibration-free LLM compression',
    'Google AI infrastructure research',
  ],
  alternates: {
    canonical: ARTICLE_URL,
  },
  openGraph: {
    title: 'TurboQuant KV Cache Compression | 6x Memory, 8x Speed',
    description:
      'Google Research TurboQuant compresses LLM KV caches 6x and speeds attention 8x at 3 bits per value. Training-free, calibration-free, zero accuracy loss.',
    type: 'article',
    url: ARTICLE_URL,
    siteName: 'OzoneNews',
    authors: ['Jack Wang'],
    publishedTime: '2026-03-25T09:00:00Z',
    modifiedTime: '2026-04-01T09:00:00Z',
    section: 'Tech',
    tags: ['Google Research', 'TurboQuant', 'PolarQuant', 'QJL', 'LLM', 'KV Cache', 'ICLR 2026', 'AISTATS 2026'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurboQuant | Google Cuts LLM Memory 6x, Speeds Attention 8x',
    description:
      '3 bits per value, zero accuracy loss, no retraining. TurboQuant is the biggest KV cache breakthrough since Flash Attention.',
  },
};

export default function GoogleNewsTurboquantLlmKvCacheCompressionPage() {
  return <NewsArticleDB slug="google-news-turboquant-llm-kv-cache-compression" />;
}
