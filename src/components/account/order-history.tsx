import Link from "next/link";

import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/data/orders";
import type { OrderSummary } from "@/lib/data/orders";

/**
 * Order history. Orders do not exist until Stage 7, so the empty state is a
 * real, designed state rather than a placeholder.
 */
export function OrderHistory({ orders }: { orders: OrderSummary[] }) {
  if (orders.length === 0) {
    return (
      <div className="mt-6 border border-line p-8">
        <p className="font-display text-xl">No orders yet.</p>
        <p className="mt-2 text-sm text-muted">
          When you place an order it will appear here.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-6 border-t border-line">
      {orders.map((order) => (
        <li key={order.id} className="border-b border-line py-6">
          <Link
            href={`/account/orders/${order.id}`}
            className="block transition-opacity duration-200 hover:opacity-80"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-display text-lg">{order.orderNumber}</p>
              <p className="text-sm text-charcoal/80">
                {formatPrice(order.total)}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted">
              <time dateTime={order.createdAt}>
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span>{ORDER_STATUS_LABELS[order.status]}</span>
              <span>
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}