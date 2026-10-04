/**
 * Order history for the signed-in customer.
 *
 * Reads through the server client using the user's own session, so RLS is what
 * limits rows to them. Nothing is cached: per-user data must never be shared
 * between requests.
 */

import "server-only";

import { unstable_rethrow } from "next/navigation";

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

/** A single order, with its items and delivery details. Null when not found. */
export type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  delivery: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    landmark?: string;
  } | null;
  items: {
    productId: string;
    slug: string;
    name: string;
    size: string | null;
    quantity: number;
    price: number;
    lineTotal: number;
  }[];
};

type DeliveryRow = {
  full_name?: unknown;
  phone?: unknown;
  address_line?: unknown;
  city?: unknown;
  state?: unknown;
  landmark?: unknown;
};

function toDelivery(value: unknown): OrderDetail["delivery"] {
  if (!value || typeof value !== "object") return null;

  const row = value as DeliveryRow;
  const text = (input: unknown) =>
    typeof input === "string" && input.length > 0 ? input : "";

  return {
    fullName: text(row.full_name),
    phone: text(row.phone),
    addressLine: text(row.address_line),
    city: text(row.city),
    state: text(row.state),
    landmark: text(row.landmark) || undefined,
  };
}

/**
 * The joined product. PostgREST returns an embedded resource as an object for a
 * to-one relationship but an array if the relation were to-many, so both shapes
 * are normalised here, exactly as the category join is in data/products.ts.
 */
type JoinedProduct = { slug: string; name: string } | { slug: string; name: string }[];

function isJoinedProduct(value: unknown): value is JoinedProduct {
  const entries = Array.isArray(value) ? value : [value];

  return (
    entries.length > 0 &&
    entries.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as { slug?: unknown }).slug === "string" &&
        typeof (entry as { name?: unknown }).name === "string",
    )
  );
}

/** The first joined product, or null when the join is unusable. */
function resolveJoinedProduct(value: unknown): { slug: string; name: string } | null {
  if (!isJoinedProduct(value)) return null;

  const first = Array.isArray(value) ? value[0] : value;
  return first ?? null;
}

type DetailRow = {
  id: string;
  order_number: number;
  created_at: string;
  total: number;
  status: string;
  delivery_address: unknown;
  order_items: {
    product_id: string;
    quantity: number;
    price: number;
    size: string | null;
    products: JoinedProduct | null;
  }[] | null;
};

/**
 * One order for the signed-in customer.
 *
 * Uses the normal server client with the user's own session, so RLS is what
 * stops them reading somebody else's order. The admin client is never used for
 * a read.
 */
export async function getOrderForUser(orderId: string): Promise<OrderDetail | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!UUID_PATTERN.test(orderId)) return null;

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, total, status, delivery_address, order_items(product_id, quantity, price, size, products(slug, name))",
      )
      .eq("id", orderId)
      .limit(1);

    if (error) {
      console.error("[aether] order detail failed:", error.message);
      throw new Error("We couldn't load that order right now.");
    }

    const row = (data ?? [])[0] as DetailRow | undefined;
    if (!row) return null;

    return {
      id: row.id,
      orderNumber: formatOrderNumber(row.order_number),
      createdAt: row.created_at,
      total: row.total,
      status: toStatus(row.status),
      delivery: toDelivery(row.delivery_address),
      items: (row.order_items ?? []).map((item) => {
        // The join may be absent or malformed, so it is normalised safely and
        // the line still renders with a neutral name.
        const product = resolveJoinedProduct(item.products);

        return {
          productId: item.product_id,
          slug: product?.slug ?? "",
          name: product?.name ?? "Aether piece",
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          lineTotal: item.price * item.quantity,
        };
      }),
    };
  } catch (error) {
    // Next.js throws from cookies() to signal dynamic rendering. That is control
    // flow, not a failure, so it must be rethrown before anything is logged.
    unstable_rethrow(error);

    if (error instanceof Error && error.message.startsWith("We couldn't")) {
      throw error;
    }

    console.error("[aether] order detail failed:", error);
    throw new Error("We couldn't load that order right now.");
  }
}

/** Customers see AE-000123, derived from the identity column. */
function formatOrderNumber(orderNumber: number): string {
  return `AE-${String(orderNumber).padStart(6, "0")}`;
}

/** An order id arrives from the URL, so it is checked before use. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    // Next.js throws from cookies() to signal dynamic rendering: rethrow first.
    unstable_rethrow(error);

    if (error instanceof Error && error.message.startsWith("We couldn't")) {
      throw error;
    }

    console.error("[aether] order history failed:", error);
    throw new Error("We couldn't load your orders right now.");
  }
}