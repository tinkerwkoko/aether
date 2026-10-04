import type { CartProduct } from '@/lib/types';

/** Re-exported so cart components can import their types from one place. */
export type { CartProduct };

/**
 * A cart line stores only what identifies the product and how many.
 * Prices, names and images are always read from the catalogue passed in by the
 * root layout, and the server recalculates every total again in Stage 7.
 */
export type CartLine = {
  productId: string;
  quantity: number;
  /** Clothing only. */
  size?: string;
};

export type CartState = {
  lines: CartLine[];
};

export const EMPTY_CART: CartState = { lines: [] };

/** Products keyed by id, resolved against the real catalogue. */
export type ProductIndex = Map<string, CartProduct>;

export function buildProductIndex(
  products: readonly CartProduct[]
): ProductIndex {
  return new Map(products.map((product) => [product.id, product]));
}

export function lineKey(productId: string, size?: string): string {
  return `${productId}::${size ?? ''}`;
}

/**
 * Integer, minimum 1, never above the product's stock.
 * Returns 0 when the value is unusable, which means "do not add this line".
 */
export function normaliseQuantity(value: unknown, stock: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;

  const whole = Math.trunc(value);
  if (whole < 1) return 0;

  return Math.min(whole, Math.max(stock, 0));
}

/**
 * Rebuilds a cart from untrusted data (localStorage, or anything else).
 * Corrupt, outdated and unknown lines are dropped rather than repaired.
 *
 * Lines whose productId is no longer in the index are dropped. That is what
 * retires carts saved before the catalogue moved to Supabase, where the stored
 * ids were slugs rather than database ids.
 */
export function sanitiseCart(raw: unknown, index: ProductIndex): CartState {
  if (!raw || typeof raw !== 'object') return EMPTY_CART;

  const lines = (raw as { lines?: unknown }).lines;
  if (!Array.isArray(lines)) return EMPTY_CART;

  const byKey = new Map<string, CartLine>();

  for (const entry of lines) {
    if (!entry || typeof entry !== 'object') continue;

    const { productId, quantity, size } = entry as Record<string, unknown>;
    if (typeof productId !== 'string') continue;

    const product = index.get(productId);
    if (!product) continue;

    const wantedSize =
      typeof size === 'string' && size.length > 0 ? size : undefined;
    if (product.sizes && !wantedSize) continue;

    // Widened to string[] so an untrusted stored size can be checked against
    // the product's fixed size list.
    const availableSizes: readonly string[] = product.sizes ?? [];
    if (wantedSize && product.sizes && !availableSizes.includes(wantedSize))
      continue;

    const count = normaliseQuantity(quantity, product.stock);
    if (count < 1) continue;

    const key = lineKey(productId, wantedSize);
    const existing = byKey.get(key);
    const merged = existing
      ? Math.min(existing.quantity + count, product.stock)
      : count;

    byKey.set(key, {
      productId,
      quantity: merged,
      ...(wantedSize ? { size: wantedSize } : {}),
    });
  }

  return { lines: [...byKey.values()] };
}

export type ResolvedCartLine = { product: CartProduct; line: CartLine };

/** Resolves stored lines against the catalogue, dropping anything unknown. */
export function resolveLines(
  state: CartState,
  index: ProductIndex
): ResolvedCartLine[] {
  const resolved: ResolvedCartLine[] = [];

  for (const line of state.lines) {
    const product = index.get(line.productId);
    if (!product) continue;

    const quantity = normaliseQuantity(line.quantity, product.stock);
    if (quantity < 1) continue;

    resolved.push({ product, line: { ...line, quantity } });
  }

  return resolved;
}

/** Presentation only. Stage 7 recalculates authoritatively on the server. */
export function itemCount(state: CartState): number {
  return state.lines.reduce((total, line) => total + line.quantity, 0);
}

export function subtotal(state: CartState, index: ProductIndex): number {
  return resolveLines(state, index).reduce(
    (total, { product, line }) => total + product.price * line.quantity,
    0
  );
}
