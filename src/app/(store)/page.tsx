import { Container } from "@/components/layout/container";

/**
 * Stage 1 design-system placeholder.
 * Intentionally not the Aether homepage - the homepage is built in Stage 2.
 */
export default function Home() {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        Aether design system
      </p>

      <h1 className="mt-8 max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
        Things worth having.
      </h1>

      <p className="mt-6 max-w-xl text-muted">
        A considered collection of everyday pieces for how you live, work and move.
      </p>

      <p className="mt-16 border-t border-line pt-6 text-xs text-muted">
        Placeholder: the homepage is built in Stage 2.
      </p>
    </Container>
  );
}