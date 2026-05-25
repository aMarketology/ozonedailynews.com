// lib/supabase/server.ts
// Server-side Supabase client — used in Server Components, API routes, article-service.
// Uses the anon key (safe for published-row reads via RLS).
// For admin writes, use SUPABASE_SERVICE_ROLE_KEY (never NEXT_PUBLIC_).

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

export function createServiceClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}
