import { Container } from "@/components/layout/container";

/** Skeleton grid for saved pieces, matching the real card grid. */
export default function SavedLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="sr-only">Loading your saved pieces</p>

      <div
        aria-hidden="true"
        className="h-3 w-20 motion-reduce:animate-none animate-pulse bg-stone/50"
      />
      <div
        aria-hidden="true"
        className="mt-6 h-10 w-64 motion-reduce:animate-none animate-pulse bg-stone/60"
      />

      <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} aria-hidden="true">
            <div className="aspect-4/5 w-full motion-reduce:animate-none animate-pulse bg-stone/50" />
            <div className="mt-4 h-3 w-20 motion-reduce:animate-none animate-pulse bg-stone/50" />
            <div className="mt-3 h-4 w-32 motion-reduce:animate-none animate-pulse bg-stone/50" />
          </li>
        ))}
      </ul>
    </Container>
  );
}