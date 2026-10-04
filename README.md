# Aether

**Things worth having.**

Aether is a curated lifestyle storefront for modern everyday living, built with Next.js (App Router), TypeScript, Tailwind CSS v4, Supabase and Resend.

> Status: Stages 0–5 complete (foundation, application shell, homepage, catalogue, cart, Supabase).

## Product

Aether selects useful, aesthetically pleasing products for modern everyday life. The store communicates "we carefully selected these things" — never "here are thousands of unrelated things".

- **Brand idea:** a curated lifestyle store for modern everyday living.
- **Audience:** young adults 18–35 — university students, young professionals, creatives and technology workers. Broadly gender-neutral.
- **Market:** Nigeria.
- **Currency:** Nigerian Naira (NGN, ₦).
- **Categories:** Fashion · Tech & Accessories · Home & Desk · Self-Care.

## Visual system

Editorial + modern + warm minimalism: strong typography, generous whitespace, restrained interaction, carefully aligned grids, and product photography carrying the visual weight. Premium and calm — not a marketplace, not a SaaS dashboard.

| Colour | Value | Use |
| --- | --- | --- |
| Warm Ivory | `#F5F2EC` | Page background |
| Deep Charcoal | `#1C1C1A` | Text, dark marketing footer |
| Warm Stone | `#D8D2C8` | Borders, dividers, quiet surfaces |
| Muted Natural Olive | `#66705B` | Accent, used sparingly |

**Typography:** **DM Serif Display** (editorial display — wordmark, headings) plus **Inter** (UI and body), both loaded through `next/font` as CSS variables and exposed as Tailwind's `font-display` and `font-sans`. The logo is the typographic wordmark `AETHER` only — no icon, no mascot.

## Navigation

All navigation destinations live in `src/lib/navigation.ts`. Only routes that exist are listed, and each stage adds its entries when it implements the route, so the storefront never contains a dead link.

- **Desktop:** `AETHER` on the left; primary navigation centred; Cart in the top-right utility area. The cart shows an item count when it has items (from Stage 4).
- **Shop dropdown** (hover, click and keyboard, with `aria-expanded`): All Products, New Arrivals, Fashion, Tech & Accessories, Home & Desk, Self-Care. Categories are filtered through query parameters on a single `/shop` route.
- **Mobile:** the wordmark stays visible, Cart and Menu remain reachable, and navigation becomes a drawer with a focus trap, Escape to close, scroll lock and focus restoration.
- **Header:** sticky, compacting from 80px to 64px after 8px of scroll, gaining a hairline border. Solid ivory — no glass, blur or floating pill.
- **Deliberately absent until implemented:** About, Journal, Search and Account. Search only appears once it can search the real catalogue (§56); Account arrives with authentication in Stage 6; About and Journal are not part of the current build.

## Application shell

Routes live in the `(store)` route group (`src/app/(store)/layout.tsx`), which provides the skip link, header, `<main>` landmark and footer. Checkout will live outside that group so it can use its own minimal checkout footer.

## Homepage structure

Header → Hero ("Things worth having." + "Shop New Arrivals") → New Arrivals ("Recently selected.", four products) → Shop by category (four image-led blocks) → Brand Statement ("Less noise. Better things.") → Curated products (a second, different row) → Footer.

The newsletter section is omitted because it is not functional yet. Section sources live in `src/components/home/`; the page itself is `src/app/(store)/page.tsx`.

## Catalogue

The catalogue is a real Supabase table seeded by `supabase/seed.sql` (14 products across the four categories, upserted on slug so the seed is re-runnable). Products carry `id`, `slug`, `name`, `description`, `short_description`, `price` (whole naira), `stock`, `category_id`, `image_url`, `is_featured`, optional `sizes` / `details` / `material` / `dimensions`, and `created_at`.

Reads go through `src/lib/data/products.ts`, which is the only module that talks to the database. It selects just the columns the UI needs, joins the category in the same query, validates every row, and caches results for 60 seconds. Pages never see a raw row or a raw database error: technical failures are logged server-side and surfaced as plain language for `error.tsx`.

Prices are formatted in exactly one place, `src/lib/format.ts`, as Nigerian naira (`₦`).

`image_url` stores a path under `public/images` or is null. `src/lib/images.ts` is the one place an image is resolved: a null value falls back to the labelled placeholder, so a missing photo is never shown as if it were real.

## Shop and product pages

- **Shop** (`/shop`) is a server component that reads `searchParams`. Category filter and sort are real links; search is a real GET form targeting `?q=`, so everything works without JavaScript. Query parsing, filtering and sorting live in `src/lib/shop-query.ts`; controls and grid live in `src/components/shop/`.
- **Query parameters:** `?category=<slug>`, `?q=<text>`, `?sort=newest|price-asc|price-desc`. New Arrivals is simply the shop sorted by newest (`/shop?sort=newest`), which is what the header dropdown, mobile drawer and footer all link to.
- **Product** (`/products/[slug]`) has a breadcrumb, gallery placeholder, category/name/price/description, a size selector for clothing only, and Details / Materials / Dimensions **only where that product has the data**. Shipping and Returns are intentionally absent because no shipping or returns data exists yet.
- Product pages are prerendered via `generateStaticParams` and have per-product metadata with a canonical URL. Unknown slugs render a designed 404.
- `/shop` also has `loading.tsx` (skeleton grid, pulses disabled under reduced motion) and `error.tsx` (plain-language message with a retry action).
- The shared card is `src/components/shop/product-card.tsx`, used by both the homepage and the shop. Its image links to the product but is `aria-hidden` and `tabIndex={-1}`, so the card is one tab stop ("View product"). Space is reserved for the hover action overlay that arrives in Stages 4 and 6.

## Customer journey

Homepage → Shop → Category → Product → Add to Cart → Cart → Checkout → Google authentication → Delivery information → Order review → Place order → server validates the order → Supabase creates the order → Resend sends the confirmation email → Order confirmation → Order history.

## Supabase
- Public reads (shop, product pages, homepage) use the cookie-less client in `src/lib/supabase/public.ts`. It never persists a session, which is what keeps those pages statically renderable.
- Private data uses `src/lib/supabase/server.ts` (cookies from `next/headers`) or `src/lib/supabase/client.ts` in client components.
- The service-role key is server-only, is never prefixed `NEXT_PUBLIC_`, and is not used by any client. Stage 7 adds the service-role client with `import "server-only"`.
- RLS stays enabled on every table and is never disabled, in any environment. Clients may never write orders, order items, products or categories.
- Money is stored as integer naira. `order_items.price` is a purchase-time snapshot, so an order total never shifts when the catalogue changes.
- Row-level policies use `(select auth.uid())` and are written to hide other users' orders and order items.
- Database failures are logged on the server and surfaced to pages as plain-language errors; raw PostgREST errors never reach a page.

## Database

| Table | Purpose | Key columns |
| --- | --- | --- |
| `categories` | Product categories | `id`, `name`, `slug` |
| `products` | Catalogue | `id`, `name`, `slug`, `description`, `price`, `category_id`, `image_url`, `stock`, `created_at` |
| `profiles` | Customer profile | `id` (= auth user id), `full_name`, `email`, `created_at` |
| `orders` | Placed orders | `id`, `user_id`, `total`, `status`, `delivery_address`, `created_at` |
| `order_items` | Order line items | `id`, `order_id`, `product_id`, `quantity`, `price` (historical snapshot) |

Relationships: category → products, user → orders, order → order items, product → order items. The order-item price is a snapshot of the purchase-time price.

## Cart

State lives in one `CartProvider` (React context) around the root layout, backed by a `localStorage` store read through `useSyncExternalStore` with an empty server snapshot, so there is no hydration mismatch and no setState inside an effect. No state library.

A cart line stores only `productId`, `quantity` and `size` (clothing only). Names, images and prices are always read from the catalogue at render time, so the display is current rather than stale, and storage that is corrupt or references a product that no longer exists is dropped rather than repaired. Quantity is a whole number from 1 up to the product's stock.

Cart totals in the UI are presentation only. The server recalculates every total authoritatively in Stage 7 and never trusts a browser-supplied price.

## Product card actions

Each product card carries icon actions over the image: **Add to cart** (lucide `ShoppingCart`, 44px, accessible name includes the product name) and **Save** (lucide `Bookmark`), plus the "View product" text link beside the price. On devices with hover they fade in on card hover and on keyboard focus within the card; on devices without hover they are always visible, so hover is never the only route. Add to cart works for guests. Save requires an account: a signed-out Save opens an accessible dialog offering "Continue with Google" or "Not now", and saved items live in a real `saved_items` Supabase table (unique on `user_id` + `product_id`, RLS restricted to the owner). Both are built in the stages where they can actually work.

## Security summary

- RLS is enabled on private tables. Users can read and update only their own profile, and can read only their own orders and order items.
- Order totals are recalculated server-side from authoritative product records; a browser-displayed total is presentational only.
- Order creation is atomic and validates stock and quantities before writing anything.
- Duplicate submissions are prevented client-side (action disabled while processing) and guarded server-side.
- The service-role key, the Resend API key and the Google client secret never reach the browser and are never committed.
- Customer-facing errors stay human-readable; technical detail stays in server logs.

## Email

Transactional email is sent with **Resend**, server-side only, and only after the order has been persisted. Email failure never invalidates a successful order.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored — never commit secrets.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public base URL, used for metadata and canonical URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser-safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key (browser-safe; RLS provides authorization) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged Supabase access |
| `RESEND_API_KEY` | Server-only Resend API key |
| `RESEND_FROM_EMAIL` | Server-only verified sender address for Aether email |

Google OAuth credentials (including the client secret) live in the Supabase dashboard, not in this app's environment.

## Run the project locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## Roadmap

Stage 0 foundation → Stage 1 design system and app shell → Stage 2 homepage → Stage 3 catalogue and product pages → Stage 4 cart → Stage 5 Supabase → Stage 6 Google auth and account → Stage 7 checkout and orders → Stage 8 Resend email → Stage 9 security hardening → Stage 10 UX polish → Stage 11 production readiness.
