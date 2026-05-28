'use client';

import { useState, useId } from 'react';

type Variant = 'footer' | 'inline' | 'page';

interface BeehiivSignupProps {
  variant?: Variant;
  /** Override the default heading */
  heading?: string;
  /** Override the default subtext */
  subtext?: string;
}

const DEFAULTS: Record<Variant, { heading: string; subtext: string }> = {
  footer: {
    heading: 'The Ozone Dispatch',
    subtext: 'Science and space news, every Friday. No noise.',
  },
  inline: {
    heading: 'Stay current with the science.',
    subtext: 'The Ozone Dispatch lands every Friday with the week\'s most important findings.',
  },
  page: {
    heading: 'Subscribe to the Ozone Dispatch',
    subtext:
      'Every Friday: space exploration updates, climate data, atmospheric science, and the week\'s most important science findings. Free, no spam.',
  },
};

export function BeehiivSignup({
  variant = 'footer',
  heading,
  subtext,
}: BeehiivSignupProps) {
  const inputId              = useId();
  const [email, setEmail]    = useState('');
  const [status, setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const h = heading ?? DEFAULTS[variant].heading;
  const s = subtext  ?? DEFAULTS[variant].subtext;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: { success?: boolean; error?: string } = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('You\'re subscribed. Check your inbox for a confirmation.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (variant === 'page') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{h}</h2>
        <p className="mt-2 text-slate-600">{s}</p>
        {status === 'success' ? (
          <p className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <label htmlFor={inputId} className="sr-only">Email address</label>
            <input
              id={inputId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-2 text-xs text-red-600">{message}</p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <aside className="my-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-5">
        <p className="text-sm font-semibold text-blue-900">{h}</p>
        <p className="mt-0.5 text-sm text-blue-700">{s}</p>
        {status === 'success' ? (
          <p className="mt-3 text-sm font-medium text-green-700">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <label htmlFor={inputId} className="sr-only">Email address</label>
            <input
              id={inputId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-0"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-1 text-xs text-red-600">{message}</p>
        )}
      </aside>
    );
  }

  // footer variant
  return (
    <div>
      <p className="text-sm font-semibold text-white">{h}</p>
      <p className="mt-0.5 text-xs text-slate-400">{s}</p>
      {status === 'success' ? (
        <p className="mt-3 text-xs font-medium text-green-400">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <label htmlFor={inputId} className="sr-only">Email address</label>
          <input
            id={inputId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? '...' : 'Join'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-1 text-xs text-red-400">{message}</p>
      )}
    </div>
  );
}
