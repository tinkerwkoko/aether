"use client";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";

/**
 * Order summary. Subtotal and Total only: there is no delivery line because no
 * delivery rules exist yet, and inventing a promise would be dishonest.
 * These figures are presentation only - Stage 7 recalculates them on the server.
 */
export function CartSummary() {
  const { subtotal, itemCount } = useCart();

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="border-t border-line pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted">Subtotal</p>
          <p className="text-sm text-charcoal">{formatPrice(subtotal)}</p>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted">Total</p>
          <p className="font-display text-xl">{formatPrice(subtotal)}</p>
        </div>

        <p className="mt-2 text-xs text-muted">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Checkout does not exist yet, so this is disabled rather than a dead link. */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-8 inline-flex h-12 w-full cursor-not-allowed items-center justify-center bg-charcoal/30 px-6 text-[0.72rem] uppercase tracking-[0.22em] text-ivory"
      >
        Proceed to Checkout
      </button>

      <p className="mt-3 text-xs text-muted">Checkout opens in a later stage.</p>
    </div>
  );
}