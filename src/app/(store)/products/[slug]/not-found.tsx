import Link from "next/link";

import { Container } from "@/components/layout/container";

const linkClass =
  "inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive";

export default function ProductNotFound() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">404</p>

      <h1 className="mt-6 font-display text-4xl sm:text-5xl">
        We couldn&apos;t find that piece
      </h1>

      <p className="mx-auto mt-5 max-w-md text-muted">
        It may have been renamed, or it may no longer be in the collection. Have a
        look through the shop for something worth having.
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        <Link href="/shop" className={linkClass}>
          Browse the shop
        </Link>
        <Link href="/" className={linkClass}>
          Back to home
        </Link>
      </div>
    </Container>
  );
}