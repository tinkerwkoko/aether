import { CartProvider } from "@/components/cart/cart-provider";
import { CompletePendingSave } from "@/components/saved/complete-pending-save";
import { SavedProvider } from "@/components/saved/saved-provider";
import { getCartCatalogue } from "@/lib/data/products";
import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";

// One editorial display face plus one UI face (Stage 1).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aether - Things worth having.",
    template: "%s - Aether",
  },
  description:
    "A considered collection of everyday pieces for how you live, work and move.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Fetched once, on the server, and handed to the cart. No browser-side fetching.
  const cartCatalogue = await getCartCatalogue();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      {/* Grammarly and similar extensions inject attributes onto <body>, which
          React would otherwise report as a hydration mismatch. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <CartProvider products={cartCatalogue}>
          {/* Client-only auth plumbing. No cookie is read on the server here,
              so product pages stay static. */}
          <SavedProvider />
          <Suspense fallback={null}>
            <CompletePendingSave />
          </Suspense>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

