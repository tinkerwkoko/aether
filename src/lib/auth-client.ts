"use client";

/**
 * Browser-side auth state.
 *
 * The header and the Save icons need to know whether someone is signed in
 * without making every page dynamic. So this mirrors the cart store: a small
 * external store read through useSyncExternalStore, with a neutral server
 * snapshot. No setState happens inside an effect body.
 */

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthStatus = "loading" | "signed-in" | "signed-out";

export type AuthSnapshot = {
  status: AuthStatus;
  user: User | null;
};

/** Neutral until the session has actually resolved, so nothing shifts. */
const LOADING: AuthSnapshot = { status: "loading", user: null };

let snapshot: AuthSnapshot = LOADING;
let started = false;
const listeners = new Set<() => void>();

function publish(next: AuthSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function start() {
  if (started) return;
  started = true;

  const supabase = createSupabaseBrowserClient();

  // Resolve the existing session first, then follow changes.
  void supabase.auth.getSession().then(({ data }) => {
    publish(
      data.session
        ? { status: "signed-in", user: data.session.user }
        : { status: "signed-out", user: null },
    );
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    publish(
      session
        ? { status: "signed-in", user: session.user }
        : { status: "signed-out", user: null },
    );
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthSnapshot {
  return snapshot;
}

function getServerSnapshot(): AuthSnapshot {
  return LOADING;
}

/** Current auth state. Stays "loading" until the session is known. */
export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Starts a Google sign-in. Only the browser Supabase client is used, and no
 * password is ever handled: Google OAuth happens on Supabase's side.
 */
export async function signInWithGoogle(nextPath: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    throw new Error("We couldn't sign you in. Please try again.");
  }
}