/**
 * Public catalogue reads.
 *
 * Uses the cookie-less Supabase client, so these queries are anonymous and the
 * shop and product pages stay statically renderable. Rows are validated and
 * mapped to the shared Product type; a page never sees a raw database row or a
 * raw PostgREST error.
 */

import "server-only";

import { unstable_cache } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { isCategorySlug } from "@/lib/types";
import type {
  CartProduct,
  CategorySlug,
  Product,
  ProductSize,
  SortValue,
} from "@/lib/types";

/** Public data changes rarely; 60 seconds keeps the site static but fresh. */
const REVALIDATE_SECONDS = 60;

/** One query, one join, only the columns the UI actually uses. */
const PRODUCT_SELECT = `
  id,
  slug,
  name,
  description,
  short_description,
  price,
  stock,
  is_featured,
  sizes,
  details,
  material,
  dimensions,
  created_at,
  image_url,
  categories!inner ( id, slug, name )
`;

/**
 * The joined category. PostgREST returns an embedded resource as an object for a
 * to-one relationship, but an array if the relation were to-many, so both shapes
 * are represented and normalised by resolveCategorySlug.
 */
type JoinedCategory = { slug: string; name: string } | { slug: string; name: string }[];

type ProductRow = {
  id: unknown;
  slug: unknown;
  name: unknown;
  description: unknown;
  short_description: unknown;
  price: unknown;
  stock: unknown;
  sizes: unknown;
  details: unknown;
  material: unknown;
  dimensions: unknown;
  created_at: unknown;
  image_url: unknown;
  categories: JoinedCategory | null;
};

function isJoinedCategory(value: unknown): value is JoinedCategory {
  if (Array.isArray(value)) {
    return value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as { slug?: unknown }).slug === "string" &&
        typeof (entry as { name?: unknown }).name === "string",
    );
  }

  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { slug?: unknown }).slug === "string" &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

/**
 * Pulls the category slug out of a joined value, taking the first element when
 * the relation came back as an array. Returns null when there is no usable
 * category, which means the whole row is untrustworthy.
 */
function resolveCategorySlug(value: unknown): CategorySlug | null {
  if (!isJoinedCategory(value)) return null;

  const first = Array.isArray(value) ? value[0] : value;
  if (!first) return null;

  return isCategorySlug(first.slug) ? first.slug : null;
}

/**
 * Maps one database row to a Product, or returns null when the row cannot be
 * trusted (missing text, negative money, unknown category). Invalid rows are
 * skipped rather than rendered half-correct.
 */
function mapRow(row: ProductRow): Product | null {
  const category = resolveCategorySlug(row.categories);

  if (!category) return null;
  if (typeof row.id !== "string" || typeof row.slug !== "string") return null;
  if (typeof row.name !== "string" || typeof row.description !== "string") {
    return null;
  }
  if (typeof row.price !== "number" || row.price < 0) return null;
  if (typeof row.stock !== "number" || row.stock < 0) return null;

  const sizes = Array.isArray(row.sizes)
    ? (row.sizes.filter(
        (size): size is ProductSize =>
          size === "S" || size === "M" || size === "L" || size === "XL",
      ) as ProductSize[])
    : undefined;

  const details = Array.isArray(row.details)
    ? row.details.filter((detail): detail is string => typeof detail === "string")
    : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription:
      typeof row.short_description === "string" ? row.short_description : undefined,
    price: Math.trunc(row.price),
    stock: Math.trunc(row.stock),
    category,
    image: typeof row.image_url === "string" ? row.image_url : null,
    sizes: sizes && sizes.length > 0 ? sizes : undefined,
    details: details && details.length > 0 ? details : undefined,
    material: typeof row.material === "string" ? row.material : undefined,
    dimensions: typeof row.dimensions === "string" ? row.dimensions : undefined,
    createdAt:
      typeof row.created_at === "string" ? row.created_at : new Date(0).toISOString(),
  };
}

/**
 * Escapes the characters that would otherwise change a LIKE pattern's meaning.
 * Without this, a user searching for "50%" would match everything.
 */
function escapeSearchTerm(term: string): string {
  return term.replace(/[%_\\]/g, (character) => `\\${character}`);
}

/**
 * Maps a query result to products. Technical failures are logged server-side and
 * the caller is given a friendly message, so a page never renders a PostgREST
 * error code. This is what error.tsx displays.
 */
function toProducts(
  result: { data: ProductRow[] | null; error: PostgrestError | null },
  label: string,
): Product[] {
  if (result.error) {
    console.error(
      `[aether] catalogue read failed (${label}):`,
      result.error.code,
      result.error.message,
    );
    throw new Error("We couldn't load the collection right now.");
  }

  return (result.data ?? [])
    .map((row) => mapRow(row))
    .filter((product): product is Product => product !== null);
}

export type ProductQueryOptions = {
  category?: CategorySlug | "";
  q?: string;
  sort?: SortValue;
};

export type Category = {
  id: string;
  name: string;
  slug: CategorySlug;
};

/** The four Aether categories, from the database, in display order. */
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true })
        .overrideTypes<{ id: string; name: string; slug: string }[], { merge: false }>();

      if (error) {
        console.error("[aether] category read failed:", error.code, error.message);
        throw new Error("We couldn't load the collection right now.");
      }

      return (data ?? [])
        .filter(
          (row): row is { id: string; name: string; slug: CategorySlug } =>
            typeof row.id === "string" &&
            typeof row.name === "string" &&
            isCategorySlug(row.slug),
        )
        .map((row) => ({ id: row.id, name: row.name, slug: row.slug }));
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("We couldn't")) {
        throw error;
      }

      console.error("[aether] category read failed:", error);
      throw new Error("We couldn't load the collection right now.");
    }
  },
  ["aether", "categories"],
  { revalidate: REVALIDATE_SECONDS },
);

/** Browsing the catalogue, with optional category filter, search and sort. */
export const getProducts = unstable_cache(
  async (options: ProductQueryOptions): Promise<Product[]> => {
    const supabase = createPublicSupabaseClient();
    let query = supabase.from("products").select(PRODUCT_SELECT);

    if (options.category) {
      query = query.eq("categories.slug", options.category);
    }

    if (options.q) {
      // Backslash is the default escape character in LIKE, so escaping here is
      // enough to make a user's text match literally.
      const pattern = `%${escapeSearchTerm(options.q)}%`;

      query = query.or(
        `name.ilike.${pattern},description.ilike.${pattern},short_description.ilike.${pattern},categories.name.ilike.${pattern}`,
      );
    }

    // Sorting is applied to the query chain directly rather than through a helper,
    // so the result type is resolved once, here, with overrideTypes.
    const { data, error } = await (() => {
      switch (options.sort ?? "newest") {
        case "price-asc":
          return query.order("price", { ascending: true });
        case "price-desc":
          return query.order("price", { ascending: false });
        default:
          return query.order("created_at", { ascending: false });
      }
    })().overrideTypes<ProductRow[], { merge: false }>();

    return toProducts({ data, error }, "products");
  },
  ["aether", "products"],
  { revalidate: REVALIDATE_SECONDS },
);

/** One product by slug, or null when it does not exist. */
export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createPublicSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .limit(1)
      .overrideTypes<ProductRow[], { merge: false }>();

    return toProducts({ data, error }, `product:${slug}`)[0] ?? null;
  },
  ["aether", "product-by-slug"],
  { revalidate: REVALIDATE_SECONDS },
);

/** Every slug, for generateStaticParams. */
export const getProductSlugs = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .select("slug")
        .overrideTypes<{ slug: string }[], { merge: false }>();

      if (error) {
        console.error("[aether] slug read failed:", error.code, error.message);
        throw new Error("We couldn't load the collection right now.");
      }

      return (data ?? []).map((row) => row.slug);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("We couldn't")) {
        throw error;
      }

      console.error("[aether] slug read failed:", error);
      throw new Error("We couldn't load the collection right now.");
    }
  },
  ["aether", "product-slugs"],
  { revalidate: REVALIDATE_SECONDS },
);

/** New Arrivals: the four most recent products. */
export const getNewArrivals = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createPublicSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })
      .limit(4)
      .overrideTypes<ProductRow[], { merge: false }>();

    return toProducts({ data, error }, "new-arrivals");
  },
  ["aether", "new-arrivals"],
  { revalidate: REVALIDATE_SECONDS },
);

/** The Curated Products row. */
export const getFeaturedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createPublicSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .overrideTypes<ProductRow[], { merge: false }>();

    return toProducts({ data, error }, "featured");
  },
  ["aether", "featured"],
  { revalidate: REVALIDATE_SECONDS },
);

/**
 * The slim catalogue the cart needs, fetched once in the root layout so the
 * cart can show current names and prices without any browser-side fetching.
 */
export const getCartCatalogue = unstable_cache(
  async (): Promise<CartProduct[]> => {
    const products = await getProducts({ sort: "newest" });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image,
      sizes: product.sizes,
    }));
  },
  ["aether", "cart-catalogue"],
  { revalidate: REVALIDATE_SECONDS },
);

/** Specific products by id, used when an order is resolved server-side. */
export async function getProductsByIds(ids: readonly string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  return getProductsByIdsUncached(ids);
}

const getProductsByIdsUncached = unstable_cache(
  async (ids: readonly string[]): Promise<Product[]> => {
    const supabase = createPublicSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", [...ids])
      .overrideTypes<ProductRow[], { merge: false }>();

    return toProducts({ data, error }, "products-by-ids");
  },
  ["aether", "products-by-ids"],
  { revalidate: REVALIDATE_SECONDS },
);

