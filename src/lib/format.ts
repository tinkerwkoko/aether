const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Single source of truth for money formatting across the storefront. */
export function formatPrice(amountInNaira: number): string {
  return nairaFormatter.format(amountInNaira);
}