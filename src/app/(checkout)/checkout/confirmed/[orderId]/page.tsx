import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderDetailBlock } from "@/components/checkout/order-detail-block";
import { requireUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data/orders";
import { emailStatusLine } from "@/lib/email-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireUser("/checkout");
  const { orderId } = await params;

  // RLS means another customer's order simply is not there.
  const order = await getOrderForUser(orderId);
  if (!order) notFound();

  // The email status is read through the normal server client, so RLS applies.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("confirmation_email_status")
    .eq("id", orderId)
    .limit(1);

  const emailStatus = data?.[0]?.confirmation_email_status ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        {order.orderNumber}
      </p>

      <h1 className="mt-6 font-display text-4xl sm:text-5xl">Order confirmed.</h1>

      <p className="mt-6 text-sm text-muted">
        {emailStatusLine(emailStatus, user.email ?? null)}
      </p>

      <div className="mt-10">
        <OrderDetailBlock order={order} />
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-8">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
        >
          Continue Shopping
        </Link>

        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex h-12 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
        >
          View Order
        </Link>
      </div>
    </div>
  );
}