import type { Metadata } from "next";
import Link from "next/link";

import { AccountDetails } from "@/components/account/account-details";
import { OrderHistory } from "@/components/account/order-history";
import { Container } from "@/components/layout/container";
import { requireUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Aether account and order history.",
  robots: { index: false, follow: false },
};

const linkClass =
  "inline-flex h-11 items-center text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:text-olive";

export default async function AccountPage() {
  // Authorised on the server: a signed-out visitor never gets this page.
  const user = await requireUser("/account");
  const orders = await getOrdersForUser();

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-display text-4xl sm:text-5xl">Account</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <AccountDetails
            name={user.user_metadata?.full_name ?? null}
            email={user.email ?? null}
          />

          <nav aria-label="Account" className="mt-10 border-t border-line pt-6">
            <ul className="space-y-1">
              <li>
                <Link href="/account/saved" className={linkClass}>
                  Saved pieces
                </Link>
              </li>
              <li>
                <Link href="/shop" className={linkClass}>
                  Continue shopping
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div>
          <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            Order history
          </h2>
          <OrderHistory orders={orders} />
        </div>
      </div>
    </Container>
  );
}