import type { ReactNode } from "react";

/**
 * Shared horizontal rhythm for every section of the storefront.
 * 20px gutters at 320px, opening up on larger screens.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}