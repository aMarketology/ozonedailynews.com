import Link from 'next/link';
import type { TopicTagType } from '@/components/articles/NewsArticle';

// ─────────────────────────────────────────────────────────────────────────────
// HUB MAP
// Maps category + topicTag → hub URL, display label, accent color classes
// ─────────────────────────────────────────────────────────────────────────────

interface HubEntry {
  href: string;
  label: string;
  /** Tailwind border + text color classes */
  accent: string;
  emoji: string;
}

const TOPIC_TAG_MAP: Partial<Record<TopicTagType, HubEntry>> = {
  gaming:         { href: '/video-games',  label: 'Video Games',    accent: 'border-purple-500 text-purple-600 dark:text-purple-400', emoji: '🎮' },
  crypto:         { href: '/crypto',       label: 'Crypto',         accent: 'border-green-500  text-green-600  dark:text-green-400',  emoji: '₿'  },
  ai:             { href: '/tech',         label: 'Tech & AI',      accent: 'border-blue-500   text-blue-600   dark:text-blue-400',   emoji: '🤖' },
  technology:     { href: '/tech',         label: 'Tech',           accent: 'border-blue-500   text-blue-600   dark:text-blue-400',   emoji: '💻' },
  finance:        { href: '/finance',      label: 'Finance',        accent: 'border-yellow-500 text-yellow-600 dark:text-yellow-400', emoji: '📈' },
  entertainment:  { href: '/entertainment',label: 'Entertainment',  accent: 'border-orange-500 text-orange-600 dark:text-orange-400', emoji: '🎬' },
  sports:         { href: '/mls',          label: 'MLS',            accent: 'border-green-600  text-green-700  dark:text-green-400',  emoji: '⚽' },
};

/** Category string → hub. Used as fallback when topicTag is absent or unmapped. */
const CATEGORY_MAP: Record<string, HubEntry> = {
  'Gaming':        TOPIC_TAG_MAP.gaming!,
  'gaming':        TOPIC_TAG_MAP.gaming!,
  'Crypto':        TOPIC_TAG_MAP.crypto!,
  'crypto':        TOPIC_TAG_MAP.crypto!,
  'Tech':          TOPIC_TAG_MAP.technology!,
  'Technology':    TOPIC_TAG_MAP.technology!,
  'technology':    TOPIC_TAG_MAP.technology!,
  'AI':            TOPIC_TAG_MAP.ai!,
  'Finance':       TOPIC_TAG_MAP.finance!,
  'finance':       TOPIC_TAG_MAP.finance!,
  'Entertainment': TOPIC_TAG_MAP.entertainment!,
  'entertainment': TOPIC_TAG_MAP.entertainment!,
  'Sports':        TOPIC_TAG_MAP.sports!,
  'sports':        TOPIC_TAG_MAP.sports!,
  'Influencer':    { href: '/influencer', label: 'Influencer', accent: 'border-pink-500 text-pink-600 dark:text-pink-400', emoji: '⭐' },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface HubBacklinkProps {
  category: string;
  topicTag?: TopicTagType;
}

/**
 * HubBacklink — compact sidebar banner linking the current article back to its
 * parent hub page. Renders above <RelatedArticles> in the sticky sidebar.
 * Returns null if no hub exists for this category/topicTag so it's always safe
 * to render unconditionally.
 */
export function HubBacklink({ category, topicTag }: HubBacklinkProps) {
  const hub =
    (topicTag && TOPIC_TAG_MAP[topicTag]) ??
    CATEGORY_MAP[category] ??
    null;

  if (!hub) return null;

  return (
    <div className={`mb-4 border-l-4 ${hub.accent.split(' ')[0]} bg-white dark:bg-gray-900 rounded-r-lg p-3 shadow-sm`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        Coverage Hub
      </p>
      <Link
        href={hub.href}
        className={`flex items-center gap-1.5 ${hub.accent.split(' ').slice(1).join(' ')} font-semibold text-sm hover:underline`}
      >
        <span className="text-base leading-none">{hub.emoji}</span>
        <span>All {hub.label} Coverage</span>
        <svg className="w-3 h-3 ml-auto flex-shrink-0 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6h8M7 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
