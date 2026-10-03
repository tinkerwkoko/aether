import { EditorialImage } from "@/components/ui/editorial-image";
import { CATEGORY_NAMES } from "@/lib/catalogue";
import type { Product } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { productImageSrc } from "@/lib/images";

/**
 * Image-first product card: image, category, name, price.
 *
 * Deliberately not a link yet - product detail routes arrive in Stage 3, and
 * Aether never links to a page that does not exist. Add-to-cart is omitted
 * because cart state arrives in Stage 4; an inert button would be worse.
 */
export function ProductCard({ product, sizes }: { product: Product; sizes?: string }) {
  return (
    <article>
      <EditorialImage
        src={productImageSrc(product.slug)}
        alt={product.name}
        ratioClass="aspect-4/5"
        sizes={sizes ?? "(min-width: 1024px) 24vw, 50vw"}
      />

      <p className="mt-4 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        {CATEGORY_NAMES[product.category]}
      </p>
      <h3 className="mt-2 font-display text-lg">{product.name}</h3>
      <p className="mt-1 text-sm text-charcoal/80">{formatPrice(product.price)}</p>
    </article>
  );
}