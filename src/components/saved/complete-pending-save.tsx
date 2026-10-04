"use client";

/**
 * Completes a save that was interrupted by sign-in.
 *
 * The sign-in dialog sends the user to /login with ?next=/products/x?save=<id>.
 * After Google returns them here, this calls the same server action and then
 * tidies the URL. It renders nothing.
 *
 * Reads search params, so it must sit inside a Suspense boundary.
 */

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toggleSavedItem } from "@/components/saved/saved-store";
import { useAuth } from "@/lib/auth-client";

export function CompletePendingSave() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useAuth();
  const handled = useRef(false);

  const productId = searchParams.get("save");

  useEffect(() => {
    if (!productId) return;
    if (status !== "signed-in") return;
    if (handled.current) return;
    handled.current = true;

    void toggleSavedItem(productId)
      .catch(() => {
        // The Save icon shows the real state either way; nothing is faked.
      })
      .finally(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("save");
        const query = params.toString();
        router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname);
      });
  }, [productId, status, router, searchParams]);

  return null;
}