"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { signInWithGoogle } from "@/lib/auth-client";

const buttonClass =
  "inline-flex h-12 w-full items-center justify-center gap-3 bg-charcoal px-6 text-[0.72rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-olive disabled:pointer-events-none disabled:bg-charcoal/50";

/**
 * The one way in: Continue with Google.
 * Aether never handles passwords, so there is nothing to type here.
 */
export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await signInWithGoogle(nextPath);
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={buttonClass}
    >
      {pending ? (
        <>
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" aria-hidden />
          Redirecting
        </>
      ) : (
        <>
          <GoogleMark />
          Continue with Google
        </>
      )}
    </button>
  );
}

/** The Google "G". Drawn inline so no extra icon dependency is needed. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H1v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H1a9 9 0 0 0 0 8.12l2.97-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 1 4.94l2.97 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}