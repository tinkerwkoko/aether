"use client";

/**
 * The dialog shown when a signed-out visitor taps Save.
 *
 * Accessible: role dialog, accessible name, focus moved in on open, Tab is
 * trapped inside, Escape closes, and focus returns to the Save button. It never
 * fakes a saved state - it offers a way to sign in and come back.
 */

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import Link from "next/link";

type SignInDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Path to return to after signing in, including the pending save. */
  returnTo: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function SignInDialog({
  open,
  onClose,
  returnTo,
  triggerRef,
}: SignInDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const trigger = triggerRef.current;
    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );

    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <div
      className={`fixed inset-0 z-[70] ${
        open ? "visible" : "invisible pointer-events-none"
      }`}
    >
      <div
        role="presentation"
        onClick={onClose}
        className={`absolute inset-0 bg-charcoal/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-dialog-title"
        className={`absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 border border-line bg-ivory p-6 transition-opacity duration-300 sm:p-8 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2
          id="save-dialog-title"
          className="font-display text-2xl sm:text-3xl"
        >
          Save pieces you like.
        </h2>

        <p className="mt-4 text-sm text-muted">Saving needs an account.</p>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href={`/login?next=${encodeURIComponent(returnTo)}`}
            onClick={onClose}
            className="inline-flex h-12 items-center bg-charcoal px-6 text-[0.72rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-olive"
          >
            Continue with Google
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center text-[0.72rem] uppercase tracking-[0.22em] text-charcoal underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-olive hover:decoration-olive"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}