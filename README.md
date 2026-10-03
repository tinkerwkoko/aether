# Aether

**Things worth having.**

Aether is a curated lifestyle storefront for modern everyday living, built with Next.js (App Router), TypeScript, Tailwind CSS v4, Supabase and Resend.

> Status: Stages 0–1 complete (foundation, design system and application shell). Product functionality is built up one stage at a time.

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

Header → Hero ("Things worth having.") → New Arrivals ("Recently selected.") → Shop by Category → Brand Statement ("Less noise. Better things.") → Curated Products → Newsletter (only if it genuinely stores or sends subscriptions) → Footer.

## Catalogue

Roughly 12–16 products across the four categories. Core product fields: `id`, `name`, `slug`, `description`, `price`, `category`, `image`, `stock`, `created_at`, plus optional detail fields (materials, dimensions, colours, sizes) only where they are real.

Image sources are centralized so real photography can replace development placeholders without rewriting the product system. Placeholders are always identified as placeholders — never presented as real product photography.

## Customer journey

Homepage → Shop → Category → Product → Add to Cart → Cart → Checkout → Google authentication → Delivery information → Order review → Place order → server validates the order → Supabase creates the order → Resend sends the confirmation email → Order confirmation → Order history.

## Database

| Table | Purpose | Key columns |
| --- | --- | --- |
| `categories` | Product categories | `id`, `name`, `slug` |
| `products` | Catalogue | `id`, `name`, `slug`, `description`, `price`, `category_id`, `image_url`, `stock`, `created_at` |
| `profiles` | Customer profile | `id` (= auth user id), `full_name`, `email`, `created_at` |
| `orders` | Placed orders | `id`, `user_id`, `total`, `status`, `delivery_address`, `created_at` |
| `order_items` | Order line items | `id`, `order_id`, `product_id`, `quantity`, `price` (historical snapshot) |

Relationships: category → products, user → orders, order → order items, product → order items. The order-item price is a snapshot of the purchase-time price.

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
