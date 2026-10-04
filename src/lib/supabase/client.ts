/**
 * Browser Supabase client for client components.
 *
 * Used from Stage 6 for sign-in and session state. Never import this from a
 * server component: use the server or public client instead.
 *
 * The variables are read as literal property accesses on purpose. Next.js only
 * inlines `NEXT_PUBLIC_*` values into the browser bundle when they appear
 * verbatim, so a dynamic `process.env[name]` lookup would be undefined here.
 * Each is checked separately and the error names only the variable, never its
 * value.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. Copy .env.example to .env.local and fill it in.",
    );
  }

  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill it in.",
    );
  }

  return createBrowserClient(url, key);
}
