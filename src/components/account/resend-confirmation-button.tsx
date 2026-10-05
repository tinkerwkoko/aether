"use client";

/**
 * Resends the confirmation email for an order the customer has already seen.
 * Disables while pending, announces the outcome, and the page refreshes so the
 * real status is shown rather than an optimistic guess.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

import { resendConfirmationEmail } from "@/lib/email-actions";

export function ResendConfirmationButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    if (pending) return;

    setPending(true);
    setMessage("");

    try {
      const result = await resendConfirmationEmail(orderId);
      setMessage(result.message);

      if (result.ok) {
        router.refresh();
      }
    } catch {
      setMessage("We couldn't resend that email right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-11 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive disabled:pointer-events-none disabled:text-muted"
      >
        {pending ? "Sending" : "Send confirmation email again"}
      </button>

      <p aria-live="polite" className="mt-3 text-xs text-muted">
        {message}
      </p>
    </div>
  );
}