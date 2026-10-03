/**
 * Single source of truth for navigation destinations.
 * Only routes that exist in the app are listed here. Each stage adds its own
 * entries once the route is implemented, so navigation never contains dead links.
 */

export type NavLink = { label: string; href: string };

/**
 * Shop destinations. Categories are filtered through query parameters so one
 * /shop route serves them (no duplicate routes, no dead links).
 */
export const shopLinks: NavLink[] = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Fashion", href: "/shop?category=fashion" },
  { label: "Tech & Accessories", href: "/shop?category=tech-accessories" },
  { label: "Home & Desk", href: "/shop?category=home-desk" },
  { label: "Self-Care", href: "/shop?category=self-care" },
];

export type NavItem = NavLink & { children?: NavLink[] };

/**
 * Primary navigation. About and Journal are intentionally absent: those pages are
 * not part of the current implementation, so they are not linked.
 */
export const primaryNav: NavItem[] = [
  { label: "Shop", href: "/shop", children: shopLinks },
];