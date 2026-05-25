'use client';

/**
 * RelatedArticles â€” Client Component
 *
 * Personalized sidebar. Pulls candidates from all three article tables
 * (`articles`, `jack_articles`, `creator_articles`) and ranks each by a
 * multi-signal score:
 *
 *   score = directTagOverlap     Ã— 5   (tags shared with current article)
 *         + historyTagScore      Ã— 2   (quality-weighted tag affinity from history)
 *         + historyCategoryScore Ã— 1   (quality-weighted category affinity)
 *         + sameCategoryBonus    Ã— 2   (matches current article's category)
 *         + recencyBonus               (newer articles get a small lift)
 *
 * History weighting (per entry):
 *   weight = ageDecay Ã— readQuality Ã— sessionBoost
 *
 *   ageDecay     = 0.5 ^ (ageDays / 7)          â€” 7-day half-life
 *   readQuality  = (0.3 + 0.7 Ã— scrollDepth)    â€” deep reads count more
 *                Ã— clamp(1 + log1p(dwellSecs/60), 1, 2.5)
 *                                                â€” longer dwell = stronger signal
 *   sessionBoost = ageDays < 0.021 ? 3 : 1      â€” last 30 min gets Ã—3
 *
 * After scoring, diversity injection always guarantees at least 2 results from
 * a different category, regardless of reading streak length.
 *
 * Reason labels ("For you" / "Similar") reflect which signal dominated.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ArticleRow {
  slug:          string;
  title:         string;
  category:      string;
  publish_date:  string;
  published_at?: string;
  thumbnail_src?: string;
  tags?:         string[];
  url?:          string;
}

interface ScoredArticle extends ArticleRow {
  _score:       number;
  _publishedMs: number;
  _reason:      'similar' | 'foryou' | 'discovery' | 'streak';
  _trending:    boolean;
}

/** Persisted preference profile — rebuilt from history and cached with a TTL. */
interface UserPrefs {
  /** Normalized 0-1 quality-weighted affinity per category. Sums to 1. */
  catScores:    Record<string, number>;
  /** Normalized 0-1 quality-weighted affinity per tag. Sums to 1. */
  tagScores:    Record<string, number>;
  /** Average dwell time (seconds) per category — used to predict engagement. */
  catDwellAvg:  Record<string, number>;
  /** Category the user is currently on a reading streak for (null = no streak). */
  streakCategory: string | null;
  /** Length of the current streak. */
  streakCount:    number;
  updatedAt:      number;
}

interface Props {
  currentSlug: string;
  category:    string;
  tags?:       string[];
}

interface HistoryEntry {
  slug:         string;
  title?:       string;
  url?:         string;
  image?:       string;
  category?:    string;
  tags?:        string[];
  ts?:          number;
  scrollDepth?: number;  // 0â€“1 written by ArticleViewTracker
  dwellMs?:     number;  // visible dwell in ms
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const HISTORY_KEY    = 'ow_reading_history';
const PREFS_KEY      = 'ow_user_prefs';
const MAX_RESULTS    = 8;
// How many "discovery" (different-category) slots to guarantee in final results
const DISCOVERY_SLOTS  = 2;
const PER_TABLE      = 50;   // fetch more candidates so preference-scoring has room to work
const HALF_LIFE_DAYS = 7;
const DAY_MS         = 24 * 60 * 60 * 1000;
const SESSION_WINDOW = 0.021; // 30 min in days
const PREFS_TTL_MS   = 30 * 60 * 1000; // rebuild prefs every 30 min
const TRENDING_DAYS  = 7;    // articles published within this window get a "Trending" badge

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Build a quality-weighted tag/category interest map from reading history.
 *
 * Weight per entry = ageDecay Ã— readQuality Ã— sessionBoost
 *   readQuality = (0.3 + 0.7 Ã— scrollDepth) Ã— clamp(1 + log1p(dwellSecs/60), 1, 2.5)
 *   sessionBoost = 3Ã— if read within last 30 minutes
 */
function buildInterestProfile(history: HistoryEntry[]) {
  const tagWeights      = new Map<string, number>();
  const categoryWeights = new Map<string, number>();
  const now = Date.now();

  for (const entry of history) {
    const ageDays    = entry.ts ? (now - entry.ts) / DAY_MS : 7;
    const ageDecay   = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);

    // Read quality: scroll depth signal
    const scrollDepth = entry.scrollDepth ?? 0.5; // default 0.5 for legacy entries
    const scrollFactor = 0.3 + 0.7 * scrollDepth;

    // Read quality: dwell time signal â€” log curve so 5 min â‰ˆ 1.8Ã—, 10 min â‰ˆ 2.4Ã—
    const dwellSecs  = entry.dwellMs ? entry.dwellMs / 1000 : 60;
    const dwellBoost = Math.min(2.5, 1 + Math.log1p(dwellSecs / 60));

    // Session boost: very recent reads are strong intent signals
    const sessionBoost = ageDays < SESSION_WINDOW ? 3 : 1;

    const weight = ageDecay * scrollFactor * dwellBoost * sessionBoost;

    for (const t of entry.tags ?? []) {
      tagWeights.set(t, (tagWeights.get(t) ?? 0) + weight);
    }
    if (entry.category) {
      categoryWeights.set(entry.category, (categoryWeights.get(entry.category) ?? 0) + weight);
    }
  }

  return { tagWeights, categoryWeights };
}

/**
 * Build (or return cached) a persistent user preference profile.
 *
 * Captures:
 *   - Normalized category and tag affinity (0-1, sums to 1) — where does the user
 *     spend their reading time quality across all history?
 *   - Per-category average dwell seconds — predicts future engagement.
 *   - Streak detection — 2+ consecutive recent reads in the same category.
 *
 * Cached in localStorage as `ow_user_prefs` with a 30-minute TTL so it stays
 * fresh within a session but doesn't recompute on every page load.
 */
function buildPreferenceProfile(history: HistoryEntry[]): UserPrefs {
  // Return cached profile if still fresh
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const cached: UserPrefs = JSON.parse(raw);
      if (Date.now() - (cached.updatedAt ?? 0) < PREFS_TTL_MS) return cached;
    }
  } catch {}

  const catRaw        = new Map<string, number>();
  const tagRaw        = new Map<string, number>();
  const catDwellSum   = new Map<string, number>();
  const catDwellCount = new Map<string, number>();
  const now = Date.now();

  for (const entry of history) {
    const ageDays    = entry.ts ? (now - entry.ts) / DAY_MS : 30;
    const ageDecay   = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    const scrollDepth = entry.scrollDepth ?? 0.5;
    const dwellSecs  = entry.dwellMs ? entry.dwellMs / 1000 : 60;
    const dwellBoost = Math.min(2.5, 1 + Math.log1p(dwellSecs / 60));
    const quality = ageDecay * (0.3 + 0.7 * scrollDepth) * dwellBoost;

    if (entry.category) {
      catRaw.set(entry.category, (catRaw.get(entry.category) ?? 0) + quality);
      catDwellSum.set(entry.category, (catDwellSum.get(entry.category) ?? 0) + dwellSecs);
      catDwellCount.set(entry.category, (catDwellCount.get(entry.category) ?? 0) + 1);
    }
    for (const t of entry.tags ?? []) tagRaw.set(t, (tagRaw.get(t) ?? 0) + quality);
  }

  // Normalize so scores represent share-of-attention (0–1)
  const catTotal = [...catRaw.values()].reduce((a, b) => a + b, 0) || 1;
  const tagTotal = [...tagRaw.values()].reduce((a, b) => a + b, 0) || 1;

  const catScores: Record<string, number> = {};
  for (const [k, v] of catRaw) catScores[k] = v / catTotal;

  const tagScores: Record<string, number> = {};
  for (const [k, v] of tagRaw) tagScores[k] = v / tagTotal;

  // Per-category average dwell (seconds) — used for predicted engagement
  const catDwellAvg: Record<string, number> = {};
  for (const [k, sum] of catDwellSum) catDwellAvg[k] = sum / (catDwellCount.get(k) ?? 1);

  // Streak: find the longest run of the same category in recent reads
  const recent = [...history]
    .filter((e) => e.ts)
    .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
    .slice(0, 8);

  let streakCategory: string | null = null;
  let streakCount = 0;
  if (recent.length >= 2 && recent[0]?.category) {
    const cat = recent[0].category;
    for (const e of recent) {
      if (e.category === cat) streakCount++;
      else break;
    }
    if (streakCount >= 2) streakCategory = cat;
  }

  const prefs: UserPrefs = { catScores, tagScores, catDwellAvg, streakCategory, streakCount, updatedAt: now };
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
  return prefs;
}

async function fetchTable(
  table: 'articles' | 'jack_articles' | 'creator_articles',
  cols:  string,
): Promise<ArticleRow[]> {
  const params = new URLSearchParams({
    select: cols,
    order:  'published_at.desc',
    limit:  String(PER_TABLE),
  });
  if (table !== 'jack_articles') params.set('status', 'eq.published');
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
      {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
        cache: 'no-store',
      },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function RelatedArticles({ currentSlug, category, tags = [] }: Props) {
  const [articles,           setArticles]           = useState<ScoredArticle[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [hasPersonalization,  setHasPersonalization]  = useState(false);

  useEffect(() => {
    async function load() {
      const history = getHistory().filter((h) => h.slug !== currentSlug);
      const { tagWeights, categoryWeights } = buildInterestProfile(history);
      const prefs = buildPreferenceProfile(history);
      const hasPrefs = history.length >= 3; // need minimum history to trust preference profile
      const currentTagSet = new Set(tags);

      // Global average dwell across all categories (used for engagement prediction)
      const dwellValues = Object.values(prefs.catDwellAvg);
      const globalAvgDwell = dwellValues.length
        ? dwellValues.reduce((a, b) => a + b, 0) / dwellValues.length
        : 60;

      const [news, jack, creators] = await Promise.all([
        fetchTable('articles',         'slug,title,category,publish_date,published_at,thumbnail_src,tags,url'),
        fetchTable('jack_articles',    'slug,title,category,publish_date,published_at,thumbnail_src,tags,url'),
        fetchTable('creator_articles', 'slug,title,category,publish_date,published_at,thumbnail_src,tags,url'),
      ]);

      const rawMerged = [...news, ...jack, ...creators].filter(
        (r) => r.slug !== currentSlug && r.url,
      );

      // Deduplicate by slug
      const seen = new Set<string>();
      const unique = rawMerged.filter((r) => {
        if (seen.has(r.slug)) return false;
        seen.add(r.slug);
        return true;
      });

      const nowMs = Date.now();

      const scored: ScoredArticle[] = unique.map((r) => {
        const rowTags    = r.tags ?? [];
        const publishedMs = r.published_at ? new Date(r.published_at).getTime() : 0;

        // Signal 1: direct tag overlap with current article
        const directOverlap = rowTags.filter((t) => currentTagSet.has(t)).length;

        // Signal 2: history tag affinity (quality-weighted raw scores)
        let historyTagScore = 0;
        for (const t of rowTags) historyTagScore += tagWeights.get(t) ?? 0;

        // Signal 3: history category affinity (quality-weighted raw score)
        const historyCatScore = categoryWeights.get(r.category) ?? 0;

        // Signal 4: same category as current article
        const sameCategory = r.category === category ? 1 : 0;

        // Signal 5: recency bonus (max 0.5, fades over 30 days)
        const ageDays      = publishedMs ? (nowMs - publishedMs) / DAY_MS : 30;
        const recencyBonus = Math.max(0, 1 - ageDays / 30) * 0.5;

        // Signal 6: normalized category preference — share of total reading attention
        // e.g. 0.6 means 60% of all quality reading time was in this category
        const prefCatScore = hasPrefs ? (prefs.catScores[r.category] ?? 0) : 0;

        // Signal 7: normalized tag preference — share of tag attention
        let prefTagScore = 0;
        if (hasPrefs) {
          for (const t of rowTags) prefTagScore += (prefs.tagScores[t] ?? 0);
        }

        // Signal 8: predicted engagement multiplier
        // If the user historically dwells 2× longer in this category, boost by up to 2×
        const catAvgDwell = prefs.catDwellAvg[r.category] ?? globalAvgDwell;
        const engagementPredict = hasPrefs ? Math.min(2, catAvgDwell / globalAvgDwell) : 1;

        // Streak multiplier: user is currently on a run in this category
        // streakCount 2 = 1.2×, 3 = 1.4×, 4+ = 1.6× (capped)
        const streakMult = (hasPrefs && prefs.streakCategory === r.category)
          ? 1 + Math.min(0.6, prefs.streakCount * 0.2)
          : 1;

        const baseScore =
          directOverlap   * 3 +   // similarity to current article (supporting signal)
          historyTagScore * 2 +   // raw tag overlap with history
          historyCatScore * 1 +   // raw category overlap with history
          prefCatScore    * 6 +   // PRIMARY: share of attention in this category
          prefTagScore    * 4 +   // PRIMARY: share of attention on these tags
          sameCategory    * 1 +   // light same-category nudge
          recencyBonus;           // freshness

        const score = baseScore * engagementPredict * streakMult;

        // Reason label: which signal dominated?
        const prefScore    = prefCatScore * 6 + prefTagScore * 4;
        const histScore    = historyTagScore * 2 + historyCatScore;
        const simScore     = directOverlap * 3 + sameCategory;
        const isOnStreak   = hasPrefs && prefs.streakCategory === r.category && prefs.streakCount >= 3;

        const reason: ScoredArticle['_reason'] =
          isOnStreak                         ? 'streak'  :
          prefScore > simScore               ? 'foryou'  :
          histScore > simScore               ? 'foryou'  :
                                               'similar';

        const _trending = publishedMs > 0 && (nowMs - publishedMs) / DAY_MS <= TRENDING_DAYS;

        return { ...r, _score: score, _publishedMs: publishedMs, _reason: reason, _trending };
      });

      // Sort by score desc, then recency
      scored.sort((a, b) => {
        const sd = b._score - a._score;
        return sd !== 0 ? sd : b._publishedMs - a._publishedMs;
      });

      // â”€â”€ Diversity injection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // If the top MAX_RESULTS are all from the same category, swap the last
      // slot with the best article from a different category.
      // Always guarantee DISCOVERY_SLOTS articles from a different category so
      // readers on a streak still see content from other topic areas.
      const topN = scored.slice(0, MAX_RESULTS);
      const topSlugs = new Set(topN.map((a) => a.slug));
      const dominantCategory = topN[0]?.category;

      const discoveryPool = scored.filter(
        (a) => a.category !== dominantCategory && !topSlugs.has(a.slug),
      );

      // Count how many different categories are already represented
      const existingCategories = new Set(topN.map((a) => a.category));
      const diversityNeeded = Math.max(0, DISCOVERY_SLOTS - (existingCategories.size - 1));

      for (let i = 0; i < diversityNeeded && discoveryPool.length > 0; i++) {
        const pick = discoveryPool.shift()!;
        const replaceIdx = MAX_RESULTS - 1 - i;
        if (replaceIdx > 0) {
          topN[replaceIdx] = { ...pick, _reason: 'discovery' };
          topSlugs.add(pick.slug);
        }
      }

      setArticles(topN);
      setHasPersonalization(hasPrefs);
      setLoading(false);
    }

    load();
  }, [currentSlug, category, tags]);

  // â”€â”€ Loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <aside className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[.15em] text-gray-400 border-b border-gray-200 pb-2 mb-3">
          Related
        </h3>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </aside>
    );
  }

  if (!articles.length) return null;

  // Dynamic header: reflect what's actually showing
  const dominantCat = articles[0]?.category ?? category;
  const streakActive = articles.some((a) => a._reason === 'streak');
  const forYouActive = articles.some((a) => a._reason === 'foryou');
  const sidebarLabel = streakActive
    ? `More ${dominantCat}`
    : forYouActive
    ? 'For You'
    : hasPersonalization
    ? `More in ${dominantCat}`
    : 'Related';

  return (
    <aside>
      <h3 className="text-[10px] font-black uppercase tracking-[.15em] text-gray-400 border-b border-gray-200 pb-2 mb-4">
        {sidebarLabel}
      </h3>
      <ul className="space-y-4">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link href={a.url ?? `/${a.slug}`} className="group block">
              {a.thumbnail_src && (
                <div className="w-full aspect-video overflow-hidden rounded mb-1.5">
                  <img
                    src={a.thumbnail_src}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">
                  {a.category}
                </span>
                {a._trending && a._reason !== 'discovery' && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-sky-500">
                    · Trending
                  </span>
                )}
                {a._reason === 'foryou' && !a._trending && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-violet-500">
                    · For you
                  </span>
                )}
                {a._reason === 'streak' && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500">
                    · Keep reading
                  </span>
                )}
                {a._reason === 'discovery' && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500">
                    · Explore
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-900 leading-snug group-hover:underline mt-0.5">
                {a.title}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{a.publish_date}</p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

