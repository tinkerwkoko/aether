/**
 * Service-role client.
 *
 * ONLY the order server action may use this, because create_order is granted to
 * service_role alone. It bypasses RLS, so it must never be used for a read a
 * customer could do themselves - order history goes through the normal server
 * client instead, where RLS enforces ownership.
 *
 * `import "server-only"` makes that a build-time error if any client component
 * ever reaches this file, rather than leaking the service-role key to a browser.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createAdminSupabaseClient(): SupabaseClient {
  // Literal read so the value is not dynamic. The error names the variable
  // only, never its value.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill it in.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}