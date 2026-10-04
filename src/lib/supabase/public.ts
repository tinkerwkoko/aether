/**
 * Cookie-less Supabase client for public, anonymous catalogue reads.
 *
 * No session is persisted and no cookies are touched, which is what keeps the
 * shop and product pages statically renderable. It only ever uses the public
 * URL and the browser-safe anon key, so RLS is what authorises these reads.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Throws naming the missing variable only. Values are never logged or printed.
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }

  return value;
}

export function createPublicSupabaseClient(): SupabaseClient {
  if (cached) return cached;

  cached = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  return cached;
}
