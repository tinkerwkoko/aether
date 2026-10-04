"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { useCart } from "@/components/cart/cart-provider";
import { DELIVERY_FEE } from "@/lib/delivery";

/**
 * Thin bridge between the cart and the checkout form. An empty cart has nothing
 * to check out, so it goes back to /cart rather than showing an empty form.
 */
export function CheckoutClient({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const { lines } = useCart();
  const isEmpty = lines.length === 0;

  // Runs after the store has loaded, so it never redirects during hydration.
  useEffect(() => {
    if (isEmpty) router.replace("/cart");
  }, [isEmpty, router]);

  if (isEmpty) return null;

  const subtotal = lines.reduce(
    (sum, { product, line }) => sum + product.price * line.quantity,
    0,
  );

  return (
    <CheckoutForm
      lines={lines}
      total={subtotal + DELIVERY_FEE}
      contactName={name}
      contactEmail={email}
    />
  );
}