/**
 * Placing an order.
 *
 * The browser sends product ids, quantities, sizes and delivery details. It never
 * sends a price, a total, a user id or any claim of ownership. Everything that
 * matters is recomputed here from the database, and the authoritative write is
 * one atomic call to create_order.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth';
import { deliverySchema } from '@/lib/checkout-schema';
import type { DeliveryErrors } from '@/lib/checkout-schema';
import { getProductsByIds } from '@/lib/data/products';
import { DELIVERY_FEE } from '@/lib/delivery';
import { sendOrderConfirmation } from '@/lib/email/send-order-confirmation';
import { formatOrderNumber } from '@/lib/format';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type PlaceOrderItem = {
  productId: string;
  quantity: number;
  size?: string;
};

export type PlaceOrderInput = {
  items: PlaceOrderItem[];
  delivery: unknown;
  idempotencyKey: string;
  expectedTotal: number;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string; total: number }
  | { ok: false; code: 'SIGN_IN_REQUIRED' }
  | {
      ok: false;
      code: 'INVALID_INPUT';
      message: string;
      fieldErrors?: DeliveryErrors;
    }
  | { ok: false; code: 'PRICE_CHANGED'; total: number }
  | { ok: false; code: 'OUT_OF_STOCK'; product: string; available: number }
  | { ok: false; code: 'PRODUCT_UNAVAILABLE'; product: string }
  | { ok: false; code: 'INVALID_SIZE'; product: string; size: string }
  | { ok: false; code: 'EMPTY_CART' }
  | { ok: false; code: 'FAILED'; message: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GENERIC_FAILURE: PlaceOrderResult = {
  ok: false,
  code: 'FAILED',
  message: "We couldn't place your order. Please try again.",
};

/** Validates the item list the browser sent. Bounded integers only. */
function parseItems(raw: unknown): PlaceOrderItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) return null;

  const items: PlaceOrderItem[] = [];

  for (const entry of raw) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof (entry as PlaceOrderItem).productId !== 'string' ||
      !UUID_PATTERN.test((entry as PlaceOrderItem).productId)
    ) {
      return null;
    }

    const quantity = Number((entry as PlaceOrderItem).quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return null;
    }

    const size = (entry as PlaceOrderItem).size;

    items.push({
      productId: (entry as PlaceOrderItem).productId,
      quantity,
      size:
        typeof size === 'string' && size.trim().length > 0
          ? size.trim()
          : undefined,
    });
  }

  return items;
}

/** Turns a database error into a friendly result, never a raw message. */
function mapDatabaseError(message: string): PlaceOrderResult {
  const stockMatch = /^Only (\d+) left of (.+)$/.exec(message);
  if (stockMatch) {
    return {
      ok: false,
      code: 'OUT_OF_STOCK',
      product: stockMatch[2],
      available: Number(stockMatch[1]),
    };
  }

  const sizeMatch = /^Size (.+) is not available for (.+)$/.exec(message);
  if (sizeMatch) {
    return {
      ok: false,
      code: 'INVALID_SIZE',
      product: sizeMatch[2],
      size: sizeMatch[1],
    };
  }

  const chooseSize = /^Choose a size for (.+)$/.exec(message);
  if (chooseSize) {
    return {
      ok: false,
      code: 'INVALID_SIZE',
      product: chooseSize[1],
      size: '',
    };
  }

  if (
    message.includes('no longer available') ||
    message.includes('does not come in sizes')
  ) {
    return {
      ok: false,
      code: 'PRODUCT_UNAVAILABLE',
      product: 'A piece in your cart',
    };
  }

  return GENERIC_FAILURE;
}

export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  // 1. Who is ordering. Taken from the verified session, never the browser.
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, code: 'SIGN_IN_REQUIRED' };
  }

  // 2. Validate everything the browser sent, before touching the database.
  if (!input || typeof input !== 'object') {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Something went wrong. Please try again.',
    };
  }

  if (
    typeof input.idempotencyKey !== 'string' ||
    input.idempotencyKey.length < 8 ||
    input.idempotencyKey.length > 200
  ) {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Something went wrong. Please try again.',
    };
  }

  const items = parseItems(input.items);

  if (!items) {
    return Array.isArray(input.items) && input.items.length > 20
      ? {
          ok: false,
          code: 'INVALID_INPUT',
          message: 'Too many items in one order.',
        }
      : { ok: false, code: 'EMPTY_CART' };
  }

  // 3. Delivery details, revalidated on the server with the shared schema.
  const parsedDelivery = deliverySchema.safeParse(input.delivery);

  if (!parsedDelivery.success) {
    const fieldErrors: DeliveryErrors = {};

    for (const issue of parsedDelivery.error.issues) {
      const field = issue.path[0];

      if (typeof field === 'string') {
        fieldErrors[field as keyof DeliveryErrors] = issue.message;
      }
    }

    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Please check your delivery details.',
      fieldErrors,
    };
  }

  const delivery = parsedDelivery.data;

  // 4. Authoritative products, and the total recomputed from the database.
  let products;

  try {
    products = await getProductsByIds(items.map((item) => item.productId));
  } catch (error) {
    console.error('[aether] order pricing lookup failed:', error);
    return GENERIC_FAILURE;
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  let serverTotal = DELIVERY_FEE;

  for (const item of items) {
    const product = byId.get(item.productId);

    if (!product) {
      return {
        ok: false,
        code: 'PRODUCT_UNAVAILABLE',
        product: 'A piece in your cart',
      };
    }

    if (product.stock < item.quantity) {
      return {
        ok: false,
        code: 'OUT_OF_STOCK',
        product: product.name,
        available: product.stock,
      };
    }

    serverTotal += product.price * item.quantity;
  }

  // 5. A price that moved since the page loaded needs a fresh confirmation.
  //    Nothing has been created at this point.
  if (
    typeof input.expectedTotal === 'number' &&
    input.expectedTotal !== serverTotal
  ) {
    return { ok: false, code: 'PRICE_CHANGED', total: serverTotal };
  }

  // 6. The single atomic write.
  try {
    const admin = createAdminSupabaseClient();

    const { data, error } = await admin.rpc('create_order', {
      p_user_id: user.id,
      p_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size ?? null,
      })),
      p_delivery: {
        fullName: delivery.fullName,
        phone: delivery.phone,
        addressLine: delivery.addressLine,
        city: delivery.city,
        state: delivery.state,
        landmark: delivery.landmark ?? null,
      },
      p_idempotency_key: input.idempotencyKey,
      p_delivery_fee: DELIVERY_FEE,
    });

    if (error) {
      // Technical detail stays on the server; the customer sees plain language.
      console.error('[aether] create_order failed:', error.code, error.message);
      return mapDatabaseError(error.message ?? '');
    }

    const row = Array.isArray(data)
      ? (data[0] as
          | {
              order_id?: unknown;
              order_number?: unknown;
              total?: unknown;
            }
          | undefined)
      : undefined;

    if (!row || typeof row.order_id !== 'string') {
      return GENERIC_FAILURE;
    }

    // already_existed means a double-click or retry reused the same key, so the
    // original order comes back. That is the duplicate protection working.
    const orderId = row.order_id;

    // The order is committed. Email is attempted afterwards, in its own
    // try/catch, and can never change the result returned below. When the order
    // already existed the send still runs: it returns early if the earlier
    // attempt succeeded, and retries if it did not.
    try {
      await sendOrderConfirmation(orderId, user.email ?? "");
    } catch (emailError) {
      console.error("[aether] confirmation email error (ignored):", emailError);
    }

    // Stock moved, so cached catalogue reads must be refreshed.
    revalidatePath("/shop");
    revalidatePath("/account");

    return {
      ok: true,
      orderId,
      orderNumber:
        typeof row.order_number === "number"
          ? formatOrderNumber(row.order_number)
          : `AE-${String(row.order_number ?? 0).padStart(6, "0")}`,
      total: typeof row.total === "number" ? row.total : serverTotal,
    };
  } catch (error) {
    console.error('[aether] create_order threw:', error);
    return GENERIC_FAILURE;
  }
}
