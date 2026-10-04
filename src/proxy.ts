/**
 * Session refresh.
 *
 * Next.js 16 calls this file `proxy.ts` (it replaces middleware.ts). Supabase
 * Auth stores its session in cookies, so every request needs to run the client
 * that refreshes those cookies. getUser() verifies the token with the Supabase
 * Auth server - getSession() is never trusted for authorisation on the server.
 *
 * This does no database work: it only refreshes the session cookie.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Environment variables, named only. Values are never logged. */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }

  return value;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies onto the outgoing response.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with Supabase Auth, which triggers the
  // setAll above when the session needs refreshing. getSession() alone would
  // only read the cookie and never verify it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // No session. requireUser on the page decides whether to redirect.
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip Next's own assets, the favicon and static image files. Everything
     * else, including /account and /account/saved, is refreshed.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map)$).*)",
  ],
};
