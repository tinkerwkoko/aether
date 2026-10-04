"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { EditorialImage } from "@/components/ui/editorial-image";
import type { CartLine, CartProduct } from "@/lib/cart";
import { getCategoryName } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { productImageSrc } from "@/lib/images";

/**
 * One cart line. Product name, price and image are always read from the
 * catalogue, so what is shown is always current rather than what was stored.
 */
export function CartLineItem({
  product,
  line,
}: {
  product: CartProduct;
  line: CartLine;
}) {
  const { setQuantity, removeItem } = useCart();
  const lineTotal = product.price * line.quantity;

  return (
    <div className="motion-safe:transition-opacity motion-safe:duration-200 flex flex-wrap items-start gap-4 border-b border-line py-6 sm:flex-nowrap sm:gap-6">
      <Link
        href={`/products/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="w-24 shrink-0 overflow-hidden sm:w-28"
      >
        <EditorialImage
          src={productImageSrc(product)}
          alt={product.name}
          ratioClass="aspect-4/5"
          sizes="112px"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          {getCategoryName(product.category)}
        </p>

        <h2 className="mt-2 font-display text-lg leading-snug">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors duration-200 hover:text-olive"
          >
            {product.name}
          </Link>
        </h2>

        {line.size ? (
          <p className="mt-1 text-sm text-muted">Size: {line.size}</p>
        ) : null}

        <p className="mt-1 text-sm text-charcoal/80">
          {formatPrice(product.price)} each
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <QuantityStepper
            label={`Quantity for ${product.name}`}
            value={line.quantity}
            max={Math.max(product.stock, 1)}
            onChange={(next) => setQuantity(line.productId, line.size, next)}
          />

          <button
            type="button"
            onClick={() => removeItem(line.productId, line.size)}
            className="text-sm text-charcoal underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-olive hover:decoration-olive"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="w-full shrink-0 text-sm text-charcoal/80 sm:w-24 sm:text-right">
        {formatPrice(lineTotal)}
      </p>
    </div>
  );
}