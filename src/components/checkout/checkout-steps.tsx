export const STEPS = ["Delivery", "Review", "Place order"] as const;

export type StepName = (typeof STEPS)[number];

/**
 * Progress through checkout: Delivery, Review, Place order.
 * The active step is marked with aria-current, not colour alone.
 */
export function CheckoutSteps({ current }: { current: StepName }) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <ol aria-label="Checkout progress" className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {STEPS.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;

        return (
          <li key={step} className="flex items-center gap-x-3">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={`text-[0.68rem] uppercase tracking-[0.22em] ${
                isCurrent
                  ? "text-charcoal"
                  : isDone
                    ? "text-olive"
                    : "text-muted"
              }`}
            >
              {step}
            </span>

            {index < STEPS.length - 1 ? (
              <span aria-hidden="true" className="text-charcoal/25">
                /
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}