import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopControls } from "@/components/shop/shop-controls";
import { getCategories, getProducts } from "@/lib/data/products";
import { parseShopQuery } from "@/lib/shop-query";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the Aether collection: fashion, tech and accessories, home and desk, and self-care.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseShopQuery(params);

  // Filtering, search and sorting all happen in the database, so every result is
  // a real row and the count reflects what was actually returned.
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: query.category,
      q: query.q,
      sort: query.sort,
    }),
  ]);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-display text-4xl sm:text-5xl">Shop</h1>

      <ShopControls query={query} categories={categories} resultCount={products.length} />

      <ProductGrid products={products} />
    </Container>
  );
}