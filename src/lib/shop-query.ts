import { CATEGORIES, CATALOGUE, CATEGORY_NAMES } from "@/lib/catalogue";
import type { Product } from "@/lib/catalogue";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type ShopQuery = {
  category: string;
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

  return {
    category: first(params.category),
    q: first(params.q).trim(),
    sort: SORT_OPTIONS.some((option) => option.value === sort)
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

function matchesQuery(product: Product, needle: string): boolean {
  return (
    product.name.toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle) ||
    CATEGORY_NAMES[product.category].toLowerCase().includes(needle) ||
    (product.shortDescription?.toLowerCase().includes(needle) ?? false)
  );
}

/** Applies category, search and sort. Returns exactly what should be shown. */
export function selectProducts(query: ShopQuery): Product[] {
  let results = CATALOGUE;

  if (query.category) {
    results = results.filter((product) => product.category === query.category);
  }

  if (query.q) {
    const needle = query.q.toLowerCase();
    results = results.filter((product) => matchesQuery(product, needle));
  }

  const sorted = [...results];
  if (query.sort === "price-asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (query.sort === "price-desc") {
    sorted.sort((a, b) => b.price - a.price);
  } else {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return sorted;
}

export function filterLinkClass(isActive: boolean): string {
  const base =
    "inline-flex h-11 items-center text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:text-charcoal";

  return isActive
    ? `${base} border-b border-charcoal text-charcoal`
    : `${base} border-b border-transparent text-charcoal/60`;
}