/**
 * Sends the order confirmation and records the result.
 *
 * The order is already committed by the time this runs. Every failure path here
 * is swallowed and recorded, never rethrown, so an email problem can never turn a
 * successful order into a failed one.
 *
 * Server-only: nothing here may be imported by client code.
 */

import "server-only";

import { getResendClient, getSenderAddress } from "@/lib/email/client";
import { buildOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import type { EmailItem } from "@/lib/email/order-confirmation";
import { formatOrderNumber } from "@/lib/format";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** A provider that never answers must not hold a request open. */
const SEND_TIMEOUT_MS = 8000;

export type SendResult = {
  sent: boolean;
  skipped?: "already_sent" | "not_configured" | "no_recipient";
};

type OrderRow = {
  id: string;
  order_number: number;
  total: number;
  confirmation_email_status: string | null;
  delivery_address: unknown;
  order_items: {
    product_id: string;
    quantity: number;
    price: number;
    size: string | null;
    products: { name: string } | { name: string }[] | null;
  }[] | null;
};

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readDelivery(value: unknown): {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  landmark?: string;
} {
  const row = (value ?? {}) as Record<string, unknown>;

  return {
    fullName: text(row.fullName),
    phone: text(row.phone),
    addressLine: text(row.addressLine),
    city: text(row.city),
    state: text(row.state),
    landmark: text(row.landmark) || undefined,
  };
}

/** The join can arrive as an object or an array; take the first usable one. */
function readProductName(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value;

  if (!first || typeof first !== "object") return "Aether piece";

  const name = (first as { name?: unknown }).name;
  return typeof name === "string" && name.length > 0 ? name : "Aether piece";
}

/** Records the outcome. A failure to record must never throw into the order. */
async function recordResult(
  orderId: string,
  status: "sent" | "failed",
): Promise<void> {
  try {
    const admin = createAdminSupabaseClient();

    const { error } = await admin
      .from("orders")
      .update({
        confirmation_email_status: status,
        confirmation_email_sent_at:
          status === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", orderId);

    if (error) {
      console.error(
        "[aether] could not record email status:",
        error.code,
        error.message,
      );
    }
  } catch (error) {
    console.error("[aether] could not record email status:", error);
  }
}

/** Increments the attempt counter, so a retry can be capped. */
export async function incrementEmailAttempts(orderId: string): Promise<void> {
  try {
    const admin = createAdminSupabaseClient();

    const { data } = await admin
      .from("orders")
      .select("confirmation_email_attempts")
      .eq("id", orderId)
      .limit(1);

    const current = data?.[0]?.confirmation_email_attempts;
    const next = typeof current === "number" ? current : 0;

    const { error } = await admin
      .from("orders")
      .update({ confirmation_email_attempts: next + 1 })
      .eq("id", orderId);

    if (error) {
      console.error("[aether] could not count email attempt:", error.message);
    }
  } catch (error) {
    console.error("[aether] could not count email attempt:", error);
  }
}

export async function sendOrderConfirmation(
  orderId: string,
  recipientEmail: string,
): Promise<SendResult> {
  try {
    // 1. Load the order with the admin client: trusted server code, run just
    //    after create_order committed it.
    const admin = createAdminSupabaseClient();

    const { data, error } = await admin
      .from("orders")
      .select(
        "id, order_number, total, confirmation_email_status, delivery_address, order_items(product_id, quantity, price, size, products(name))",
      )
      .eq("id", orderId)
      .limit(1);

    if (error) {
      console.error("[aether] email could not load order:", error.message);
      return { sent: false };
    }

    const order = data?.[0] as OrderRow | undefined;
    if (!order) return { sent: false };

    // 2. Never send a second confirmation for an order already sent. This is
    //    what makes a double-click or a retry safe.
    if (order.confirmation_email_status === "sent") {
      return { sent: false, skipped: "already_sent" };
    }

    if (!recipientEmail) {
      return { sent: false, skipped: "no_recipient" };
    }

    const configured = getResendClient();
    const from = getSenderAddress();

    if (!configured.configured || !from) {
      return { sent: false, skipped: "not_configured" };
    }

    const items: EmailItem[] = (order.order_items ?? []).map((item) => ({
      name: readProductName(item.products),
      size: item.size,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity,
    }));

    const email = buildOrderConfirmationEmail({
      orderId: order.id,
      orderNumber: formatOrderNumber(order.order_number),
      items,
      total: order.total,
      delivery: readDelivery(order.delivery_address),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
    });

    await incrementEmailAttempts(orderId);

    // 3. Send with an idempotency key so a repeated send cannot deliver twice,
    //    bounded by a timeout. An error object, a throw and a timeout are all
    //    treated as failure.
    let failure: unknown = null;

    try {
      const timed = await Promise.race([
        configured.client.emails.send(
          {
            from,
            to: recipientEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
          },
          { idempotencyKey: `order-confirmation-${orderId}` },
        ),
        new Promise<never>((_resolve, reject) =>
          setTimeout(
            () => reject(new Error("Email send timed out")),
            SEND_TIMEOUT_MS,
          ),
        ),
      ]);

      if (timed.error) failure = timed.error;
    } catch (error) {
      failure = error;
    }

    // 4. Record the outcome separately from the order itself.
    if (failure) {
      const name =
        typeof failure === "object" && failure !== null && "name" in failure
          ? String((failure as { name: unknown }).name)
          : "Error";
      const message =
        typeof failure === "object" && failure !== null && "message" in failure
          ? String((failure as { message: unknown }).message)
          : String(failure);

      // Name and message only: never the key, the body or the recipient.
      console.error(`[aether] confirmation email failed (${name}): ${message}`);

      await recordResult(orderId, "failed");
      return { sent: false };
    }

    await recordResult(orderId, "sent");
    return { sent: true };
  } catch (error) {
    // Nothing here may escape into the order flow.
    console.error("[aether] confirmation email could not be processed:", error);
    return { sent: false };
  }
}