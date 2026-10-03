import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { EditorialImage } from "@/components/ui/editorial-image";
import { CATEGORY_NAMES } from "@/lib/catalogue";
import type { Product } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { productImageSrc } from "@/lib/images";

/**
 * Image-first product card, shared by the homepage and the shop.
 *
 * The image links to the product but is hidden from the tab order and the
 * accessibility tree, so the card is a single tab stop ("View product").
 *
 * The markup reserves space for an image-hover action overlay: add to cart
 * (Stage 4) and save (Stage 6). Nothing is rendered there yet, because an inert
 * button would be worse than no button.
 */
export function ProductCard({ product, sizes }: { product: Product; sizes?: string }) {
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative">
      <div className="overflow-hidden">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
          <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-105">
            <EditorialImage
              src={productImageSrc(product.slug)}
              alt={product.name}
              ratioClass="aspect-4/5"
              sizes={sizes ?? "(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 46vw"}
            />
          </div>
        </Link>
      </div>

      <p className="mt-4 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        {CATEGORY_NAMES[product.category]}
      </p>
      <h3 className="mt-2 font-display text-lg leading-snug">{product.name}</h3>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p className="text-sm text-charcoal/80">{formatPrice(product.price)}</p>

        <Link
          href={href}
          aria-label={`View ${product.name}`}
          className="inline-flex items-center gap-1 text-sm text-charcoal underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-olive hover:decoration-olive"
        >
          View product
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </article>
  );
}