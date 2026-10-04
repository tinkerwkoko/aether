import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/types";

/**
 * Product grid, or a designed empty state when nothing matches.
 * 2 columns on mobile, 3 on tablet, 4 on desktop.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-display text-2xl sm:text-3xl">
          No pieces match your search
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Try a different word, or browse the full collection.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard
            product={product}
            sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 46vw"
          />
        </li>
      ))}
    </ul>
  );
}