// =============================================================================
// useAuth — Unified auth hook backed by Supabase
//
// Replaces next-auth's useSession() in engagement components.
// Returns { user, email, isAuth, loading, signIn, signOut }.
// =============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  /** The Supabase user object, or null if unauthenticated */
  user: User | null;
  /** Convenience shorthand for user.email */
  email: string | null;
  /** True when a user is signed in */
  isAuth: boolean;
  /** True while we're checking the initial session */
  loading: boolean;
  /** Redirect to the login page (preserves current URL as return path) */
  signIn: () => void;
  /** Sign the user out via Supabase and reload */
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    // Check initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(() => {
    const returnUrl = typeof window !== 'undefined' ? window.location.href : '/';
    window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }, []);

  return {
    user,
    email:  user?.email ?? null,
    isAuth: !!user,
    loading,
    signIn,
    signOut,
  };
}
