"use client";

import { useRef, useState } from "react";

import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useCart } from "@/components/cart/cart-provider";
import type { ProductSize } from "@/lib/types";

const buttonClass =
  "inline-flex h-12 items-center justify-center gap-2 bg-charcoal px-6 text-[0.72rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-olive disabled:pointer-events-none disabled:bg-charcoal/30";

/**
 * Product purchase panel: size, quantity and Add to Cart.
 * Adding never navigates and never opens a drawer - the success state on the
 * button plus the header count is the feedback.
 */
export function ProductPurchase({
  productId,
  productName,
  stock,
  sizes,
}: {
  productId: string;
  productName: string;
  stock: number;
  sizes?: readonly ProductSize[];
}) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const soldOut = stock < 1;

  function handleAdd() {
    if (sizes && !size) {
      setError("Choose a size first.");
      return;
    }

    setError(null);
    const ok = addItem(productId, { size, quantity });
    if (!ok) {
      setError("We couldn't add that. Please try again.");
      return;
    }

    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-10">
      {sizes ? (
        <fieldset>
          <legend className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            Size
          </legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((option) => (
              <label key={option} className="cursor-pointer">
                <input
                  type="radio"
                  name={`size-${productId}`}
                  value={option}
                  checked={size === option}
                  onChange={() => {
                    setSize(option);
                    setError(null);
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-11 min-w-11 items-center justify-center border border-line px-3 text-sm transition-colors duration-200 hover:border-charcoal peer-checked:border-charcoal peer-checked:bg-charcoal peer-checked:text-ivory peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-8">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
          Quantity
        </p>
        <div className="mt-4">
          <QuantityStepper
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            max={Math.max(stock, 1)}
          />
        </div>
      </div>

      <div className="mt-8">
        {soldOut ? (
          <p className="text-sm text-muted">Currently unavailable</p>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={added ? `${productName} added to cart` : `Add ${productName} to cart`}
            className={buttonClass}
          >
            {added ? "Added" : "Add to Cart"}
          </button>
        )}

        {error ? (
          <p role="alert" className="mt-3 text-sm text-charcoal">
            {error}
          </p>
        ) : null}

        <p aria-live="polite" className="sr-only">
          {added ? `Added ${productName} to cart` : ""}
        </p>
      </div>
    </div>
  );
}