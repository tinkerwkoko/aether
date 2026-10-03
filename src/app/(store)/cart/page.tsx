import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your bag.",
};

/**
 * Stage 1 shell route.
 * Exists so the cart link in the utility navigation always resolves; cart state,
 * quantity handling and the order summary are built in Stage 4.
 */
export default function CartPage() {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">Placeholder</p>
      <h1 className="mt-6 font-display text-4xl sm:text-5xl">Your cart</h1>
      <p className="mt-6 max-w-md text-muted">
        The cart arrives in Stage 4. This route is registered now so the cart link
        always resolves.
      </p>
    </Container>
  );
}