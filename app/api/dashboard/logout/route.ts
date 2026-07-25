import { NextResponse } from "next/server";
import { DASHBOARD_COOKIE_NAME } from "@/lib/dashboard-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(DASHBOARD_COOKIE_NAME);
  return response;
}
