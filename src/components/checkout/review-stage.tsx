"use client";

import { formatPrice } from "@/lib/format";
import { DELIVERY_FEE } from "@/lib/delivery";
import type { DeliveryDetails } from "@/lib/checkout-schema";

const labelClass = "text-[0.68rem] uppercase tracking-[0.22em] text-muted";

/**
 * Stage two: confirm what was entered, then place the order.
 * The button disables immediately on submit and carries aria-busy, so a
 * double-click cannot start a second attempt.
 */
export function ReviewStage({
  delivery,
  total,
  pending,
  busyLabel,
  onEdit,
  onPlaceOrder,
}: {
  delivery: DeliveryDetails;
  total: number;
  pending: boolean;
  busyLabel: string | null;
  onEdit: () => void;
  onPlaceOrder: () => void;
}) {
  return (
    <div className="mt-8">
      <p className={labelClass}>Delivering to</p>

      <p className="mt-2 text-sm text-charcoal">
        {delivery.fullName}
        <br />
        {delivery.phone}
        <br />
        {delivery.addressLine}
        <br />
        {delivery.city}, {delivery.state}
        {delivery.landmark ? (
          <>
            <br />
            {delivery.landmark}
          </>
        ) : null}
      </p>

      <button
        type="button"
        onClick={onEdit}
        className="mt-6 text-sm underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-olive hover:decoration-olive"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={pending}
        aria-busy={pending}
        className="mt-10 inline-flex h-12 items-center bg-charcoal px-8 text-[0.72rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-olive disabled:pointer-events-none disabled:bg-charcoal/50"
      >
        {busyLabel ?? "Place order"}
      </button>

      <p className="mt-4 text-xs text-muted">
        {DELIVERY_FEE > 0 ? "Delivery is charged as shown." : "No delivery fee."}{" "}
        Total {formatPrice(total)}.
      </p>
    </div>
  );
}