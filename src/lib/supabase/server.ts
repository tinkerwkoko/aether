/**
 * Request-scoped Supabase client for authenticated server reads.
 *
 * Uses the cookie jar Supabase Auth writes, so the signed-in user is available
 * to server components and server actions. This is the Stage 6 entry point; the
 * catalogue does not use it, because public reads use the cookie-less client.
 *
 * Deliberately uses the anon key, never the service-role key: RLS remains the
 * authorisation boundary for anything this client can do.
 */

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }

  return value;
}

export async function createSupabaseServerClient() {
  // Next 16 makes cookies() async, so it must be awaited before it is used.
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot always write cookies. Sessions are
            // refreshed by Server Actions and middleware instead, so this is
            // safe to ignore rather than fatal.
          }
        },
      },
    },
  );
}
