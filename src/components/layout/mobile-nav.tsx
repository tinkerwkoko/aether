"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import { shopLinks } from "@/lib/navigation";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

/**
 * Mobile navigation drawer.
 * Stays mounted so it can animate both ways, but is removed from the tab order
 * and the accessibility tree while closed (inert + aria-hidden).
 */
export function MobileNav({ open, onClose, triggerRef }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    // Captured now so the cleanup restores focus to the trigger that opened this drawer.
    const trigger = triggerRef.current;

    const getFocusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));

    getFocusable()[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <div
      id="mobile-menu"
      inert={!open}
      aria-hidden={!open}
      className={`fixed inset-0 z-[70] lg:hidden ${
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
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-line bg-ivory transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="font-display text-base uppercase tracking-[0.3em]">
            Aether
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.72rem] uppercase tracking-[0.22em] text-muted transition-colors duration-200 hover:text-charcoal"
          >
            Close
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 py-8">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">Shop</p>
          <ul className="mt-5 space-y-4">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="text-base text-charcoal transition-colors duration-200 hover:text-olive"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line px-6 py-6">
          <Link
            href="/cart"
            onClick={onClose}
            className="text-[0.72rem] uppercase tracking-[0.22em] text-charcoal"
          >
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
}