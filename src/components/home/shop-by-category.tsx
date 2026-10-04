import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EditorialImage } from "@/components/ui/editorial-image";
import { Reveal } from "@/components/ui/reveal";
import { getCategories } from "@/lib/data/products";
import { categoryTagline } from "@/lib/types";
import { categoryImageSrc } from "@/lib/images";

export async function ShopByCategory() {
  const categories = await getCategories();

  return (
    <section className="border-b border-line py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="font-display text-4xl sm:text-5xl">Shop by category</h2>
        </Reveal>

        <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Reveal>
                {/* One real /shop route serves category filtering. */}
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="block transition-opacity duration-200 hover:opacity-90"
                >
                  <EditorialImage
                    src={categoryImageSrc()}
                    alt={category.name}
                    ratioClass="aspect-3/4"
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 92vw"
                  />
                  <h3 className="mt-5 font-display text-xl">{category.name}</h3>
                  <p className="mt-2 max-w-[16rem] text-sm text-muted">
                    {categoryTagline(category.slug)}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}