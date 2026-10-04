import type { Metadata } from "next";

import { CheckoutClient } from "@/components/checkout/checkout-client";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Aether order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Sign-in comes first: a signed-out visitor goes to Google and returns here.
  const user = await requireUser("/checkout");

  return <CheckoutClient name={user.user_metadata?.full_name ?? null} email={user.email ?? null} />;
}