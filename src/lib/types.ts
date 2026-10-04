/**
 * Shared storefront types.
 *
 * These mirror the Supabase schema in supabase/migrations/0001_schema.sql and
 * are mapped from database rows in src/lib/data/products.ts. Every page and
 * component imports from here rather than from a database client, so the shape
 * the UI sees is defined in one place.
 */

export const CATEGORY_SLUGS = [
  "fashion",
  "tech-accessories",
  "home-desk",
  "self-care",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export function isCategorySlug(value: unknown): value is CategorySlug {
  return (
    typeof value === "string" &&
    (CATEGORY_SLUGS as readonly string[]).includes(value)
  );
}

/** Human category label for breadcrumbs and card text. */
export function getCategoryName(slug: CategorySlug): string {
  switch (slug) {
    case "fashion":
      return "Fashion";
    case "tech-accessories":
      return "Tech & Accessories";
    case "home-desk":
      return "Home & Desk";
    case "self-care":
      return "Self-Care";
  }
}

export type ProductSize = "S" | "M" | "L" | "XL";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  /** Whole naira. */
  price: number;
  stock: number;
  category: CategorySlug;
  image: string | null;
  sizes?: readonly ProductSize[];
  details?: readonly string[];
  material?: string;
  dimensions?: string;
  createdAt: string;
};

/**
 * The subset the cart needs. Cart lines still store only id, quantity and size;
 * everything else is display data read from the catalogue at render time.
 */
export type CartProduct = Pick<
  Product,
  "id" | "name" | "slug" | "price" | "stock" | "category" | "image" | "sizes"
>;

export type SortValue = "newest" | "price-asc" | "price-desc";

export const SORT_LABELS: Record<SortValue, string> = {
  newest: "Newest",
  "price-asc": "Price low to high",
  "price-desc": "Price high to low",
};

/**
 * Category taglines are brand copy, not catalogue data, so they live here rather
 * than in the database.
 */
const CATEGORY_TAGLINES: Record<CategorySlug, string> = {
  fashion: "Everyday pieces, considered.",
  "tech-accessories": "Useful tools for modern life.",
  "home-desk": "Make space for better work and living.",
  "self-care": "Small rituals, thoughtfully chosen.",
};

export function categoryTagline(slug: CategorySlug): string {
  return CATEGORY_TAGLINES[slug];
}
