import Link from "next/link";
import type { ReactNode } from "react";

import { CheckoutFooter } from "@/components/layout/checkout-footer";

/**
 * Checkout shell: wordmark, a "Secure checkout" label and the minimal footer.
 * Deliberately no marketing header, no Save icons and no nav links: checkout is
 * one task and nothing else should compete for attention.
 */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="font-display text-base uppercase tracking-[0.3em] text-charcoal"
          >
            Aether
          </Link>

          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            Secure checkout
          </p>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <CheckoutFooter />
    </div>
  );
}