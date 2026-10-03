import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EditorialImage } from "@/components/ui/editorial-image";
import { heroImageSrc } from "@/lib/images";

/**
 * Editorial hero: type on one side, a large image on the other.
 * No gradient, no glass, no decorative blobs - just type, space and imagery.
 */
export function Hero() {
  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16 lg:py-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
              Aether
            </p>

            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Things worth having.
            </h1>

            <p className="mt-6 max-w-md text-base text-muted sm:text-lg">
              A considered collection of everyday pieces for how you live, work and
              move.
            </p>

            <Link
              href="/shop"
              className="mt-10 inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
            >
              Shop New Arrivals
            </Link>
          </div>

          <EditorialImage
            src={heroImageSrc()}
            alt="Aether editorial"
            ratioClass="aspect-4/3"
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority
          />
        </div>
      </Container>
    </section>
  );
}