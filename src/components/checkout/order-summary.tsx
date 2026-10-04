import { EditorialImage } from "@/components/ui/editorial-image";
import { formatPrice } from "@/lib/format";
import { DELIVERY_FEE } from "@/lib/delivery";
import type { ResolvedCartLine } from "@/lib/cart";

/**
 * Order summary. Presentation only: the server recalculates every figure before
 * an order is created, so these numbers are a courtesy, not a contract.
 * The Delivery line appears only when a real fee exists.
 */
export function OrderSummary({
  lines,
  total,
  collapsed = false,
}: {
  lines: ResolvedCartLine[];
  total: number;
  collapsed?: boolean;
}) {
  const subtotal = total - DELIVERY_FEE;

  const body = (
    <>
      <ul className="border-t border-line">
        {lines.map(({ product, line }) => (
          <li
            key={`${line.productId}-${line.size ?? ""}`}
            className="flex items-start gap-4 border-b border-line py-4"
          >
            <span className="w-16 shrink-0 overflow-hidden">
              <EditorialImage
                src={product.image}
                alt={product.name}
                ratioClass="aspect-4/5"
                sizes="64px"
              />
            </span>

            <span className="min-w-0 flex-1 text-sm">
              <span className="block">{product.name}</span>
              {line.size ? (
                <span className="mt-1 block text-xs text-muted">
                  Size {line.size}
                </span>
              ) : null}
              <span className="mt-1 block text-xs text-muted">
                Quantity {line.quantity}
              </span>
            </span>

            <span className="shrink-0 text-sm text-charcoal/80">
              {formatPrice(product.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="text-charcoal">{formatPrice(subtotal)}</dd>
        </div>

        {DELIVERY_FEE > 0 ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">Delivery</dt>
            <dd className="text-charcoal">{formatPrice(DELIVERY_FEE)}</dd>
          </div>
        ) : null}

        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <dt className="font-display text-xl">Total</dt>
          <dd className="font-display text-xl">{formatPrice(total)}</dd>
        </div>
      </dl>
    </>
  );

  return (
    <section aria-label="Order summary">
      <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        Order summary
      </h2>

      <div className={collapsed ? "hidden lg:block" : "mt-4"}>{body}</div>

      <dl className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4 lg:hidden">
        <dt className="text-sm text-muted">Total</dt>
        <dd className="font-display text-xl">{formatPrice(total)}</dd>
      </dl>
    </section>
  );
}