/**
 * The one place an image is resolved.
 *
 * `image_url` holds a path under public/images (e.g. "/images/products/desk-lamp.jpg")
 * or is null. When it is null, callers get null back and render the labelled
 * placeholder, so a missing photo is never shown as if it were real.
 */

const heroImage = "";

export function productImageSrc(product: { image: string | null }): string | null {
  return product.image;
}

export function categoryImageSrc(): string | null {
  // Category photography is not stored in the database yet.
  return null;
}

export function heroImageSrc(): string | null {
  return heroImage || null;
}