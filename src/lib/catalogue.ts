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
  /** ISO date, used for the "Newest" sort. */
  createdAt: string;
  description: string;
  /** One line used for cards and meta descriptions. */
  shortDescription?: string;
  /** Clothing only. */
  sizes?: readonly ("S" | "M" | "L" | "XL")[];
  details?: readonly string[];
  material?: string;
  dimensions?: string;
};

export const CATALOGUE: Product[] = [
  {
    slug: "minimal-cap",
    name: "Minimal Cap",
    category: "fashion",
    price: 16000,
    stock: 24,
    createdAt: "2026-09-18",
    description:
      "A six-panel cap in washed cotton with a soft brim and a low profile that sits well through the day.",
    shortDescription: "Washed cotton, low profile, quietly structured.",
    details: ["Washed cotton", "Metal adjuster", "Embroidered AETHER mark"],
    material: "100% washed cotton",
    dimensions: "One size, adjustable",
  },
  {
    slug: "essential-t-shirt",
    name: "Essential T-Shirt",
    category: "fashion",
    price: 18500,
    stock: 40,
    createdAt: "2026-09-11",
    description:
      "An everyday-weight cotton t-shirt with a clean neckline and a straight hem, cut to be worn as often as you like.",
    shortDescription: "Everyday weight, clean neckline, straight hem.",
    sizes: ["S", "M", "L", "XL"],
    details: ["240gsm cotton jersey", "Ribbed neckline", "Pre-washed for softness"],
    material: "100% combed cotton",
  },
  {
    slug: "relaxed-hoodie",
    name: "Relaxed Hoodie",
    category: "fashion",
    price: 42000,
    stock: 18,
    createdAt: "2026-09-04",
    description:
      "A heavyweight hoodie with a dropped shoulder and a brushed interior: warm without feeling heavy.",
    shortDescription: "Heavyweight, dropped shoulder, brushed inside.",
    sizes: ["S", "M", "L", "XL"],
    details: ["420gsm loopback cotton", "Double-layer hood", "Ribbed cuffs and hem"],
    material: "100% organic cotton",
  },
  {
    slug: "everyday-tote",
    name: "Everyday Tote",
    category: "fashion",
    price: 28000,
    stock: 22,
    createdAt: "2026-08-28",
    description:
      "A structured tote in heavy canvas with a flat base and long handles that sit comfortably on the shoulder.",
    shortDescription: "Heavy canvas, flat base, shoulder handles.",
    details: ["Heavy cotton canvas", "Reinforced handles", "Flat base"],
    material: "100% cotton canvas",
    dimensions: "38 x 42 x 12 cm",
  },
  {
    slug: "usb-c-hub",
    name: "USB-C Hub",
    category: "tech-accessories",
    price: 52000,
    stock: 15,
    createdAt: "2026-08-21",
    description:
      "A seven-port hub that adds USB-A, HDMI and card reading to a laptop over a single USB-C cable.",
    shortDescription: "Seven ports from one USB-C cable.",
    details: ["HDMI output", "USB-A x3, SD, microSD", "Bus powered"],
    material: "Aluminium and ABS",
    dimensions: "11 x 5 x 1.2 cm",
  },
  {
    slug: "laptop-stand",
    name: "Laptop Stand",
    category: "tech-accessories",
    price: 45000,
    stock: 19,
    createdAt: "2026-08-14",
    description:
      "A folding aluminium stand that lifts a laptop to a comfortable height and folds flat enough to travel with.",
    shortDescription: "Folds flat, lifts to a comfortable height.",
    details: ["Six height positions", "Silicone contact points", "Folds to 1.5 cm"],
    material: "Anodised aluminium",
    dimensions: "Folded: 32 x 24 x 1.5 cm",
  },
  {
    slug: "wireless-mouse",
    name: "Wireless Mouse",
    category: "tech-accessories",
    price: 34500,
    stock: 27,
    createdAt: "2026-08-07",
    description:
      "A quiet, low-latency wireless mouse with an ambidextrous shape and a rechargeable battery.",
    shortDescription: "Quiet clicks, ambidextrous shape, rechargeable.",
    details: ["Silent switches", "Dongle or Bluetooth", "USB-C charging"],
    material: "ABS with silicone grip",
    dimensions: "11 x 6.2 x 3.9 cm",
  },
  {
    slug: "insulated-bottle",
    name: "Insulated Bottle",
    category: "home-desk",
    price: 37000,
    stock: 30,
    createdAt: "2026-07-31",
    description:
      "A double-walled steel bottle that keeps drinks cold through a working day and fits a cup holder.",
    shortDescription: "Cold for a working day, fits a cup holder.",
    details: ["Double-wall vacuum", "Powder-coated finish", "BPA-free lid"],
    material: "18/8 stainless steel",
    dimensions: "750ml, 7.5 cm across, 26 cm tall",
  },
  {
    slug: "desk-lamp",
    name: "Desk Lamp",
    category: "home-desk",
    price: 68000,
    stock: 12,
    createdAt: "2026-07-24",
    description:
      "A dimmable desk lamp with a warm-to-cool range and an arm that stays exactly where you put it.",
    shortDescription: "Warm to cool, and stays put.",
    details: ["Stepless dimming", "2700K-5000K", "USB-C passthrough"],
    material: "Powder-coated steel",
    dimensions: "42 cm tall, 45 cm reach",
  },
  {
    slug: "weekly-planner",
    name: "Weekly Planner",
    category: "home-desk",
    price: 21000,
    stock: 35,
    createdAt: "2026-07-17",
    description:
      "An undated weekly planner with a soft cover and paper that lies flat on a desk.",
    shortDescription: "Undated, soft cover, lies flat.",
    details: ["Undated, 52 weeks", "160gsm paper", "Ribbon marker"],
    material: "Paper and board",
    dimensions: "21 x 14.8 x 1.4 cm",
  },
  {
    slug: "ceramic-mug",
    name: "Ceramic Mug",
    category: "home-desk",
    price: 12500,
    stock: 44,
    createdAt: "2026-07-10",
    description:
      "A stoneware mug with a matte glaze and a handle sized for a whole hand.",
    shortDescription: "Matte glaze, generous handle.",
    details: ["Stoneware", "Dishwasher safe", "320ml"],
    material: "Glazed stoneware",
    dimensions: "320ml, 9 cm across, 10 cm tall",
  },
  {
    slug: "scented-candle",
    name: "Scented Candle",
    category: "self-care",
    price: 26500,
    stock: 26,
    createdAt: "2026-07-03",
    description:
      "A soy wax candle in a reusable glass jar with a warm cedar and fig scent.",
    shortDescription: "Soy wax, cedar and fig, reusable jar.",
    details: ["40 hour burn", "Cotton wick", "Reusable glass jar"],
    material: "Soy wax, cotton wick, glass",
    dimensions: "220g, 8 cm across",
  },
  {
    slug: "body-butter",
    name: "Body Butter",
    category: "self-care",
    price: 14500,
    stock: 33,
    createdAt: "2026-06-26",
    description:
      "A rich shea and squalane body butter that absorbs quickly and leaves skin soft rather than greasy.",
    shortDescription: "Shea and squalane, absorbs quickly.",
    details: ["Unscented", "Absorbs in seconds", "Wide mouth tub"],
    material: "Shea butter, squalane",
    dimensions: "200ml tub",
  },
  {
    slug: "hand-cream",
    name: "Hand Cream",
    category: "self-care",
    price: 11000,
    stock: 38,
    createdAt: "2026-06-19",
    description:
      "A lightweight hand cream for frequent washing, light enough to use at a desk without your hands slipping.",
    shortDescription: "Light enough for a desk, not slippery.",
    details: ["Fast absorbing", "Unscented", "Suitable for frequent washing"],
    material: "Glycerin, shea butter",
    dimensions: "75ml tube",
  },
];

export const newArrivals: Product[] = CATALOGUE.slice(0, 4);

/** A different set to the New Arrivals row. */
export const curatedProducts: Product[] = CATALOGUE.slice(4, 8);