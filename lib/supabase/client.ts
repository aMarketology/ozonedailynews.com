'use client';
// lib/supabase/client.ts
// Browser-side Supabase clients.
// createBrowserClient()     — anonymous reads + anon-allowed writes (reactions, saves)
// createAuthBrowserClient() — auth-aware: used in admin editor, session sync

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export function createAuthBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSSRBrowserClient(url, key);
}
