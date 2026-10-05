/**
 * Builds the order confirmation email.
 *
 * Email-safe HTML only: table layout, inline styles, no images, no web fonts, no
 * icons. Every dynamic value is escaped before it reaches the markup, so a
 * product name or address can never inject HTML.
 *
 * Nothing here claims payment, delivery dates or tracking, because the app does
 * not do any of those things.
 */

import "server-only";

import { formatPrice } from "@/lib/format";

export type EmailItem = {
  name: string;
  size: string | null;
  quantity: number;
  lineTotal: number;
};

export type EmailOrder = {
  orderId: string;
  orderNumber: string;
  items: EmailItem[];
  total: number;
  delivery: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    landmark?: string;
  };
  siteUrl: string;
};

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

/** Escapes the five characters that can break out of HTML text or an attribute. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only a safe path is used for the link, so the URL itself needs no escaping. */
export function orderUrl(siteUrl: string, orderId: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}/account/orders/${encodeURIComponent(orderId)}`;
}

export const EMAIL_COLOURS = {
  ink: "#1C1C1A",
  muted: "#6B6862",
  ivory: "#F5F2EC",
  stone: "#D8D2C8",
  olive: "#66705B",
} as const;

const { ink, muted, ivory, stone, olive } = EMAIL_COLOURS;

/** A row of the items table, already escaped. */
function itemRow(item: EmailItem): string {
  const sizeLine = item.size
    ? `<br /><span style="font-size:12px;color:${muted};">Size ${escapeHtml(item.size)}</span>`
    : "";

  return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${stone};font-size:14px;color:${ink};">
            ${escapeHtml(item.name)}${sizeLine}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid ${stone};font-size:14px;color:${muted};text-align:right;width:70px;">
            &times;${item.quantity}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid ${stone};font-size:14px;color:${ink};text-align:right;width:110px;">
            ${escapeHtml(formatPrice(item.lineTotal))}
          </td>
        </tr>`;
}

/** The plain-text alternative, carrying the same information. */
function buildText(order: EmailOrder, link: string): string {
  const greeting = order.delivery.fullName || "there";

  return [
    "AETHER",
    "",
    `Hello ${greeting},`,
    "",
    "We have received your order. Thank you for shopping with Aether.",
    "",
    `Your order number is ${order.orderNumber}.`,
    "",
    "ITEMS",
    ...order.items.map(
      (item) =>
        `- ${item.name}${item.size ? ` (Size ${item.size})` : ""} x${item.quantity}  ${formatPrice(item.lineTotal)}`,
    ),
    "",
    `Total: ${formatPrice(order.total)}`,
    "",
    "DELIVERING TO",
    order.delivery.fullName,
    order.delivery.phone,
    order.delivery.addressLine,
    `${order.delivery.city}, ${order.delivery.state}`,
    ...(order.delivery.landmark ? [order.delivery.landmark] : []),
    "",
    `View your order: ${link}`,
    "",
    "AETHER - Things worth having.",
  ].join("\n");
}

export function buildOrderConfirmationEmail(order: EmailOrder): BuiltEmail {
  const subject = `Your Aether order ${order.orderNumber}`;
  const link = orderUrl(order.siteUrl, order.orderId);
  const greeting = order.delivery.fullName || "there";
  const rows = order.items.map(itemRow).join("");

  const landmarkLine = order.delivery.landmark
    ? `<br />${escapeHtml(order.delivery.landmark)}`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${ivory};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ivory};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${ivory};">
          <tr>
            <td style="padding:0 0 24px;border-bottom:1px solid ${stone};">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:8px;color:${ink};">AETHER</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 8px;font-size:15px;color:${muted};">Hello ${escapeHtml(greeting)},</td>
          </tr>
          <tr>
            <td style="padding:0 0 16px;font-size:15px;line-height:22px;color:${ink};">
              We have received your order. Thank you for shopping with Aether.
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;font-size:15px;color:${ink};">
              Your order number is <strong>${escapeHtml(order.orderNumber)}</strong>.
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 8px;font-size:11px;letter-spacing:2px;color:${muted};">ITEM</td>
                  <td style="padding:0 0 8px;font-size:11px;letter-spacing:2px;color:${muted};text-align:right;">QTY</td>
                  <td style="padding:0 0 8px;font-size:11px;letter-spacing:2px;color:${muted};text-align:right;">TOTAL</td>
                </tr>
                ${rows}
                <tr>
                  <td colspan="2" style="padding:14px 0 0;font-size:14px;color:${muted};">Total</td>
                  <td style="padding:14px 0 0;font-size:16px;color:${ink};text-align:right;">${escapeHtml(formatPrice(order.total))}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 0;border-top:1px solid ${stone};">
              <p style="margin:20px 0 0;font-size:11px;letter-spacing:2px;color:${muted};">DELIVERING TO</p>
              <p style="margin:6px 0 0;font-size:14px;line-height:22px;color:${ink};">
                ${escapeHtml(order.delivery.fullName)}<br />
                ${escapeHtml(order.delivery.phone)}<br />
                ${escapeHtml(order.delivery.addressLine)}<br />
                ${escapeHtml(order.delivery.city)}, ${escapeHtml(order.delivery.state)}${landmarkLine}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 0;">
              <a href="${link}" style="display:inline-block;padding:12px 24px;border:1px solid ${ink};color:${ink};font-size:12px;letter-spacing:2px;text-decoration:none;">VIEW YOUR ORDER</a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 0;font-size:12px;line-height:20px;color:${muted};">
              <span style="color:${olive};">AETHER</span> &middot; Things worth having.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text: buildText(order, link) };
}