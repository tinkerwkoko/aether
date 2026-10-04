"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { useAuth } from "@/lib/auth-client";

/**
 * The Account entry in the utility area.
 *
 * Renders nothing visible until the session resolves, so the header never
 * shifts. Signed out it offers sign in; signed in it goes to the account.
 */
export function AccountLink() {
  const { status } = useAuth();

  if (status === "loading") {
    return <span className="inline-block h-11 w-11" aria-hidden="true" />;
  }

  const signedIn = status === "signed-in";

  return (
    <Link
      href={signedIn ? "/account" : "/login"}
      aria-label={signedIn ? "Account" : "Sign in"}
      className="inline-flex h-11 w-11 items-center justify-center text-charcoal/75 transition-colors duration-200 hover:text-charcoal"
    >
      <User size={22} strokeWidth={1.5} aria-hidden />
    </Link>
  );
}