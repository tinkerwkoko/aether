import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the pieces in your cart.",
};

export default function CartPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-display text-4xl sm:text-5xl">Your cart</h1>

      <CartView />
    </Container>
  );
}