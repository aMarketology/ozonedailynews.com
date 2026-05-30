'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function SavedPage() {
  const { isAuth, loading, signIn } = useAuth();

  useEffect(() => {
    if (!loading && !isAuth) signIn();
  }, [loading, isAuth, signIn]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
      </main>
    );
  }

  if (!isAuth) return null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl font-black text-gray-900 mb-2">Saved articles</h1>
      <p className="text-sm text-gray-600">
        Use the <strong>Save</strong> button on any article to bookmark it here. Saved items will appear once the saves API is connected to your Supabase project.
      </p>
      <p className="mt-6 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
