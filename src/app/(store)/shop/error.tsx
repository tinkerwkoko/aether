"use client";

import { Container } from "@/components/layout/container";

/**
 * Human-readable error for the shop. No technical detail is shown to customers;
 * the real error stays in the server logs.
 */
export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        Something went wrong
      </p>

      <h1 className="mt-6 font-display text-3xl sm:text-4xl">
        We couldn&apos;t load the collection
      </h1>

      <p className="mx-auto mt-5 max-w-md text-sm text-muted">
        Please try again. If the problem continues, come back a little later.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-10 inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
      >
        Try again
      </button>
    </Container>
  );
}