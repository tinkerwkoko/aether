/**
 * Delivery details schema.
 *
 * Shared by the checkout form and the server action, so a customer sees exactly
 * the same rules the server enforces. Every field is trimmed and every message
 * is written in plain language.
 */

import { z } from "zod";

/** The 36 states plus the Federal Capital Territory. */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

const trimmed = (value: unknown) => (typeof value === "string" ? value.trim() : value);

/**
 * Nigerian mobile: 0XXXXXXXXXX or +234XXXXXXXXXX, normalised to +234XXXXXXXXXX.
 */
export function normalisePhone(value: string): string | null {
  const digits = value.replace(/[\s()-]/g, "");

  if (/^\+234\d{10}$/.test(digits)) return digits;
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`;

  return null;
}

export const deliverySchema = z.object({
  fullName: z
    .string({ error: "Enter your full name." })
    .transform(trimmed)
    .pipe(
      z
        .string()
        .min(2, "Enter your full name.")
        .max(80, "That name is too long."),
    ),

  phone: z
    .string({ error: "Enter your phone number." })
    .transform(trimmed)
    // normalisePhone takes a string, so the untrusted value is narrowed here
    // rather than asserted into one.
    .transform((value) => (typeof value === "string" ? normalisePhone(value) : null))
    .pipe(
      z
        .string()
        .min(1, "Enter a valid Nigerian phone number, like 08012345678.")
        .refine((value) => normalisePhone(value) !== null, {
          error: "Enter a valid Nigerian phone number, like 08012345678.",
        }),
    ),

  addressLine: z
    .string({ error: "Enter your street address." })
    .transform(trimmed)
    .pipe(
      z
        .string()
        .min(5, "Enter your street address.")
        .max(160, "That address is too long."),
    ),

  city: z
    .string({ error: "Enter your city." })
    .transform(trimmed)
    .pipe(
      z.string().min(2, "Enter your city.").max(60, "That city name is too long."),
    ),

  state: z
    .string({ error: "Select your state." })
    .transform(trimmed)
    .pipe(
      z
        .string()
        .min(1, "Select your state.")
        .refine(
          (value) => (NIGERIAN_STATES as readonly string[]).includes(value),
          "Select a state from the list.",
        ),
    ),

  landmark: z
    .string()
    .optional()
    .transform(trimmed)
    .transform((value) => (value ? value : undefined))
    .pipe(
      z
        .string()
        .max(120, "That landmark is too long.")
        .optional(),
    ),
});

export type DeliveryDetails = z.infer<typeof deliverySchema>;

/** Field name to message, for rendering an error summary or inline errors. */
export type DeliveryErrors = Partial<Record<keyof DeliveryDetails, string>>;