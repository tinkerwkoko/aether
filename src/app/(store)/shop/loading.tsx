import { Container } from "@/components/layout/container";

/**
 * Skeleton grid that matches the real shop layout, so the page does not jump
 * when the products arrive. Pulses are disabled under prefers-reduced-motion.
 */
export default function ShopLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="sr-only">Loading products</p>

      <div aria-hidden="true" className="h-10 w-32 motion-reduce:animate-none animate-pulse bg-stone/60" />

      <div
        aria-hidden="true"
        className="mt-8 h-11 max-w-xl motion-reduce:animate-none animate-pulse bg-stone/40"
      />

      <div
        aria-hidden="true"
        className="mt-10 h-11 w-full border-b border-line motion-reduce:animate-none animate-pulse bg-stone/40"
      />

      <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} aria-hidden="true">
            <div className="aspect-4/5 w-full motion-reduce:animate-none animate-pulse bg-stone/50" />
            <div className="mt-4 h-3 w-20 motion-reduce:animate-none animate-pulse bg-stone/50" />
            <div className="mt-3 h-4 w-32 motion-reduce:animate-none animate-pulse bg-stone/50" />
            <div className="mt-3 h-4 w-16 motion-reduce:animate-none animate-pulse bg-stone/40" />
          </li>
        ))}
      </ul>
    </Container>
  );
}