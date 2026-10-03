"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Scroll reveal: opacity plus a short upward translate, driven by CSS.
 *
 * The server-rendered markup carries no `data-reveal` attribute, so content is
 * visible by default and still shows when JavaScript is unavailable. On hydration
 * only off-screen elements are marked "pending" and then revealed by an
 * IntersectionObserver. Under prefers-reduced-motion nothing is observed at all,
 * and the global reduced-motion rule collapses any transition anyway.
 *
 * The matching styles live in globals.css under "Scroll reveal".
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    node.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.dataset.reveal = "revealed";
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}