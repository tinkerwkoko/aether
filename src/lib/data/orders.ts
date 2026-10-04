/**
 * Order history for the signed-in customer.
 *
 * Reads through the server client using the user's own session, so RLS is what
 * limits rows to them. Nothing is cached: per-user data must never be shared
 * between requests.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
};

type OrderRow = {
  id: string;
  order_number: number;
  created_at: string;
  total: number;
  status: string;
  order_items: { count: number }[] | null;
};

/** Customers see AE-000123, derived from the identity column. */
function formatOrderNumber(orderNumber: number): string {
  return `AE-${String(orderNumber).padStart(6, "0")}`;
}

function toStatus(value: string): OrderStatus {
  return value in ORDER_STATUS_LABELS ? (value as OrderStatus) : "pending";
}

export async function getOrdersForUser(): Promise<OrderSummary[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, total, status, order_items(count)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[aether] order history failed:", error.message);
      throw new Error("We couldn't load your orders right now.");
    }

    return ((data ?? []) as OrderRow[]).map((row) => ({
      id: row.id,
      orderNumber: formatOrderNumber(row.order_number),
      createdAt: row.created_at,
      total: row.total,
      status: toStatus(row.status),
      itemCount: row.order_items?.[0]?.count ?? 0,
    }));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("We couldn't")) {
      throw error;
    }

    console.error("[aether] order history failed:", error);
    throw new Error("We couldn't load your orders right now.");
  }
}