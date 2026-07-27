import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// /dashboard/demo/** is the public prospect-facing demo — sample data only,
// no auth, no Supabase reads. Everything else under /dashboard requires a
// real signed-in session. /auth/confirm verifies password-reset/invite links
// and must be reachable with no session at all (that's its entire job).
const PUBLIC_PREFIXES = [
  "/dashboard/demo",
  "/dashboard/login",
  "/dashboard/forgot-password",
  "/auth/confirm",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The demo must have zero dependency on Supabase — it has to work even
  // before a Supabase project exists (e.g. on first deploy) or if it's ever
  // briefly misconfigured. Skip touching Supabase entirely for it.
  if (pathname === "/dashboard/demo" || pathname.startsWith("/dashboard/demo/")) {
    return NextResponse.next();
  }

  // Always run this first for everything else — it refreshes the session
  // cookie and must complete before any response is generated, or a
  // completed token refresh has nowhere to be written and the next request
  // refreshes again.
  const { response, userId } = await updateSession(request);

  if (isPublicPath(pathname)) {
    if (pathname === "/dashboard/login" && userId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  if (!userId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  // must_change_password and company/config gating happen in
  // app/dashboard/(portal)/layout.tsx — that's a single DB read per
  // navigation (cached per-request), rather than a query on every proxy
  // invocation including asset-adjacent requests.
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/api/portal/:path*"],
};
