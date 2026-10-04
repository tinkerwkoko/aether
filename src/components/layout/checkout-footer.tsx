import Link from "next/link";

import { Container } from "@/components/layout/container";

/**
 * The minimal footer used on sign-in. Deliberately not the marketing footer:
 * this page is a single task, and the full footer is noise here.
 */
export function CheckoutFooter() {
  return (
    <footer className="surface-dark bg-charcoal text-ivory">
      <Container className="py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-display text-sm uppercase tracking-[0.3em]"
            >
              Aether
            </Link>
            <p className="text-xs text-ivory/60">Secure sign-in</p>
          </div>

          <div className="flex items-center gap-6 text-xs text-ivory/60">
            <Link href="/" className="transition-colors duration-200 hover:text-ivory">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <span>© 2026 Aether</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}