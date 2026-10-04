import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth callback.
 *
 * Supabase redirects here after Google sign-in with a one-time `code`. We trade
 * it for a session, then send the user on. Nothing secret is handled here and no
 * Google client secret ever reaches this app.
 */

/**
 * Only same-site relative paths are allowed. Rejecting "//" and "/\" stops an
 * attacker turning ?next= into an open redirect to another site.
 */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  if (raw.startsWith("/\\")) return "/account";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=1`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[aether] oauth exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=1`);
    }
  } catch (error) {
    // Next.js throws from cookies() to signal dynamic rendering. That is control
    // flow, not a failed exchange, so it is rethrown rather than redirected on.
    unstable_rethrow(error);

    console.error("[aether] oauth exchange failed:", error);
    return NextResponse.redirect(`${origin}/login?error=1`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}