"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { primaryNav } from "@/lib/navigation";

/** Understated navigation type: small, spaced, quiet until hovered. */
const navLinkClass =
  "text-[0.72rem] uppercase tracking-[0.22em] text-charcoal/75 transition-colors duration-200 hover:text-charcoal";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [renderedPathname, setRenderedPathname] = useState(pathname);

  // Stable identity so the drawer effect only re-runs when it opens or closes.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transient menus never survive a navigation. State is adjusted during render
  // (React's documented pattern) rather than reset from inside an effect.
  if (renderedPathname !== pathname) {
    setRenderedPathname(pathname);
    setShopOpen(false);
    setMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-ivory" : "border-transparent bg-ivory"
      }`}
    >
      <Container>
        <div
          className={`grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-300 ${
            scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          }`}
        >
          <Link
            href="/"
            aria-label="Aether home"
            className="font-display text-base uppercase tracking-[0.3em] text-charcoal sm:text-lg"
          >
            Aether
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {primaryNav.map((item) => (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                  onFocus={() => setShopOpen(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setShopOpen(false);
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      onClick={() => setShopOpen(false)}
                      className={navLinkClass}
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <button
                        type="button"
                        aria-expanded={shopOpen}
                        aria-controls="shop-menu"
                        aria-label="Show shop categories"
                        className="text-charcoal/55 transition-colors duration-200 hover:text-charcoal"
                        onClick={() => setShopOpen((open) => !open)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setShopOpen(false);
                        }}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 10 6"
                          className={`h-[5px] w-[9px] transition-transform duration-200 ${
                            shopOpen ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M1 1l4 4 4-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </span>

                  {item.children && shopOpen ? (
                    <div
                      id="shop-menu"
                      className="animate-fade-down absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 border border-line bg-ivory py-2"
                    >
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setShopOpen(false)}
                              className="block px-5 py-2.5 text-sm text-charcoal/80 transition-colors duration-150 hover:bg-stone/40 hover:text-charcoal"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-6">
            <Link href="/cart" className={navLinkClass}>
              Cart
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className={`${navLinkClass} lg:hidden`}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              Menu
            </button>
          </div>
        </div>
      </Container>

      <MobileNav open={menuOpen} onClose={closeMenu} triggerRef={menuButtonRef} />
    </header>
  );
}