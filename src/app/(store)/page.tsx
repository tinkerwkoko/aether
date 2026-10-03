import { BrandStatement } from "@/components/home/brand-statement";
import { CuratedProducts } from "@/components/home/curated-products";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { ShopByCategory } from "@/components/home/shop-by-category";

/**
 * Aether homepage.
 * Newsletter is intentionally absent: it is not functional yet (Stage 2 scope).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <ShopByCategory />
      <BrandStatement />
      <CuratedProducts />
    </>
  );
}