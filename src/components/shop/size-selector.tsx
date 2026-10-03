"use client";

type SizeSelectorProps = {
  /** Unique per product so several radios can coexist on one page. */
  name: string;
  sizes: readonly string[];
};

/**
 * Accessible radio group for clothing sizes: a real fieldset and legend with
 * native radios, visually restyled with Tailwind's peer variants.
 */
export function SizeSelector({ name, sizes }: SizeSelectorProps) {
  return (
    <fieldset>
      <legend className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        Size
      </legend>

      <div className="mt-4 flex flex-wrap gap-2">
        {sizes.map((size) => (
          <label key={size} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={size}
              className="peer sr-only"
            />
            <span className="flex h-11 min-w-11 items-center justify-center border border-line px-3 text-sm transition-colors duration-200 hover:border-charcoal peer-checked:border-charcoal peer-checked:bg-charcoal peer-checked:text-ivory peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive">
              {size}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}