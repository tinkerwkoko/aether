"use client";

/**
 * Reads the customer's saved product ids with the browser client.
 *
 * RLS limits the rows to their owner. Runs in the browser, so it is only ever
 * called for a signed-in visitor.
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getSavedProductIds(): Promise<string[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("saved_items")
    .select("product_id");

  if (error) {
    throw new Error("We couldn't load your saved pieces right now.");
  }

  return (data ?? [])
    .map((row) => (row as { product_id?: unknown }).product_id)
    .filter((id): id is string => typeof id === "string");
}