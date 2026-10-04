import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/ui/reveal";
import { getFeaturedProducts } from "@/lib/data/products";

/** A second row, deliberately showing different pieces to New Arrivals. */
export async function CuratedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            Also worth having.
          </h2>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <Reveal>
                <ProductCard product={product} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}