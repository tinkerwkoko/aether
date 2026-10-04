import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderDetailBlock } from "@/components/checkout/order-detail-block";
import { Container } from "@/components/layout/container";
import { requireUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireUser(`/account/orders`);
  const { orderId } = await params;

  const order = await getOrderForUser(orderId);
  if (!order) notFound();

  return (
    <Container className="py-12 sm:py-16">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        {order.orderNumber}
      </p>

      <h1 className="mt-6 font-display text-4xl sm:text-5xl">Order</h1>

      <div className="mt-10">
        <OrderDetailBlock order={order} />
      </div>
    </Container>
  );
}