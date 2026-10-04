import { Container } from "@/components/layout/container";

/**
 * Skeleton for the account page: the structure is known, so the shape matches.
 * Pulses are disabled under prefers-reduced-motion.
 */
export default function AccountLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="sr-only">Loading your account</p>

      <div
        aria-hidden="true"
        className="h-10 w-48 motion-reduce:animate-none animate-pulse bg-stone/60"
      />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <div className="h-3 w-20 motion-reduce:animate-none animate-pulse bg-stone/50" />
          <div className="mt-4 h-7 w-40 motion-reduce:animate-none animate-pulse bg-stone/50" />
          <div className="mt-3 h-4 w-56 motion-reduce:animate-none animate-pulse bg-stone/40" />
          <div className="mt-8 h-11 w-28 border-b border-line motion-reduce:animate-none animate-pulse bg-stone/30" />
        </div>

        <div>
          <div className="h-3 w-32 motion-reduce:animate-none animate-pulse bg-stone/50" />
          <div className="mt-6 h-40 w-full border border-line motion-reduce:animate-none animate-pulse bg-stone/30" />
        </div>
      </div>
    </Container>
  );
}