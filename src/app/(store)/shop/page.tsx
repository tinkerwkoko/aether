import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopControls } from "@/components/shop/shop-controls";
import { parseShopQuery, selectProducts } from "@/lib/shop-query";

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
  const products = selectProducts(query);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-display text-4xl sm:text-5xl">Shop</h1>

      <ShopControls query={query} resultCount={products.length} />

      <ProductGrid products={products} />
    </Container>
  );
}