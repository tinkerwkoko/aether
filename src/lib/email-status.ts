/**
 * The honest line about the confirmation email.
 *
 * It only says an email was sent when the provider actually accepted it. When it
 * failed or was never attempted, the order is still confirmed and the customer is
 * pointed at their account rather than told something untrue.
 */
export function emailStatusLine(
  status: string | null,
  recipientEmail: string | null,
): string {
  if (status === "sent") {
    return recipientEmail
      ? `A confirmation email has been sent to ${recipientEmail}.`
      : "A confirmation email has been sent.";
  }

  return "Your order is confirmed. We couldn't send the confirmation email, but you can find your order any time in your account.";
}