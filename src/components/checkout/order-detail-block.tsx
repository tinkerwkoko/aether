import Link from "next/link";

import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/data/orders";
import type { OrderDetail } from "@/lib/data/orders";

/** Order summary lines plus the delivery block. Shared by both order pages. */
export function OrderDetailBlock({ order }: { order: OrderDetail }) {
  return (
    <>
      <ul className="border-t border-line">
        {order.items.map((item) => (
          <li
            key={item.productId}
            className="flex items-baseline justify-between gap-4 border-b border-line py-4 text-sm"
          >
            <span className="min-w-0">
              <span className="block">
                {item.slug ? (
                  <Link
                    href={`/products/${item.slug}`}
                    className="underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-olive hover:decoration-olive"
                  >
                    {item.name}
                  </Link>
                ) : (
                  item.name
                )}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {item.size ? `Size ${item.size} · ` : ""}
                Quantity {item.quantity}
              </span>
            </span>

            <span className="shrink-0 text-charcoal/80">
              {formatPrice(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Status</dt>
          <dd className="text-charcoal">{ORDER_STATUS_LABELS[order.status]}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Placed</dt>
          <dd className="text-charcoal">
            <time dateTime={order.createdAt}>
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <dt className="font-display text-xl">Total</dt>
          <dd className="font-display text-xl">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      {order.delivery ? (
        <div className="mt-10">
          <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            Delivery details
          </h2>
          <p className="mt-3 text-sm text-charcoal">
            {order.delivery.fullName}
            <br />
            {order.delivery.phone}
            <br />
            {order.delivery.addressLine}
            <br />
            {order.delivery.city}, {order.delivery.state}
            {order.delivery.landmark ? (
              <>
                <br />
                {order.delivery.landmark}
              </>
            ) : null}
          </p>
        </div>
      ) : null}
    </>
  );
}