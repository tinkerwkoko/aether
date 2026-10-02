/**
 * Stage 0 placeholder.
 * Intentionally not the Aether homepage - the storefront is built stage by stage.
 */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-xl font-normal tracking-[0.45em] uppercase">
        Aether
      </h1>
      <p className="text-sm text-foreground/70">Things worth having.</p>
      <p className="max-w-xs text-xs leading-relaxed text-foreground/50">
        Placeholder page. The Aether storefront is built one stage at a time.
      </p>
    </main>
  );
}

