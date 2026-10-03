/**
 * TEMPORARY SEED DATA.
 * This static catalogue exists only until the Supabase-backed catalogue lands in
 * Stage 5. It is real seed data for a curated store: no reviews, ratings,
 * discounts or stock urgency are implied anywhere.
 *
 * Products are listed newest first: the first four power New Arrivals.
 */

export const CATEGORY_SLUGS = [
  "fashion",
  "tech-accessories",
  "home-desk",
  "self-care",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Category = {
  slug: CategorySlug;
  name: string;
  tagline: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "fashion",
    name: "Fashion",
    tagline: "Everyday pieces, considered.",
  },
  {
    slug: "tech-accessories",
    name: "Tech & Accessories",
    tagline: "Useful tools for modern life.",
  },
  {
    slug: "home-desk",
    name: "Home & Desk",
    tagline: "Make space for better work and living.",
  },
  {
    slug: "self-care",
    name: "Self-Care",
    tagline: "Small rituals, thoughtfully chosen.",
  },
];

export const CATEGORY_NAMES: Record<CategorySlug, string> = {
  fashion: "Fashion",
  "tech-accessories": "Tech & Accessories",
  "home-desk": "Home & Desk",
  "self-care": "Self-Care",
};

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  /** Whole naira. Never a decimal amount. */
  price: number;
  stock: number;
};

export const CATALOGUE: Product[] = [
  {
    slug: "minimal-cap",
    name: "Minimal Cap",
    category: "fashion",
    price: 16000,
    stock: 24,
  },
  {
    slug: "essential-t-shirt",
    name: "Essential T-Shirt",
    category: "fashion",
    price: 18500,
    stock: 40,
  },
  {
    slug: "relaxed-hoodie",
    name: "Relaxed Hoodie",
    category: "fashion",
    price: 42000,
    stock: 18,
  },
  {
    slug: "everyday-tote",
    name: "Everyday Tote",
    category: "fashion",
    price: 28000,
    stock: 22,
  },
  {
    slug: "usb-c-hub",
    name: "USB-C Hub",
    category: "tech-accessories",
    price: 52000,
    stock: 15,
  },
  {
    slug: "laptop-stand",
    name: "Laptop Stand",
    category: "tech-accessories",
    price: 45000,
    stock: 19,
  },
  {
    slug: "wireless-mouse",
    name: "Wireless Mouse",
    category: "tech-accessories",
    price: 34500,
    stock: 27,
  },
  {
    slug: "insulated-bottle",
    name: "Insulated Bottle",
    category: "home-desk",
    price: 37000,
    stock: 30,
  },
  {
    slug: "desk-lamp",
    name: "Desk Lamp",
    category: "home-desk",
    price: 68000,
    stock: 12,
  },
  {
    slug: "weekly-planner",
    name: "Weekly Planner",
    category: "home-desk",
    price: 21000,
    stock: 35,
  },
  {
    slug: "ceramic-mug",
    name: "Ceramic Mug",
    category: "home-desk",
    price: 12500,
    stock: 44,
  },
  {
    slug: "scented-candle",
    name: "Scented Candle",
    category: "self-care",
    price: 26500,
    stock: 26,
  },
  {
    slug: "body-butter",
    name: "Body Butter",
    category: "self-care",
    price: 14500,
    stock: 33,
  },
  {
    slug: "hand-cream",
    name: "Hand Cream",
    category: "self-care",
    price: 11000,
    stock: 38,
  },
];

export const newArrivals: Product[] = CATALOGUE.slice(0, 4);

/** A different set to the New Arrivals row. */
export const curatedProducts: Product[] = CATALOGUE.slice(4, 8);