'use client';

// =============================================================================
// NewsletterDropdown — Header nav newsletter preferences panel
//
// Desktop: click "Newsletter ▾" to open a panel below the nav
// Mobile: rendered inline inside MobileNav
//
// Features:
//   • Topic toggles (Finance, Tech, Breaking News, etc.)
//   • Frequency selector (Daily Digest / Weekly Roundup)
//   • Email input for non-signed-in users
//   • Preferences persisted to localStorage (ow_newsletter_prefs)
//   • GA4 event fired on subscribe / update
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { tracking } from '@/lib/tracking';

const TOPICS = [
  { id: 'finance',       label: 'Finance & Markets',  icon: '💰' },
  { id: 'tech',          label: 'Tech & AI',           icon: '💻' },
  { id: 'breaking',      label: 'Breaking News',        icon: '🔴' },
  { id: 'entertainment', label: 'Entertainment',        icon: '🎬' },
  { id: 'sports',        label: 'Sports & Gaming',      icon: '🏆' },
  { id: 'world',         label: 'World Affairs',        icon: '🌍' },
] as const;

type TopicId = typeof TOPICS[number]['id'];
type Frequency = 'daily' | 'weekly';

interface NewsletterPrefs {
  email: string;
  topics: TopicId[];
  frequency: Frequency;
  subscribed: boolean;
}

const STORAGE_KEY = 'ow_newsletter_prefs';

function loadPrefs(): NewsletterPrefs {
  if (typeof window === 'undefined') return { email: '', topics: ['finance', 'tech', 'breaking'], frequency: 'weekly', subscribed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NewsletterPrefs;
  } catch { /* ignore */ }
  return { email: '', topics: ['finance', 'tech', 'breaking'], frequency: 'weekly', subscribed: false };
}

function savePrefs(prefs: NewsletterPrefs): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
}

// ── Shared inner panel (used in both desktop dropdown and mobile inline) ──────

export function NewsletterPanel({ onClose }: { onClose?: () => void }) {
  const { email } = useAuth();
  const [prefs, setPrefs]     = useState<NewsletterPrefs>(loadPrefs);
  const [saved, setSaved]     = useState(false);

  // Pre-fill email from auth session if present and not already set
  useEffect(() => {
    if (email && !prefs.email) {
      setPrefs(p => ({ ...p, email }));
    }
  }, [email]);

  function toggleTopic(id: TopicId) {
    setPrefs(p => ({
      ...p,
      topics: p.topics.includes(id)
        ? p.topics.filter(t => t !== id)
        : [...p.topics, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated = { ...prefs, subscribed: true };
    savePrefs(updated);
    setPrefs(updated);
    tracking.event('newsletter_subscribe', {
      topics:    prefs.topics.join(','),
      frequency: prefs.frequency,
      source:    'header_dropdown',
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose?.();
    }, 2000);
  }

  return (
    <div className="w-80 p-5">
      {/* Header */}
      <div className="mb-4">
        <p className="font-bold text-gray-900 text-[15px]">OzoneNews Newsletter</p>
        <p className="text-xs text-gray-500 mt-0.5">Choose what you want delivered to your inbox.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Topics */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Topics</p>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {TOPICS.map(({ id, label, icon }) => {
            const active = prefs.topics.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleTopic(id)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
                  active
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span>{icon}</span>
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Frequency */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Frequency</p>
        <div className="flex gap-2 mb-4">
          {(['daily', 'weekly'] as Frequency[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setPrefs(p => ({ ...p, frequency: f }))}
              className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all capitalize ${
                prefs.frequency === f
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f === 'daily' ? '📬 Daily Digest' : '📅 Weekly Roundup'}
            </button>
          ))}
        </div>

        {/* Email — autofilled if signed in */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email</p>
        <input
          type="email"
          required
          value={prefs.email}
          onChange={e => setPrefs(p => ({ ...p, email: e.target.value }))}
          placeholder="your@email.com"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={prefs.topics.length === 0}
          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : prefs.topics.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {saved ? '✓ Saved!' : prefs.subscribed ? 'Update Preferences' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

// ── Desktop dropdown wrapper ───────────────────────────────────────────────────

export default function NewsletterDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-sm transition-colors hover:text-black ${
          open ? 'text-black font-semibold' : 'text-gray-600'
        }`}
      >
        Newsletter
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <NewsletterPanel onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
