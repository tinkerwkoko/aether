import Link from "next/link";

const linkClass =
  "inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive";

/** The designed empty cart state. */
export function EmptyCart() {
  return (
    <div className="mt-10 border-t border-line py-20 text-center sm:py-28">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        Cart
      </p>

      <h2 className="mt-6 font-display text-3xl sm:text-4xl">
        Your cart is empty.
      </h2>

      <p className="mx-auto mt-4 max-w-sm text-sm text-muted">
        Nothing here yet. Take a look around.
      </p>

      <Link href="/shop" className={`${linkClass} mt-10`}>
        Continue Shopping
      </Link>
    </div>
  );
}