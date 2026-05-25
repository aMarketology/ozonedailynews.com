'use client';

// =============================================================================
// ReactionBar — Interactive article engagement bar
//
// Buttons: ❤️ Like (+ count)  💬 Comment   Save
//
// • Like & Save are backed by Supabase via /api/likes and /api/saves.
//   State is loaded from the DB on mount whenever a session exists.
//
// • Like count is publicly visible (no auth required to see the number).
//
// • Saves live on the user's profile, viewable at /saved.
//
// • Not signed in → clicking Like or Save triggers Google OAuth and returns
//   the user to the same article after authentication.
//
// Props:
//   slug     — article identifier (defaults to window.location.pathname)
//   title    — article title (defaults to document.title)
//   url      — canonical URL  (defaults to window.location.href)
//   image    — optional hero image for the save card
//   category — optional category label
// =============================================================================

import { useAuth } from '@/lib/hooks/use-auth';
import { useState, useEffect, useCallback } from 'react';
import { tracking } from '@/lib/tracking';

interface ReactionBarProps {
  slug?:     string;
  title?:    string;
  url?:      string;
  image?:    string;
  category?: string;
}

export default function ReactionBar({ slug, title, url, image, category }: ReactionBarProps) {
  const { isAuth, signIn } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [liked,        setLiked]        = useState(false);
  const [likeCount,    setLikeCount]    = useState<number | null>(null);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [saved,        setSaved]        = useState(false);
  const [likeLoading,  setLikeLoading]  = useState(false);
  const [saveLoading,  setSaveLoading]  = useState(false);

  // Resolve keys client-side (only runs in browser)
  const articleKey   = slug  ?? (typeof window   !== 'undefined' ? window.location.pathname : 'unknown');
  const articleTitle = title ?? (typeof document !== 'undefined' ? document.title           : 'Unknown Article');
  const articleUrl   = url   ?? (typeof window   !== 'undefined' ? window.location.href     : '');

  // ── Load like count + user-specific state from DB ─────────────────────────
  useEffect(() => {
    if (articleKey === 'unknown') return;
    fetch(`/api/likes?slug=${encodeURIComponent(articleKey)}`)
      .then((r) => r.json())
      .then((data) => {
        setLikeCount(data.count ?? 0);
        setLiked(!!data.liked);
      })
      .catch(() => {});
  }, [articleKey, isAuth]);

  // Fetch comment count from the Discord comments API (public endpoint)
  useEffect(() => {
    if (articleKey === 'unknown') return;
    fetch(`/api/discord/comments?slug=${encodeURIComponent(articleKey)}`)
      .then((r) => r.json())
      .then((data) => { setCommentCount((data.comments ?? []).length); })
      .catch(() => {});
  }, [articleKey]);

  useEffect(() => {
    if (articleKey === 'unknown') return;
    fetch(`/api/saves?slug=${encodeURIComponent(articleKey)}`)
      .then((r) => r.json())
      .then((data) => { setSaved(!!data.saved); })
      .catch(() => {});
  }, [articleKey, isAuth]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function requireSignIn() {
    signIn();
  }

  // ── Like handler ──────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (!isAuth) { requireSignIn(); return; }
    if (likeLoading) return;
    const next      = !liked;
    const prevCount = likeCount ?? 0;
    setLiked(next);
    setLikeCount(prevCount + (next ? 1 : -1));
    setLikeLoading(true);
    try {
      const res  = await fetch('/api/likes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug: articleKey, title: articleTitle, url: articleUrl }),
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
      tracking.trackArticleReaction('like', articleKey, articleTitle, data.liked ? 'add' : 'remove');
    } catch {
      setLiked(!next);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  }, [isAuth, liked, likeCount, likeLoading, articleKey, articleTitle, articleUrl]);

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!isAuth) { requireSignIn(); return; }
    if (saveLoading) return;
    const next = !saved;
    setSaved(next);
    setSaveLoading(true);
    try {
      const res  = await fetch('/api/saves', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug: articleKey, title: articleTitle, url: articleUrl, image, category }),
      });
      const data = await res.json();
      setSaved(data.saved);
      tracking.trackArticleReaction('save', articleKey, articleTitle, data.saved ? 'add' : 'remove');
    } catch {
      setSaved(!next);
    } finally {
      setSaveLoading(false);
    }
  }, [isAuth, saved, saveLoading, articleKey, articleTitle, articleUrl, image, category]);

  // ── Comment handler ───────────────────────────────────────────────────────
  function handleComment() {
    tracking.trackArticleReaction('comment_click', articleKey, articleTitle, 'add');
    const el = document.getElementById('discord-comments');
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); }
    else    { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="my-10 border-y border-gray-100">
      <div className="flex items-stretch divide-x divide-gray-100">

        {/* Like */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          title={isAuth ? (liked ? 'Unlike' : 'Like this article') : 'Sign in to like'}
          aria-pressed={liked}
          className={`group flex-1 flex flex-col items-center justify-center gap-1.5 py-5 transition-colors duration-150 disabled:opacity-50 ${
            liked
              ? 'bg-red-50 text-red-600'
              : 'bg-white text-gray-500 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 transition-transform duration-150 ${liked ? 'scale-110' : 'group-hover:scale-110'}`}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-xs font-semibold tracking-wide">
            {liked ? 'Liked' : 'Like'}
            {likeCount !== null && likeCount > 0 && (
              <span className="ml-1.5 tabular-nums opacity-70">
                {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
              </span>
            )}
          </span>
        </button>

        {/* Comment — scrolls to Discord comments section */}
        <button
          onClick={handleComment}
          className="group flex-1 flex flex-col items-center justify-center gap-1.5 py-5 bg-white text-gray-500 hover:bg-[#5865F2] hover:text-white transition-colors duration-150"
        >
          {/* Discord mark */}
          <svg className="w-5 h-5 transition-transform duration-150 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="text-xs font-semibold tracking-wide">
            Discuss
            {commentCount !== null && commentCount > 0 && (
              <span className="ml-1.5 tabular-nums opacity-70">
                {commentCount >= 1000 ? `${(commentCount / 1000).toFixed(1)}k` : commentCount}
              </span>
            )}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saveLoading}
          title={isAuth ? (saved ? 'Remove from saved' : 'Save for later') : 'Sign in to save'}
          aria-pressed={saved}
          className={`group flex-1 flex flex-col items-center justify-center gap-1.5 py-5 transition-colors duration-150 disabled:opacity-50 ${
            saved
              ? 'bg-amber-50 text-amber-600'
              : 'bg-white text-gray-500 hover:bg-amber-50 hover:text-amber-500'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 transition-transform duration-150 ${saved ? 'scale-110' : 'group-hover:scale-110'}`}
          >
            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
          <span className="text-xs font-semibold tracking-wide">{saved ? 'Saved' : 'Save'}</span>
        </button>

      </div>
    </div>
  );
}
