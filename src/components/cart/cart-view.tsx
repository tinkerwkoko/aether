"use client";

import { useCart } from "@/components/cart/cart-provider";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";

/**
 * The cart page body: either the designed empty state, or the two-column
 * layout with lines on the left and a sticky summary on the right.
 */
export function CartView() {
  const { lines } = useCart();

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
      <ul className="border-t border-line">
        {lines.map(({ product, line }) => (
          <li key={`${line.productId}-${line.size ?? ""}`}>
            <CartLineItem product={product} line={line} />
          </li>
        ))}
      </ul>

      <CartSummary />
    </div>
  );
}