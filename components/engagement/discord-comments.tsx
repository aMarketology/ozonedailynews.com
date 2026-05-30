'use client';

// =============================================================================
// DiscordComments
// =============================================================================
// Commenting requires a Supabase session (Google or Discord OAuth).
//
// ANONYMOUS_COMMENTS flag: set to `true` once Supabase anonymous sign-ins
// are enabled in the dashboard (Authentication → Settings → "Allow anonymous
// sign-ins"). When true, a guest name field appears and no login is needed.
//
// Every comment is saved to discord_comments in Supabase and forwarded to the
// Discord Forum Channel at:
//   https://discord.com/channels/1385068774549360772/1485009785048010934
// =============================================================================

// ─── Feature flag ────────────────────────────────────────────────────────────
// Enabled: guests can comment with just a display name. No account required.
const ANONYMOUS_COMMENTS = true;

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface Comment {
  id: string;
  slug: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  body: string;
  createdAt: string;
}

interface Props {
  slug: string;
  articleTitle?: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DiscordIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── CommentCard ───────────────────────────────────────────────────────────────

function CommentCard({ comment }: { comment: Comment }) {
  const isGuest = comment.discordId.startsWith('guest_') || comment.discordId.startsWith('anon_');
  const isDiscord = !isGuest && comment.discordId.length > 10 && !comment.discordId.includes('@');
  const avatarSrc = comment.discordAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.discordUsername)}&background=${isDiscord ? '5865F2' : isGuest ? '9ca3af' : '6366f1'}&color=fff&size=72`;

  return (
    <div className="flex gap-3 py-4">
      <div className="shrink-0">
        <Image src={avatarSrc} alt={comment.discordUsername} width={36} height={36} className="rounded-full" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{comment.discordUsername}</span>
          {isDiscord ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#5865F2] font-medium">
              <DiscordIcon className="w-3 h-3" /> Discord
            </span>
          ) : isGuest ? (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">Guest</span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-500 font-medium">
              <GoogleIcon className="w-3 h-3" /> Google
            </span>
          )}
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed break-words">{comment.body}</p>
      </div>
    </div>
  );
}

// ── Sign-in Gate ──────────────────────────────────────────────────────────────

function SignInGate({
  onDiscord,
  onGoogle,
  discordLoading,
  googleLoading,
}: {
  onDiscord: () => void;
  onGoogle: () => void;
  discordLoading: boolean;
  googleLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center mb-8">
      <div className="w-10 h-10 rounded-full bg-[#5865F2]/10 flex items-center justify-center mx-auto mb-3">
        <DiscordIcon className="w-5 h-5 text-[#5865F2]" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">Join the discussion</h3>
      <p className="text-xs text-gray-500 mb-1">Sign in for a verified badge, or scroll down to comment as a guest.</p>
      <p className="text-xs text-gray-400 mb-5">Every comment appears live in our Discord server.</p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Discord — preferred */}
        <button
          onClick={onDiscord}
          disabled={discordLoading}
          className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 w-full sm:w-auto justify-center"
        >
          <DiscordIcon className="w-4 h-4" />
          {discordLoading ? 'Connecting…' : 'Sign in with Discord'}
        </button>

        {/* Google account */}
        <button
          onClick={onGoogle}
          disabled={googleLoading}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-lg border border-gray-300 transition-colors disabled:opacity-60 w-full sm:w-auto justify-center shadow-sm"
        >
          <GoogleIcon className="w-4 h-4" />
          {googleLoading ? 'Connecting…' : 'Sign in with Google'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        No account?{' '}
        <button
          onClick={() => {
            // Scroll past this gate to the guest comment form below
            document.getElementById('discord-guest-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-[#5865F2] hover:underline font-medium"
        >
          Comment as guest ↓
        </button>
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DiscordComments({ slug, articleTitle }: Props) {
  const [comments, setComments]             = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // Auth state
  const [user, setUser] = useState<{ id: string; name: string; avatar: string; provider: string } | null>(null);
  const [authLoading, setAuthLoading]       = useState(true);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);

  // Guest mode (only when ANONYMOUS_COMMENTS = true)
  const [guestName, setGuestName] = useState('');

  // Form
  const [draft, setDraft]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const hasMounted = useRef(false);

  // ── On mount: check Supabase session ─────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasMounted.current) return;
    hasMounted.current = true;

    // Restore guest name if anon mode will be used
    if (ANONYMOUS_COMMENTS) {
      try {
        const saved = localStorage.getItem('ow_guest_name');
        if (saved) setGuestName(saved);
      } catch { /* ignore */ }
    }

    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        const provider = u.app_metadata?.provider ?? 'google';
        setUser({
          id:       u.id,
          name:     u.user_metadata?.full_name
                 ?? u.user_metadata?.custom_claims?.global_name
                 ?? u.user_metadata?.name
                 ?? u.email?.split('@')[0]
                 ?? 'User',
          avatar:   u.user_metadata?.avatar_url ?? '',
          provider,
        });
      }
      setAuthLoading(false);
    });

    // Also subscribe to auth changes (e.g. after OAuth redirect back)
    const supabase2 = createBrowserClient();
    const { data: { subscription } } = supabase2.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        const provider = u.app_metadata?.provider ?? 'google';
        setUser({
          id:       u.id,
          name:     u.user_metadata?.full_name
                 ?? u.user_metadata?.custom_claims?.global_name
                 ?? u.user_metadata?.name
                 ?? u.email?.split('@')[0]
                 ?? 'User',
          avatar:   u.user_metadata?.avatar_url ?? '',
          provider,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch comments ────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/discord/comments?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
      }
    } catch { /* silent */ }
    finally { setLoadingComments(false); }
  }, [slug]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  async function handleDiscordLogin() {
    setDiscordLoading(true);
    const supabase = createBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(location.pathname + '#discord-comments')}`,
        scopes: 'identify',
      },
    });
    if (oauthError) {
      setDiscordLoading(false);
      setError('Could not connect Discord. Please try again.');
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const supabase = createBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(location.pathname + '#discord-comments')}`,
      },
    });
    if (oauthError) {
      setGoogleLoading(false);
      setError('Could not connect Google. Please try again.');
    }
  }

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  // ── Submit comment ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || submitting) return;

    // In anon mode, require a guest name
    if (ANONYMOUS_COMMENTS && !user && !guestName.trim()) {
      setError('Enter your name to post.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    if (ANONYMOUS_COMMENTS && !user && guestName.trim()) {
      try { localStorage.setItem('ow_guest_name', guestName.trim()); } catch { /* ignore */ }
    }

    try {
      // If anonymous mode and not yet signed in, create a Supabase anon session first
      if (ANONYMOUS_COMMENTS && !user) {
        const supabase = createBrowserClient();
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError || !anonData.user) {
          setError('Could not create anonymous session. Please try again.');
          setSubmitting(false);
          return;
        }
        // Update local user state so the avatar/name pill shows
        setUser({
          id:       anonData.user.id,
          name:     guestName.trim() || 'Guest',
          avatar:   '',
          provider: 'anonymous',
        });
      }

      const res = await fetch('/api/discord/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          body:         draft.trim(),
          articleTitle,
          // Pass guest name so Discord webhook can display it
          guestName:    (ANONYMOUS_COMMENTS && !user) ? guestName.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to post. Please try again.');
        return;
      }

      const { comment } = await res.json();
      setComments((prev) => [comment, ...prev]);
      setDraft('');
      setSuccessMsg('Comment posted!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const isDiscordUser = user?.provider === 'discord';
  const posterName    = user?.name ?? (ANONYMOUS_COMMENTS ? (guestName.trim() || 'Guest') : 'You');
  const posterAvatar  = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=${isDiscordUser ? '5865F2' : '6366f1'}&color=fff&size=72`;

  // Can post if: logged in OR (anon mode + guest name filled)
  const canPost = !!user || (ANONYMOUS_COMMENTS && !!guestName.trim());

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section id="discord-comments" aria-label="Comments" className="mt-12 border-t border-gray-200 pt-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DiscordIcon className="w-5 h-5 text-[#5865F2]" />
          Discussion
          {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-1">({comments.length})</span>
          )}
        </h2>

        {/* Signed-in pill */}
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <Image
              src={posterAvatar}
              alt={user.name}
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
            <span className="text-gray-700 font-medium hidden sm:inline">{user.name}</span>
            {isDiscordUser
              ? <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
              : <GoogleIcon className="w-3.5 h-3.5" />
            }
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-1"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Discord live-sync nudge — shown above the comment form/gate */}
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[#5865F2]/5 border border-[#5865F2]/15 px-4 py-2.5 mb-5">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2] shrink-0" />
          <span>Comments post live to the <strong className="font-semibold text-gray-800">OzoneNews Discord</strong> server.</span>
        </div>
        <a
          href="https://discord.gg/wBsgkU4uAf"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-semibold text-[#5865F2] hover:text-[#4752C4] hover:underline whitespace-nowrap"
        >
          Join server →
        </a>
      </div>

      {/* Sign-in gate or comment form */}
      {authLoading ? (
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse mb-8" />
      ) : !user && !ANONYMOUS_COMMENTS ? (
        /* ── Locked: must sign in ── */
        <SignInGate
          onDiscord={handleDiscordLogin}
          onGoogle={handleGoogleLogin}
          discordLoading={discordLoading}
          googleLoading={googleLoading}
        />
      ) : (
        /* ── Comment form (logged in OR anon mode) ── */
        <form id="discord-guest-form" onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="shrink-0 pt-0.5">
              <Image src={posterAvatar} alt={posterName} width={36} height={36} className="rounded-full" unoptimized />
            </div>

            <div className="flex-1 space-y-2">
              {/* Guest name — only in anon mode when not logged in */}
              {ANONYMOUS_COMMENTS && !user && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Your name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Alex"
                    maxLength={40}
                    required
                    autoComplete="nickname"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5865F2]/40 focus:border-[#5865F2] transition bg-white"
                  />
                </div>
              )}

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={user ? `Comment as ${user.name}…` : 'Write a comment…'}
                maxLength={1000}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#5865F2]/40 focus:border-[#5865F2] transition"
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-gray-400">{draft.length}/1000</span>
                <button
                  type="submit"
                  disabled={!draft.trim() || submitting || !canPost}
                  className="inline-flex items-center gap-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DiscordIcon className="w-3.5 h-3.5" />
                  {submitting ? 'Posting…' : 'Post'}
                </button>
              </div>

              {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
              {successMsg && (
                <p className="text-xs text-green-600" role="status">
                  {successMsg}{' '}
                  <a href="https://discord.gg/wBsgkU4uAf" target="_blank" rel="noopener noreferrer"
                    className="text-[#5865F2] hover:underline">See it in Discord →</a>
                </p>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Comment list */}
      {loadingComments ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          <DiscordIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p>No comments yet. Be the first to start the conversation.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((c) => <CommentCard key={c.id} comment={c} />)}
        </div>
      )}

      {/* Discord banner */}
      <div className="mt-8 rounded-xl bg-[#5865F2]/5 border border-[#5865F2]/20 p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <DiscordIcon className="w-8 h-8 text-[#5865F2] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Every comment appears live in our Discord server.</p>
            <p className="text-xs text-gray-500 mt-0.5">Join to see the full conversation and connect with the community.</p>
          </div>
        </div>
        <a
          href="https://discord.gg/wBsgkU4uAf"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <DiscordIcon className="w-4 h-4" />
          Join OzoneNews Discord
        </a>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Comments sync to our{' '}
        <a href="https://discord.gg/wBsgkU4uAf" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] hover:underline">
          OzoneNews Discord
        </a>
        {articleTitle ? ` · ${articleTitle}` : ''}.
      </p>
    </section>
  );
}
