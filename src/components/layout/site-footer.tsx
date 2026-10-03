import Link from "next/link";

import { Container } from "@/components/layout/container";
import { shopLinks } from "@/lib/navigation";

/**
 * Marketing footer. ABOUT and HELP sections are absent because those pages are
 * not part of the current implementation, and Aether does not link dead routes.
 */
export function SiteFooter() {
  return (
    <footer className="surface-dark bg-charcoal text-ivory">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-display text-lg uppercase tracking-[0.3em]">Aether</p>
            <p className="mt-5 max-w-xs text-sm text-ivory/70">Things worth having.</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-ivory/60">
              Shop
            </h2>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/80 transition-colors duration-200 hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ivory/15 pt-6 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Aether</p>
          <p>Nigeria · NGN ₦</p>
        </div>
      </Container>
    </footer>
  );
}