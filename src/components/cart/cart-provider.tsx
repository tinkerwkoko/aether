"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { buildProductIndex, itemCount, resolveLines, subtotal } from "@/lib/cart";
import type { ResolvedCartLine } from "@/lib/cart";
import { cartStore, configureCartProducts } from "@/lib/cart-store";
import type { CartProduct } from "@/lib/types";

type AddOptions = { size?: string; quantity?: number };

type CartContextValue = {
  lines: ResolvedCartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, options?: AddOptions) => boolean;
  removeItem: (productId: string, size?: string) => void;
  setQuantity: (productId: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The slim catalogue is fetched once in the root layout (a server component) and
 * handed down here, so the cart always displays current names and prices without
 * any browser-side fetching. Lines still store only productId, quantity and size.
 *
 * Guests can add to cart: nothing here requires an account.
 */
export function CartProvider({
  products,
  children,
}: {
  products: readonly CartProduct[];
  children: ReactNode;
}) {
  // Registered during render so it is in place before any consumer reads the store.
  // Idempotent: the same catalogue produces the same index.
  const index = buildProductIndex(products);
  configureCartProducts(products);

  const state = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: resolveLines(state, index),
      itemCount: itemCount(state),
      subtotal: subtotal(state, index),
      addItem: (productId, options) =>
        cartStore.addItem(productId, options?.size, options?.quantity ?? 1),
      removeItem: cartStore.removeItem,
      setQuantity: cartStore.setQuantity,
      clearCart: cartStore.clearCart,
    }),
    [state, index],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}