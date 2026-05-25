// =============================================================================
// ArticleViewTracker
//
// Drop inside any article page. Records the view in two places:
//   1. localStorage (`ow_reading_history`) — for ALL users, anonymous or
//      signed in. Powers the on-device RelatedArticles ranking algorithm.
//   2. Supabase via /api/history/track — only for signed-in users.
//
// Quality signals tracked per article:
//   - scrollDepth  (0–1): max % of page body scrolled, sampled every 500 ms
//   - dwellMs      (ms):  time page was visible, paused when tab loses focus
// These are flushed to the localStorage entry on visibilitychange / pagehide
// so RelatedArticles can distinguish a deep read from a bounce.
// =============================================================================

'use client';

import { useEffect, useRef } from 'react';
import { useArticleHistory } from '@/lib/use-article-history';

interface Props {
  slug:      string;
  title:     string;
  url:       string;
  image?:    string;
  category?: string;
  tags?:     string[];
}

const HISTORY_KEY = 'ow_reading_history';
const MAX_HISTORY = 30;

interface LocalHistoryEntry {
  slug:        string;
  title:       string;
  url:         string;
  image?:      string;
  category?:   string;
  tags?:       string[];
  ts:          number;
  scrollDepth?: number;   // 0–1, max % scrolled
  dwellMs?:     number;   // visible dwell time in ms
}

function recordLocal(entry: LocalHistoryEntry) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: LocalHistoryEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((e) => e.slug !== entry.slug);
    const next = [entry, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota — fail silently */
  }
}

function updateLocalEntry(slug: string, patch: Partial<LocalHistoryEntry>) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    const list: LocalHistoryEntry[] = JSON.parse(raw);
    const idx = list.findIndex((e) => e.slug === slug);
    if (idx === -1) return;
    list[idx] = { ...list[idx], ...patch };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch { /* fail silently */ }
}

function getScrollDepth(): number {
  const scrollable = document.body.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 1;
  return Math.min(1, window.scrollY / scrollable);
}

export default function ArticleViewTracker({ slug, title, url, image, category, tags }: Props) {
  const { track, isLoggedIn } = useArticleHistory();
  const tracked       = useRef(false);
  const maxScrollRef  = useRef(0);     // max scroll depth seen (0–1)
  const dwellMsRef    = useRef(0);     // accumulated visible dwell time
  const lastVisibleTs = useRef<number | null>(null); // when tab last became visible

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Write the entry immediately (even bounces should be recorded)
    recordLocal({ slug, title, url, image, category, tags, ts: Date.now(), scrollDepth: 0, dwellMs: 0 });

    // Server mirror only when signed in
    if (isLoggedIn) {
      track({ slug, title, url, image, category });
    }

    // ── Dwell timer ────────────────────────────────────────────────────────
    // Start counting when page is visible; pause when tab hides.
    lastVisibleTs.current = document.hidden ? null : Date.now();

    function pauseDwell() {
      if (lastVisibleTs.current !== null) {
        dwellMsRef.current += Date.now() - lastVisibleTs.current;
        lastVisibleTs.current = null;
      }
    }
    function resumeDwell() {
      if (lastVisibleTs.current === null) {
        lastVisibleTs.current = Date.now();
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        pauseDwell();
        flush();
      } else {
        resumeDwell();
      }
    }

    // ── Scroll depth tracker ────────────────────────────────────────────────
    let rafPending = false;
    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const d = getScrollDepth();
        if (d > maxScrollRef.current) maxScrollRef.current = d;
      });
    }

    // ── Flush to localStorage ───────────────────────────────────────────────
    function flush() {
      updateLocalEntry(slug, {
        scrollDepth: maxScrollRef.current,
        dwellMs: dwellMsRef.current + (lastVisibleTs.current ? Date.now() - lastVisibleTs.current : 0),
      });
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush, { once: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('scroll', onScroll);
      pauseDwell();
      flush();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}

