import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/types";

/** The customer's saved pieces, as the same cards used across the storefront. */
export function SavedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="mt-8 border border-line p-8">
        <p className="font-display text-xl">Nothing saved yet.</p>
        <p className="mt-2 text-sm text-muted">
          Save pieces as you browse and they will wait for you here.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}