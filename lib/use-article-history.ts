// =============================================================================
// useArticleHistory
//
// Client-side hook.
//
//   track(article)  — fire-and-forget POST to record a view.
//   history         — list of past views (fetched on mount when user is logged in).
//   loading         — true while the initial fetch is in-flight.
//
// Only fires when a next-auth session is present.
// =============================================================================

'use client';

import { useAuth }                         from '@/lib/hooks/use-auth';
import { useCallback, useEffect, useState } from 'react';

export interface HistoryEntry {
  article_slug:     string;
  article_title:    string;
  article_url:      string;
  article_image:    string | null;
  article_category: string | null;
  viewed_at:        string;
}

export interface TrackPayload {
  slug:      string;
  title:     string;
  url:       string;
  image?:    string;
  category?: string;
}

export function useArticleHistory() {
  const { isAuth }                    = useAuth();
  const [history, setHistory]     = useState<HistoryEntry[]>([]);
  const [loading, setLoading]     = useState(false);

  const isLoggedIn = isAuth;

  // ── Fetch history on mount (or when the user authenticates) ──────────────
  useEffect(() => {
    if (!isLoggedIn) { setHistory([]); return; }

    let cancelled = false;
    setLoading(true);

    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setHistory(data.history ?? []);
      })
      .catch(() => { /* silently ignore */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isLoggedIn]);

  // ── Track a new view ──────────────────────────────────────────────────────
  const track = useCallback(
    (payload: TrackPayload) => {
      if (!isLoggedIn) return;

      // Optimistic local update so the history panel reflects the new view instantly
      setHistory((prev) => {
        const filtered = prev.filter((e) => e.article_slug !== payload.slug);
        const entry: HistoryEntry = {
          article_slug:     payload.slug,
          article_title:    payload.title,
          article_url:      payload.url,
          article_image:    payload.image ?? null,
          article_category: payload.category ?? null,
          viewed_at:        new Date().toISOString(),
        };
        return [entry, ...filtered].slice(0, 50);
      });

      // Fire-and-forget to server
      fetch('/api/history/track', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }).catch(() => { /* silently ignore */ });
    },
    [isLoggedIn],
  );

  return { history, loading, track, isLoggedIn };
}
