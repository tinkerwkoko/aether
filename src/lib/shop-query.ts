/**
 * Shop URL parsing and link building.
 *
 * Only the query-string shape lives here. The filtering and sorting itself is
 * done by the database in src/lib/data/products.ts, so results are always real
 * rows rather than a filtered copy of a static list.
 */

import { isCategorySlug } from "@/lib/types";
import type { CategorySlug, SortValue } from "@/lib/types";

export const SORT_VALUES: readonly SortValue[] = [
  "newest",
  "price-asc",
  "price-desc",
];

export type ShopQuery = {
  category: CategorySlug | "";
  q: string;
  sort: SortValue;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Reads ?category=, ?q= and ?sort= into one query object. */
export function parseShopQuery(
  params: Record<string, string | string[] | undefined>,
): ShopQuery {
  const sort = first(params.sort);
  const category = first(params.category);

  return {
    category: isCategorySlug(category) ? category : "",
    q: first(params.q).trim(),
    sort: SORT_VALUES.includes(sort as SortValue)
      ? (sort as SortValue)
      : "newest",
  };
}

/** Builds a real /shop link that preserves the other active filters. */
export function shopHref(
  current: ShopQuery,
  overrides: Partial<ShopQuery> = {},
): string {
  const next = { ...current, ...overrides };
  const search = new URLSearchParams();

  if (next.category) search.set("category", next.category);
  if (next.q) search.set("q", next.q);
  if (next.sort !== "newest") search.set("sort", next.sort);

  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function filterLinkClass(isActive: boolean): string {
  const base =
    "inline-flex h-11 items-center text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:text-charcoal";

  return isActive
    ? `${base} border-b border-charcoal text-charcoal`
    : `${base} border-b border-transparent text-charcoal/60`;
}
