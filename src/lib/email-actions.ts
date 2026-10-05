"use server";

/**
 * Resends an order confirmation email.
 *
 * The user is verified on the server and the order is loaded through the normal
 * server client, so RLS proves ownership before anything is sent. Capped at
 * three attempts per order, and refused once an email has been sent.
 */

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 3;

export type ResendResult = {
  ok: boolean;
  message: string;
};

export async function resendConfirmationEmail(
  orderId: string,
): Promise<ResendResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Please sign in to resend the confirmation email.",
    };
  }

  const supabase = await createSupabaseServerClient();

  // RLS means this only finds an order that belongs to the signed-in customer.
  const { data, error } = await supabase
    .from("orders")
    .select("id, confirmation_email_status, confirmation_email_attempts")
    .eq("id", orderId)
    .limit(1);

  if (error) {
    console.error("[aether] resend could not read order:", error.message);
    return {
      ok: false,
      message: "We couldn't resend that email right now.",
    };
  }

  const order = data?.[0];

  if (!order) {
    return {
      ok: false,
      message: "We couldn't find that order on your account.",
    };
  }

  if (order.confirmation_email_status === "sent") {
    return {
      ok: false,
      message: "A confirmation email has already been sent for this order.",
    };
  }

  const attempts = order.confirmation_email_attempts ?? 0;

  if (attempts >= MAX_ATTEMPTS) {
    return {
      ok: false,
      message: "We've tried to resend this email a few times already.",
    };
  }

  const result = await sendOrderConfirmation(orderId, user.email ?? "");

  if (!result.sent) {
    return {
      ok: false,
      message:
        "We couldn't send the confirmation email. Your order is still confirmed.",
    };
  }

  revalidatePath(`/account/orders/${orderId}`);

  return {
    ok: true,
    message: "We've sent the confirmation email again.",
  };
}