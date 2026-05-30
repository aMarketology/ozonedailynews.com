// =============================================================================
// useAuth — Unified auth hook backed by Supabase
//
// Replaces next-auth's useSession() in engagement components.
// Returns { user, email, isAuth, loading, signIn, signOut }.
// =============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createAuthBrowserClient } from '@/lib/supabase/client';
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
  /** Redirect to sign-up on the login page */
  signUp: () => void;
  /** Sign the user out via Supabase and reload */
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip during SSR / static prerender — auth is client-only
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = createAuthBrowserClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      supabase.auth.getUser()
        .then(({ data }) => {
          setUser(data.user ?? null);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        },
      );

      unsubscribe = () => subscription.unsubscribe();
    } catch {
      // Auth initialisation failed — degrade gracefully (user stays unauthenticated)
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  const authRedirect = useCallback((mode?: 'signup') => {
    const returnUrl = typeof window !== 'undefined' ? window.location.href : '/';
    const modeParam = mode === 'signup' ? '&mode=signup' : '';
    window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}${modeParam}`;
  }, []);

  const signIn = useCallback(() => authRedirect(), [authRedirect]);
  const signUp = useCallback(() => authRedirect('signup'), [authRedirect]);

  const signOut = useCallback(async () => {
    const supabase = createAuthBrowserClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/';
  }, []);

  return {
    user,
    email:  user?.email ?? null,
    isAuth: !!user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
