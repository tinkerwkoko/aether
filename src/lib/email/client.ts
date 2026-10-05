/**
 * Resend client.
 *
 * A missing key is NOT thrown into the order flow. An order is already committed
 * by the time email is attempted, so a misconfigured email service must not break
 * checkout - it is reported as "not configured" and logged by variable name only.
 *
 * Server-only: the API key must never reach a browser bundle.
 */

import "server-only";

import { Resend } from "resend";

export type EmailClientResult =
  | { configured: true; client: Resend }
  | { configured: false };

/**
 * Returns the Resend client, or a "not configured" result.
 * Never throws, and never logs a value.
 */
export function getResendClient(): EmailClientResult {
  // Literal reads so the values are inlined rather than looked up dynamically.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  const missing: string[] = [];

  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!from) missing.push("RESEND_FROM_EMAIL");

  if (missing.length > 0) {
    console.error(
      `[aether] confirmation email is not configured; missing: ${missing.join(", ")}`,
    );
    return { configured: false };
  }

  return { configured: true, client: new Resend(apiKey) };
}

/** The verified sender address, or null when it is not configured. */
export function getSenderAddress(): string | null {
  return process.env.RESEND_FROM_EMAIL || null;
}
