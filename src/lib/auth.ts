/**
 * Server-side authorisation.
 *
 * Every protected page calls requireUser, which verifies the session on the
 * server using getUser(). A user id supplied by the browser is never trusted.
 * Deliberately server-only: importing this from a client component would leak
 * the session.
 */

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The signed-in user, or null. Cached per request so several calls in one render
 * only hit Supabase once.
 */
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("[aether] session verification failed:", error.message);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("[aether] session verification failed:", error);
    return null;
  }
});

/**
 * Requires a signed-in user, redirecting to /login otherwise.
 * Pass the path the user was trying to reach so they land back there.
 */
export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}