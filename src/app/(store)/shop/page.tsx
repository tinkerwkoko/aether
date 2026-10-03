import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the Aether collection.",
};

/**
 * Stage 1 shell route.
 * Exists so navigation has no dead links; the catalogue, categories, search,
 * sorting and product grid are built in Stage 3.
 */
export default function ShopPage() {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">Placeholder</p>
      <h1 className="mt-6 font-display text-4xl sm:text-5xl">Shop</h1>
      <p className="mt-6 max-w-md text-muted">
        The catalogue arrives in Stage 3. This route is registered now so the
        header and footer never link to a missing page.
      </p>
    </Container>
  );
}