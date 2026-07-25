import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  DASHBOARD_COOKIE_NAME,
  DASHBOARD_SESSION_MAX_AGE_SECONDS,
} from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  const demoPassword = process.env.DASHBOARD_DEMO_PASSWORD;
  if (!demoPassword) {
    return NextResponse.json(
      { error: "Demo login is not configured." },
      { status: 500 }
    );
  }

  let password: unknown;
  try {
    const body = await req.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof password !== "string" || password !== demoPassword) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DASHBOARD_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DASHBOARD_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
