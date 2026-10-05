const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Single source of truth for money formatting across the storefront and email. */
export function formatPrice(amountInNaira: number): string {
  return nairaFormatter.format(amountInNaira);
}

/**
 * Order numbers, formatted once for the whole app: AE-000123.
 * The storefront, the account area and the confirmation email all use this.
 */
export function formatOrderNumber(orderNumber: number): string {
  return `AE-${String(orderNumber).padStart(6, "0")}`;
}