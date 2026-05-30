'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { BeehiivSignup } from '@/components/newsletter/BeehiivSignup';

export default function AccountPage() {
  const { user, isAuth, loading, signIn, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !isAuth) signIn();
  }, [loading, isAuth, signIn]);

  if (loading || !isAuth || !user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
      </main>
    );
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? 'Reader';

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl font-black text-gray-900 mb-2">My profile</h1>
      <p className="text-sm text-gray-500 mb-8">Signed in as {user.email}</p>

      <section className="border border-gray-200 rounded-lg p-6 mb-8 bg-white">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Account</h2>
        <p className="text-lg font-semibold text-gray-900">{displayName}</p>
        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/history" className="text-blue-600 hover:underline font-medium">
            Reading history →
          </Link>
          <Link href="/saved" className="text-blue-600 hover:underline font-medium">
            Saved articles →
          </Link>
          <Link href="/newsletter" className="text-blue-600 hover:underline font-medium">
            Newsletter →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-6 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Sign out
        </button>
      </section>

      <section className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
          Ozone Dispatch newsletter
        </h2>
        <BeehiivSignup variant="inline" />
      </section>
    </main>
  );
}
