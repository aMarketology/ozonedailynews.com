'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const HISTORY_KEY = 'ow_reading_history';

interface LocalHistoryEntry {
  slug: string;
  title: string;
  url: string;
  image?: string;
  category?: string;
  ts: number;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<LocalHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl font-black text-gray-900 mb-2">Reading history</h1>
      <p className="text-sm text-gray-500 mb-8">
        Articles you&apos;ve opened on this device. Sign in to sync across devices when server history is enabled.
      </p>

      {entries.length === 0 ? (
        <p className="text-gray-600 text-sm">
          No articles yet.{' '}
          <Link href="/" className="text-blue-600 hover:underline">
            Browse the latest news
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
          {entries.map((e) => (
            <li key={`${e.slug}-${e.ts}`}>
              <Link
                href={e.url.startsWith('/') ? e.url : new URL(e.url).pathname}
                className="block px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-900 text-sm">{e.title}</p>
                {e.category && (
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{e.category}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(e.ts).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
