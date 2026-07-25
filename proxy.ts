import { NextRequest, NextResponse } from "next/server";
import { DASHBOARD_COOKIE_NAME, verifySessionToken } from "@/lib/dashboard-auth";

const LOGIN_PATH = "/dashboard/login";
const PUBLIC_API_PATHS = ["/api/dashboard/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get(DASHBOARD_COOKIE_NAME)?.value;
  const isAuthed = verifySessionToken(session);

  if (pathname.startsWith("/api/dashboard")) {
    if (PUBLIC_API_PATHS.includes(pathname) || isAuthed) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname === LOGIN_PATH) {
    if (isAuthed) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && !isAuthed) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
