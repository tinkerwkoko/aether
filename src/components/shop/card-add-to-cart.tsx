"use client";

import { Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";

/**
 * The Add to cart action that sits over a product card's image.
 *
 * - Clothing needs a size, so those cards link to the product page to choose one
 *   instead of guessing a size here.
 * - Hover is never the only way to reach it: it is visible on any device without
 *   hover, and also on keyboard focus anywhere inside the card.
 * - On success the icon becomes a check and "Added to cart" is announced.
 *
 * Save is not rendered here yet: it arrives with authentication in Stage 6.
 */
export function CardAddToCart({
  productId,
  productName,
  hasSizes,
  soldOut,
}: {
  productId: string;
  productName: string;
  hasSizes: boolean;
  soldOut: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (soldOut) {
    return (
      <span className="inline-flex items-center bg-ivory/90 px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-charcoal/70">
        Currently unavailable
      </span>
    );
  }

  if (hasSizes) {
    return (
      <Link
        href={`/products/${productId}`}
        aria-label={`Choose size for ${productName}`}
        className="inline-flex h-11 w-11 items-center justify-center bg-ivory/90 text-charcoal transition-colors duration-200 hover:bg-ivory"
      >
        <ShoppingCart size={20} strokeWidth={1.5} aria-hidden />
      </Link>
    );
  }

  function handleAdd() {
    if (!addItem(productId)) return;
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${productName} to cart`}
        className="inline-flex h-11 w-11 items-center justify-center bg-ivory/90 text-charcoal transition-colors duration-200 hover:bg-ivory"
      >
        {added ? (
          <Check size={20} strokeWidth={1.5} aria-hidden />
        ) : (
          <ShoppingCart size={20} strokeWidth={1.5} aria-hidden />
        )}
      </button>

      <p aria-live="polite" className="sr-only">
        {added ? "Added to cart" : ""}
      </p>
    </>
  );
}