import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/ui/reveal";

/** The brand statement. Generous whitespace is the point of this section. */
export function BrandStatement() {
  return (
    <section className="border-b border-line">
      <Container className="py-28 sm:py-36 lg:py-44">
        <Reveal>
          <h2 className="max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Less noise. Better things.
          </h2>

          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            We look for the pieces that earn their place in your everyday life. From
            what you wear to where you work, Aether brings together considered products
            designed to be used, enjoyed and kept.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}