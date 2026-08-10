import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// Shared-secret auth: /ops sends the access code Casey types at the unlock
// screen as x-atlas-secret; we compare it to ATLAS_SHARED_SECRET (set in
// Vercel env vars for production, .env.local for local dev). Fails closed
// if unset. Keep this defined in exactly one local env file, not both
// .env.local and .env.development.local, the latter takes precedence
// during `next dev` and will silently shadow .env.local if both are set.
function authorized(req: NextRequest) {
  const secret = process.env.ATLAS_SHARED_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("x-atlas-secret") || "");
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function deny() {
  if (!process.env.ATLAS_SHARED_SECRET) {
    return NextResponse.json(
      { error: "ATLAS_SHARED_SECRET is not configured on the server" },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Lightweight auth probe used by the /ops unlock screen. Verifies the
// access code without spending Anthropic tokens.
export async function GET(req: NextRequest) {
  if (!authorized(req)) return deny();
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return deny();
  try {
    const body = await req.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
