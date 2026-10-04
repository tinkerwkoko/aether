"use client";

/**
 * The Save action on a product card or product page.
 *
 * Signed in: toggles through a server action and fills the bookmark when saved.
 * Signed out: opens the sign-in dialog, then returns to the same page with the
 * pending save so it can be completed after sign-in. Never fakes a saved state.
 */

import { useRef, useState } from "react";
import { Bookmark } from "lucide-react";

import { SignInDialog } from "@/components/saved/sign-in-dialog";
import { toggleSavedItem, useSavedSnapshot } from "@/components/saved/saved-store";
import { useAuth } from "@/lib/auth-client";

export function SaveButton({
  productId,
  productName,
  productSlug,
  className = "",
}: {
  productId: string;
  productName: string;
  productSlug: string;
  className?: string;
}) {
  const { status } = useAuth();
  const { ids } = useSavedSnapshot();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const saved = ids.has(productId);

  // Where to come back to after signing in: the product itself, plus the pending
  // save. Using the slug rather than the current path means a Save tapped from a
  // shop grid returns the customer to the piece, not to a grid they have to
  // find it in again.
  const returnTo = `/products/${productSlug}?save=${encodeURIComponent(productId)}`;

  async function handleClick() {
    if (status === "loading") return;

    if (status === "signed-out") {
      setDialogOpen(true);
      return;
    }

    try {
      const result = await toggleSavedItem(productId);
      setMessage(
        result === "saved"
          ? `Saved ${productName}`
          : `Removed ${productName} from saved`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "We couldn't save that right now.",
      );
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label={saved ? `Remove ${productName} from saved` : `Save ${productName}`}
        aria-pressed={saved}
        className={`inline-flex h-11 w-11 items-center justify-center bg-ivory/90 transition-colors duration-200 hover:bg-ivory ${className}`}
      >
        <Bookmark
          size={20}
          strokeWidth={1.5}
          aria-hidden
          fill={saved ? "currentColor" : "none"}
        />
      </button>

      <p aria-live="polite" className="sr-only">
        {message}
      </p>

      <SignInDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        returnTo={`${returnTo}`}
        triggerRef={triggerRef}
      />
    </>
  );
}