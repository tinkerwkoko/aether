import {
  EMPTY_CART,
  lineKey,
  normaliseQuantity,
  sanitiseCart,
} from "@/lib/cart";
import type { CartState, ProductIndex } from "@/lib/cart";
import type { CartProduct } from "@/lib/types";

const STORAGE_KEY = "aether.cart.v1";

let current: CartState = EMPTY_CART;
let loaded = false;
let products: ProductIndex = new Map<string, CartProduct>();
const listeners = new Set<() => void>();

/**
 * Registers the real catalogue so stored lines can be validated against it.
 * Called by CartProvider before any consumer renders. Carts saved before the
 * catalogue moved to Supabase hold slugs, which no longer match any id, so those
 * lines are dropped rather than crashing the page.
 */
export function configureCartProducts(next: readonly CartProduct[]): void {
  products = new Map(next.map((product) => [product.id, product]));

  // Re-validate an already-loaded cart against the new catalogue.
  if (loaded) {
    const cleaned = sanitiseCart(current, products);
    if (cleaned.lines.length !== current.lines.length) {
      commit(cleaned);
    }
  }
}

function readStorage(): CartState {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    return sanitiseCart(JSON.parse(raw), products);
  } catch {
    return EMPTY_CART;
  }
}

function writeStorage(state: CartState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The cart still works for
    // this session, it just will not survive a refresh.
  }
}

function ensureLoaded(): CartState {
  if (!loaded) {
    loaded = true;
    current = readStorage();
  }
  return current;
}

/**
 * Until the store has loaded this returns the very same reference as the server
 * snapshot, so hydration never mismatches. Loading happens in subscribe(), which
 * React calls after hydration, so no setState-in-effect is needed.
 */
function getSnapshot(): CartState {
  return loaded ? current : EMPTY_CART;
}

function getServerSnapshot(): CartState {
  return EMPTY_CART;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (!loaded) {
    loaded = true;
    const stored = readStorage();

    if (stored.lines.length > 0) {
      current = stored;
      for (const notify of listeners) notify();
    }
  }

  return () => {
    listeners.delete(listener);
  };
}

function commit(next: CartState): void {
  current = next;
  writeStorage(next);
  for (const listener of listeners) listener();
}

function addItem(productId: string, size?: string, quantity = 1): boolean {
  const product = products.get(productId);
  if (!product || product.stock < 1) return false;

  const wantedSize = size && size.length > 0 ? size : undefined;

  // Widened to string[] so the requested size can be checked against the
  // product's fixed size list.
  const availableSizes: readonly string[] = product.sizes ?? [];
  if (product.sizes && (!wantedSize || !availableSizes.includes(wantedSize))) return false;

  const count = normaliseQuantity(quantity, product.stock);
  if (count < 1) return false;

  const state = ensureLoaded();
  const key = lineKey(productId, wantedSize);
  const lines = [...state.lines];
  const index = lines.findIndex(
    (line) => lineKey(line.productId, line.size) === key,
  );

  if (index === -1) {
    lines.push({
      productId,
      quantity: count,
      ...(wantedSize ? { size: wantedSize } : {}),
    });
  } else {
    const existing = lines[index];
    lines[index] = {
      ...existing,
      quantity: Math.min(existing.quantity + count, product.stock),
    };
  }

  commit({ lines });
  return true;
}

function removeItem(productId: string, size?: string): void {
  const state = ensureLoaded();
  const key = lineKey(productId, size);
  commit({
    lines: state.lines.filter(
      (line) => lineKey(line.productId, line.size) !== key,
    ),
  });
}

function setQuantity(productId: string, size: string | undefined, quantity: number): void {
  const product = products.get(productId);
  if (!product) return;

  const state = ensureLoaded();
  const key = lineKey(productId, size);
  const lines = [...state.lines];
  const index = lines.findIndex(
    (line) => lineKey(line.productId, line.size) === key,
  );
  if (index === -1) return;

  const next = normaliseQuantity(quantity, product.stock);
  if (next < 1) {
    // Never store zero: an invalid quantity removes the line instead.
    commit({ lines: lines.filter((line) => lineKey(line.productId, line.size) !== key) });
    return;
  }

  lines[index] = { ...lines[index], quantity: next };
  commit({ lines });
}

function clearCart(): void {
  commit(EMPTY_CART);
}

export const cartStore = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  addItem,
  removeItem,
  setQuantity,
  clearCart,
};