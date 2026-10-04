/**
 * Saved items for the signed-in customer.
 *
 * The Saved page reads the product ids server-side, then resolves them through
 * the public catalogue. RLS limits the ids to their owner.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProductsByIds } from "@/lib/data/products";
import type { Product } from "@/lib/types";

export async function getSavedProductIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("saved_items")
      .select("product_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[aether] saved items failed:", error.message);
      throw new Error("We couldn't load your saved pieces right now.");
    }

    return (data ?? [])
      .map((row) => (row as { product_id?: unknown }).product_id)
      .filter((id): id is string => typeof id === "string");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("We couldn't")) {
      throw error;
    }

    console.error("[aether] saved items failed:", error);
    throw new Error("We couldn't load your saved pieces right now.");
  }
}

/** Saved products as full products, for the Saved page grid. */
export async function getSavedProducts(): Promise<Product[]> {
  const ids = await getSavedProductIds();

  if (ids.length === 0) return [];

  return getProductsByIds(ids);
}