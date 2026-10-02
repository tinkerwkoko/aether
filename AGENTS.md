# Aether - Agent Rules

Aether is an assessed, portfolio-quality ecommerce storefront. These rules persist across every stage.

## Source of truth (in order)

1. `AGENTS.md`
2. `README.md`
3. Existing source code
4. The user's current instruction (wins when it intentionally changes an earlier decision)

## Stage discipline

- One stage at a time. Implement only the stage named in the current instruction.
- Never jump ahead. STOP after each stage and report.
- Inspect the current repository state first and continue from that state.

## Existing-project safety

- Never overwrite working code and never restructure code merely by preference.
- If something already works, leave it alone unless the current stage requires changing it.

## Token efficiency

- Read only files relevant to the current stage. Do not reread large files.
- No unnecessary abstractions, dependencies or files. Keep reports concise.

## Terminal rule

- Never redirect command output into files. Do not create `.txt`, probe, log or notes files in the project.
- If terminal output cannot be read, say so and stop. Do not work around it.

## Brand and design restraint

- Brand: **AETHER** — "Things worth having." A curated lifestyle store, Nigeria, NGN (₦). Warm, refined, calm.
- Categories: Fashion, Tech & Accessories, Home & Desk, Self-Care.
- One editorial/display font plus one UI font, loaded with `next/font` (no CDN links). Logo is the typographic wordmark `AETHER` only.
- Palette: Ivory `#F5F2EC`, Charcoal `#1C1C1A`, Stone `#D8D2C8`, Olive `#66705B` (accent, used sparingly).
- No "AI website" aesthetic: no purple/blue gradients, glassmorphism, neon, glow, floating blobs, fake dashboard metrics or meaningless decoration.
- Do not overuse rounded corners, shadows or icons; use grid, typography, spacing and imagery for hierarchy.
- Motion is restrained and purposeful. Respect `prefers-reduced-motion`. Motion must never be required to use the site.
- The cart stays in the top-right utility area and shows an item count when it has items.

## Next.js conventions

- App Router, `src/` directory, TypeScript, Tailwind CSS v4, import alias `@/*`.
- Server components by default; `"use client"` only where interaction requires it.
- Use `next/font` and `next/image`. Use CSS transitions and React state/context — no animation, UI or state libraries.

## Security

- The Supabase service-role key, `RESEND_API_KEY` and the Google client secret must never reach the browser, be logged, or be committed.
- Never trust browser-supplied totals, prices, user IDs or order ownership. The server recalculates totals from authoritative product records.
- Order and order items are created as one atomic operation (RPC/transaction). Validate stock and reject invalid quantities.
- RLS stays enabled. Users read only their own orders and order items, and manage only their own profile.
- Prevent duplicate orders: disable the action while processing and guard server-side.
- `.env.local` is gitignored. Never print secret values; report missing variables by name only.

## No invention

- No fake reviews, ratings, testimonials, stock urgency, discounts, social proof or delivery promises.
- No dead links and no fake pages. If a page is not implemented it is not linked.
- Keep image sources centralized; never present placeholders as real product photography.

## Definition of done

A stage is complete only when it is implemented, checked, obvious errors are fixed, nothing existing is knowingly broken, and the result is reported. Never claim something works if it was not tested. If blocked by a missing credential or external service, implement everything else and report the blocker by variable/service name only.

## Stage report format

Every stage ends with exactly this structure:

```
## Stage X Complete

### What was implemented
...
### Files created/changed
...
### Verification
TypeScript: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Relevant manual checks: ...
### UX / Design notes
...
### Important implementation decisions
...
### Blockers
None
```
