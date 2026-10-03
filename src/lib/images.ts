/**
 * Centralised image sources.
 *
 * No product or lifestyle photography exists yet, so every map below is empty and
 * components fall back to a labelled warm-stone placeholder. To switch to real
 * photography: drop files into `public/images/...` and add an entry here, e.g.
 *   "essential-t-shirt": "/images/products/essential-t-shirt.jpg",
 * No component needs to change.
 */

const productImages: Record<string, string> = {};

const categoryImages: Record<string, string> = {};

const heroImage = "";

export function productImageSrc(slug: string): string | null {
  return productImages[slug] ?? null;
}

export function categoryImageSrc(slug: string): string | null {
  return categoryImages[slug] ?? null;
}

export function heroImageSrc(): string | null {
  return heroImage || null;
}