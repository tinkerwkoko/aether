import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { CheckoutFooter } from "@/components/layout/checkout-footer";
import { Container } from "@/components/layout/container";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Aether account.",
  robots: { index: false, follow: false },
};

/** Same rule as the OAuth callback: only same-site relative paths. */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  if (raw.startsWith("/\\")) return "/account";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next ?? null);
  const failed = params.error === "1";

  // Already signed in: nothing to do here.
  const user = await getCurrentUser();
  if (user) {
    redirect(next);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <Container className="flex flex-1 flex-col justify-center py-20">
        <div className="mx-auto w-full max-w-sm">
          <p className="font-display text-base uppercase tracking-[0.3em]">
            Aether
          </p>

          <h1 className="mt-10 font-display text-3xl sm:text-4xl">
            Sign in to Aether
          </h1>

          <p className="mt-4 text-sm text-muted">
            One account for your orders and the pieces you save.
          </p>

          {failed ? (
            <p
              role="alert"
              className="mt-6 border border-line p-4 text-sm text-charcoal"
            >
              We couldn&apos;t sign you in. Please try again.
            </p>
          ) : null}

          <div className="mt-8">
            <GoogleSignInButton nextPath={next} />
          </div>

          <p className="mt-6 text-xs text-muted">
            Google handles your sign-in. Aether never sees your password.
          </p>

          <Link
            href="/"
            className="mt-10 inline-block text-sm text-charcoal underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-olive hover:decoration-olive"
          >
            Continue as a guest
          </Link>
        </div>
      </Container>

      <CheckoutFooter />
    </div>
  );
}