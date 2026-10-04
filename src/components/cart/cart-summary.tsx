"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { DELIVERY_FEE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

/**
 * Order summary for a real cart. Checkout exists now, so the CTA is a real
 * link rather than a disabled control.
 * Figures are presentation only; the server recalculates them before an order.
 */
export function CartSummary() {
  const { subtotal, itemCount } = useCart();
  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="border-t border-line pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted">Subtotal</p>
          <p className="text-sm text-charcoal">{formatPrice(subtotal)}</p>
        </div>

        {DELIVERY_FEE > 0 ? (
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted">Delivery</p>
            <p className="text-sm text-charcoal">{formatPrice(DELIVERY_FEE)}</p>
          </div>
        ) : null}

        <div className="mt-3 flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted">Total</p>
          <p className="font-display text-xl">{formatPrice(total)}</p>
        </div>

        <p className="mt-2 text-xs text-muted">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <Link
        href="/checkout"
        className="mt-8 inline-flex h-12 w-full items-center justify-center bg-charcoal px-6 text-[0.72rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-olive"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}