"use client";

/**
 * Checkout orchestration: delivery stage, then review stage, then place order.
 *
 * The idempotency key is generated once per attempt and reused on retries and
 * double-clicks, so a repeated submit can never create a second order.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { DeliveryFields } from "@/components/checkout/delivery-fields";
import type { FieldErrors } from "@/components/checkout/delivery-fields";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ReviewStage } from "@/components/checkout/review-stage";
import { useCart } from "@/components/cart/cart-provider";
import { deliverySchema } from "@/lib/checkout-schema";
import type { DeliveryDetails } from "@/lib/checkout-schema";
import { placeOrder } from "@/lib/order-actions";
import type { PlaceOrderResult } from "@/lib/order-actions";
import type { ResolvedCartLine } from "@/lib/cart";

const KEY_STORAGE = "aether.checkout.idempotencyKey";

/** One key per checkout attempt, reused for the life of that attempt. */
function readOrCreateKey(): string {
  const key =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `aether-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    const stored = window.sessionStorage.getItem(KEY_STORAGE);
    if (stored && stored.length >= 8) return stored;

    window.sessionStorage.setItem(KEY_STORAGE, key);
  } catch {
    // Storage unavailable: the in-memory key still protects this attempt.
  }

  return key;
}

/** Collects zod issues into a field-keyed map. */
function toFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") {
      fieldErrors[field as keyof DeliveryDetails] = issue.message;
    }
  }

  return fieldErrors;
}

export function CheckoutForm({
  lines,
  total,
  contactName,
  contactEmail,
}: {
  lines: ResolvedCartLine[];
  total: number;
  contactName: string | null;
  contactEmail: string | null;
}) {
  const router = useRouter();
  const { clearCart } = useCart();

  const [stage, setStage] = useState<"delivery" | "review">("delivery");
  const [values, setValues] = useState<DeliveryDetails>({
    fullName: contactName ?? "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    landmark: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);

  const keyRef = useRef<string>("");
  const summaryRef = useRef<HTMLDivElement>(null);

  // Created on the client, once, then reused for every retry of this attempt.
  useEffect(() => {
    if (!keyRef.current) keyRef.current = readOrCreateKey();
  }, []);

  const handleChange = useCallback(
    <K extends keyof DeliveryDetails>(key: K, value: DeliveryDetails[K]) => {
      const next = { ...values, [key]: value };
      setValues(next);

      if (deliverySchema.safeParse(next).success) {
        setErrors((current) => {
          const without = { ...current };
          delete without[key];
          return without;
        });
      }
    },
    [values],
  );

  const handleBlur = useCallback(
    (key: keyof DeliveryDetails) => {
      const parsed = deliverySchema.safeParse(values);

      setErrors((current) => {
        const next = { ...current };

        if (parsed.success) {
          delete next[key];
          return next;
        }

        const issue = parsed.error.issues.find(
          (entry) => entry.path[0] === key,
        );

        if (issue) next[key] = issue.message;
        else delete next[key];

        return next;
      });
    },
    [values],
  );
function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const parsed = deliverySchema.safeParse(values);

    if (!parsed.success) {
      // Focus the summary so a screen reader announces what went wrong.
      setErrors(toFieldErrors(parsed.error));
      summaryRef.current?.focus();
      return;
    }

    setValues(parsed.data);
    setErrors({});
    setStage("review");
  }

  function handleResult(result: PlaceOrderResult) {
    if (result.ok) {
      clearCart();

      try {
        window.sessionStorage.removeItem(KEY_STORAGE);
      } catch {
        // Nothing to clean up when storage is unavailable.
      }

      router.push(`/checkout/confirmed/${result.orderId}`);
      return;
    }

    switch (result.code) {
      case "SIGN_IN_REQUIRED":
        router.push("/login?next=%2Fcheckout");
        return;

      case "INVALID_INPUT":
        setNotice(result.message);
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
          setStage("delivery");
          summaryRef.current?.focus();
        }
        return;

      case "PRICE_CHANGED":
        // Nothing was created. Show the new total and ask for another click.
        setNotice(
          "The price changed while you were checking out. Please review the new total and place your order again.",
        );
        router.refresh();
        return;

      case "OUT_OF_STOCK":
        setNotice(`Only ${result.available} left of ${result.product}.`);
        return;

      case "INVALID_SIZE":
        setNotice(
          result.size
            ? `That size is no longer available for ${result.product}.`
            : `Please choose a size for ${result.product}.`,
        );
        setStage("delivery");
        return;

      case "PRODUCT_UNAVAILABLE":
        setNotice(`${result.product} is no longer available.`);
        return;

      case "EMPTY_CART":
        router.push("/cart");
        return;

      default:
        setNotice(result.message);
    }
  }

  async function handlePlaceOrder() {
    // The second click of a double-click lands here and does nothing.
    if (pending) return;

    setPending(true);
    setNotice(null);
    setBusyLabel("Placing order");

    try {
      handleResult(
        await placeOrder({
          items: lines.map(({ product, line }) => ({
            productId: product.id,
            quantity: line.quantity,
            size: line.size,
          })),
          delivery: values,
          idempotencyKey: keyRef.current,
          expectedTotal: total,
        }),
      );
    } catch {
      setNotice("We couldn't place your order. Please try again.");
    } finally {
      setPending(false);
      setBusyLabel(null);
    }
  }

  const offerCartLink =
    notice !== null &&
    (notice.includes("left") || notice.includes("available"));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <details className="border-b border-line pb-4 lg:hidden">
        <summary className="cursor-pointer text-[0.68rem] uppercase tracking-[0.22em] text-muted">
          Order summary
        </summary>
        <div className="mt-4">
          <OrderSummary lines={lines} total={total} collapsed />
        </div>
      </details>

      <CheckoutSteps current={stage === "delivery" ? "Delivery" : "Place order"} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>

          <div
            ref={summaryRef}
            tabIndex={-1}
            role={notice ? "alert" : undefined}
            className="mt-6"
          >
            {notice ? (
              <div className="border border-line p-4 text-sm text-charcoal">
                <p>{notice}</p>
                {offerCartLink ? (
                  <Link
                    href="/cart"
                    className="mt-3 inline-block underline underline-offset-4 hover:text-olive"
                  >
                    Back to cart
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          {stage === "delivery" ? (
            <DeliveryFields
              values={values}
              errors={errors}
              contactName={contactName}
              contactEmail={contactEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              onSubmit={handleReview}
            />
          ) : (
            <ReviewStage
              delivery={values}
              total={total}
              pending={pending}
              busyLabel={busyLabel}
              onEdit={() => setStage("delivery")}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-10 lg:block lg:self-start">
          <OrderSummary lines={lines} total={total} />
        </aside>
      </div>
    </div>
  );
}