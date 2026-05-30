'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import UserProfile from '@/components/user/UserProfile';

export default function AuthNav() {
  const { isAuth, loading, signIn, signUp } = useAuth();

  if (loading) {
    return (
      <div
        className="h-9 w-24 rounded-full bg-gray-100 animate-pulse"
        aria-hidden
      />
    );
  }

  if (isAuth) {
    return <UserProfile />;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <Link
        href="/newsletter"
        className="hidden sm:inline text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        Newsletter
      </Link>
      <button
        type="button"
        onClick={signIn}
        className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5"
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={signUp}
        className="text-xs font-bold uppercase tracking-wider bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-700 transition-colors"
      >
        Sign up
      </button>
    </div>
  );
}
