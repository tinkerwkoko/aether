import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { CardAddToCart } from "@/components/shop/card-add-to-cart";
import { EditorialImage } from "@/components/ui/editorial-image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { getCategoryName } from "@/lib/types";
import { productImageSrc } from "@/lib/images";

/**
 * Image-first product card, shared by the homepage and the shop.
 *
 * The image links to the product but is hidden from the tab order and the
 * accessibility tree, so the card stays a predictable number of tab stops.
 *
 * Over the image sits the Add to cart action. Save is reserved beside it and is
 * not rendered yet: it arrives with authentication in Stage 6, and an action
 * that does nothing is worse than no action.
 */
export function ProductCard({ product, sizes }: { product: Product; sizes?: string }) {
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative">
      <div className="relative overflow-hidden">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
          <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-105">
            <EditorialImage
              src={productImageSrc(product)}
              alt={product.name}
              ratioClass="aspect-4/5"
              sizes={sizes ?? "(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 46vw"}
            />
          </div>
        </Link>

        {/* Save action will sit here in Stage 6. */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-200 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
            <CardAddToCart
              productId={product.id}
              productName={product.name}
              hasSizes={Boolean(product.sizes)}
              soldOut={product.stock < 1}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        {getCategoryName(product.category)}
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