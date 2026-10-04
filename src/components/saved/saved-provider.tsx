"use client";

/**
 * Loads the signed-in customer's saved ids once, after auth has resolved.
 *
 * Rendering this in the root layout is safe: it is a client component, so no
 * cookie is read on the server and product pages stay static.
 */

import { useEffect } from "react";

import { useAuth } from "@/lib/auth-client";
import { loadSavedIds } from "@/components/saved/saved-store";

export function SavedProvider() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    loadSavedIds(status === "signed-in");
  }, [status]);

  return null;
}