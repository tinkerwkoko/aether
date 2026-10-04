"use client";

/**
 * Delivery details form. Validates on blur and on submit with the shared zod
 * schema, so what the customer sees is exactly what the server enforces.
 */

import { NIGERIAN_STATES } from "@/lib/checkout-schema";
import type { DeliveryDetails } from "@/lib/checkout-schema";

export type FieldErrors = Partial<Record<keyof DeliveryDetails, string>>;

const labelClass =
  "block text-[0.68rem] uppercase tracking-[0.22em] text-muted";
const inputClass =
  "mt-2 h-11 w-full border-b border-line bg-transparent text-sm transition-colors duration-200 focus:border-charcoal";
const errorClass = "mt-2 text-xs text-charcoal";

export function DeliveryFields({
  values,
  errors,
  contactName,
  contactEmail,
  onChange,
  onBlur,
  onSubmit,
}: {
  values: DeliveryDetails;
  errors: FieldErrors;
  contactName: string | null;
  contactEmail: string | null;
  onChange: <K extends keyof DeliveryDetails>(
    key: K,
    value: DeliveryDetails[K],
  ) => void;
  onBlur: (key: keyof DeliveryDetails) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const error = (key: keyof DeliveryDetails) => errors[key];

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-7">
      <div>
        <p className={labelClass}>Contact</p>
        <p className="mt-2 text-sm text-charcoal">{contactName ?? "Signed in"}</p>
        <p className="text-sm text-muted">{contactEmail}</p>
        <p className="mt-2 text-xs text-muted">
          Delivery details go to the phone number below.
        </p>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="fullName"
            name="name"
            autoComplete="name"
            value={values.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            onBlur={() => onBlur("fullName")}
            aria-invalid={Boolean(error("fullName"))}
            aria-describedby={
              error("fullName") ? "fullName-error" : undefined
            }
            className={inputClass}
          />
          {error("fullName") ? (
            <p id="fullName-error" className={errorClass}>
              {error("fullName")}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08012345678"
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            onBlur={() => onBlur("phone")}
            aria-invalid={Boolean(error("phone"))}
            aria-describedby={
              error("phone") ? "phone-error" : "phone-hint"
            }
            className={inputClass}
          />
          {error("phone") ? (
            <p id="phone-error" className={errorClass}>
              {error("phone")}
            </p>
          ) : (
            <p id="phone-hint" className="mt-2 text-xs text-muted">
              Nigerian mobile number.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="state" className={labelClass}>
            State
          </label>
          <select
            id="state"
            name="address-level1"
            autoComplete="address-level1"
            value={values.state}
            onChange={(event) => onChange("state", event.target.value)}
            onBlur={() => onBlur("state")}
            aria-invalid={Boolean(error("state"))}
            aria-describedby={error("state") ? "state-error" : undefined}
            className={inputClass}
          >
            <option value="">Select a state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {error("state") ? (
            <p id="state-error" className={errorClass}>
              {error("state")}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="addressLine" className={labelClass}>
            Street address
          </label>
          <input
            id="addressLine"
            name="street-address"
            autoComplete="street-address"
            value={values.addressLine}
            onChange={(event) => onChange("addressLine", event.target.value)}
            onBlur={() => onBlur("addressLine")}
            aria-invalid={Boolean(error("addressLine"))}
            aria-describedby={
              error("addressLine") ? "addressLine-error" : undefined
            }
            className={inputClass}
          />
          {error("addressLine") ? (
            <p id="addressLine-error" className={errorClass}>
              {error("addressLine")}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            name="address-level2"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => onChange("city", event.target.value)}
            onBlur={() => onBlur("city")}
            aria-invalid={Boolean(error("city"))}
            aria-describedby={error("city") ? "city-error" : undefined}
            className={inputClass}
          />
          {error("city") ? (
            <p id="city-error" className={errorClass}>
              {error("city")}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="landmark" className={labelClass}>
            Landmark (optional)
          </label>
          <input
            id="landmark"
            name="address-line3"
            autoComplete="address-line3"
            value={values.landmark ?? ""}
            onChange={(event) => onChange("landmark", event.target.value)}
            onBlur={() => onBlur("landmark")}
            aria-invalid={Boolean(error("landmark"))}
            aria-describedby={
              error("landmark") ? "landmark-error" : undefined
            }
            className={inputClass}
          />
          {error("landmark") ? (
            <p id="landmark-error" className={errorClass}>
              {error("landmark")}
            </p>
          ) : null}
        </div>
</div>

      <button
        type="submit"
        className="inline-flex h-12 items-center bg-charcoal px-8 text-[0.72rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-olive"
      >
        Review order
      </button>
    </form>
  );
}