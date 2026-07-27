import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on every request and returns the
// verified user id (via getClaims(), which validates the JWT signature —
// getSession() alone reads the cookie without verifying it, which is not
// safe to authorize on). Call this from proxy.ts before any redirect logic.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          // Auth cookies must never be cached by a CDN/reverse proxy, or one
          // user's session could be served to another. @supabase/ssr passes
          // the exact Cache-Control/Expires/Pragma headers to apply here.
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getClaims();
  const userId = error ? null : (data?.claims.sub ?? null);

  return { response, userId };
}
