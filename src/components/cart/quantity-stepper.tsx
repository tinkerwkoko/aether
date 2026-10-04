/**
 * Accessible quantity stepper: minus, an editable value, plus.
 * Every control has an accessible name and a 44px target.
 */
export function QuantityStepper({
  label,
  value,
  onChange,
  min = 1,
  max,
}: {
  /** Names the value, e.g. "Quantity". */
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
}) {
  const inputId = `quantity-${label.toLowerCase().replace(/\s+/g, "-")}`;

  function commit(next: number) {
    const whole = Math.trunc(Number.isFinite(next) ? next : min);
    const bounded = Math.min(Math.max(whole, min), max);
    if (bounded !== value) onChange(bounded);
  }

  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        onClick={() => commit(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="inline-flex h-11 w-11 items-center justify-center text-lg leading-none transition-colors duration-200 hover:bg-stone/40 disabled:pointer-events-none disabled:text-charcoal/25"
      >
        <span aria-hidden="true">&minus;</span>
      </button>

      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) return;
          commit(parsed);
        }}
        onBlur={(event) => commit(Number(event.target.value))}
        className="h-11 w-12 border-x border-line bg-transparent text-center text-sm"
      />

      <button
        type="button"
        onClick={() => commit(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="inline-flex h-11 w-11 items-center justify-center text-lg leading-none transition-colors duration-200 hover:bg-stone/40 disabled:pointer-events-none disabled:text-charcoal/25"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}