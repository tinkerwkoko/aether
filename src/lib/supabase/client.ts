/**
 * Browser Supabase client for client components.
 *
 * Used from Stage 6 for sign-in and session state. Never import this from a
 * server component: use the server or public client instead.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}.`);
  }

  return value;
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
