import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResendConfirmationButton } from "@/components/account/resend-confirmation-button";
import { OrderDetailBlock } from "@/components/checkout/order-detail-block";
import { Container } from "@/components/layout/container";
import { requireUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data/orders";
import { emailStatusLine } from "@/lib/email-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireUser("/account/orders");
  const { orderId } = await params;

  const order = await getOrderForUser(orderId);
  if (!order) notFound();

  // RLS applies to this read too.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("confirmation_email_status")
    .eq("id", orderId)
    .limit(1);

  const emailStatus = data?.[0]?.confirmation_email_status ?? null;

  return (
    <Container className="py-12 sm:py-16">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        {order.orderNumber}
      </p>

      <h1 className="mt-6 font-display text-4xl sm:text-5xl">Order</h1>

      <p className="mt-6 max-w-xl text-sm text-muted">
        {emailStatusLine(emailStatus, user.email ?? null)}
      </p>

      {emailStatus !== "sent" ? (
        <ResendConfirmationButton orderId={orderId} />
      ) : null}

      <div className="mt-10">
        <OrderDetailBlock order={order} />
      </div>
    </Container>
  );
}