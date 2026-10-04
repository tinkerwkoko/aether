import type { Metadata } from "next";
import Link from "next/link";

import { SavedProducts } from "@/components/account/saved-products";
import { Container } from "@/components/layout/container";
import { requireUser } from "@/lib/auth";
import { getSavedProducts } from "@/lib/data/saved";

export const metadata: Metadata = {
  title: "Saved pieces",
  description: "The Aether pieces you have saved.",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  await requireUser("/account/saved");
  const products = await getSavedProducts();

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/account"
        className="text-[0.68rem] uppercase tracking-[0.22em] text-muted transition-colors duration-200 hover:text-charcoal"
      >
        Account
      </Link>

      <h1 className="mt-6 font-display text-4xl sm:text-5xl">Saved pieces</h1>

      <SavedProducts products={products} />
    </Container>
  );
}