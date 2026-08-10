import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Shared-secret auth, same pattern as /api/atlas -- /ops sends the access
// code typed at the unlock screen as x-atlas-secret.
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

// Server-side client for the ATLAS OS Supabase project (shared with
// atlas-os, project ref xlyzfcabvvuhrtnigydm -- NOT thrive-platform's own
// Supabase project). Service role bypasses RLS; this route is now the
// only thing allowed to touch these tables, since RLS locked out the
// publishable key /ops used to call Supabase with directly from the browser.
function opsSupabase() {
  return createClient(
    process.env.OPS_SUPABASE_URL!,
    process.env.OPS_SUPABASE_SERVICE_ROLE_KEY!
  );
}

// "finances" is intentionally not in this list. Finances live only in
// atlas-os now -- this route must never fetch or return that table.
const TABLES = ["leads", "clients", "campaigns"] as const;
type Table = (typeof TABLES)[number];
function validTable(t: unknown): t is Table {
  return typeof t === "string" && (TABLES as readonly string[]).includes(t);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return deny();
  const table = req.nextUrl.searchParams.get("table");
  if (!validTable(table)) return NextResponse.json({ error: "invalid table" }, { status: 400 });
  const { data, error } = await opsSupabase()
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return deny();
  const { table, record } = await req.json();
  if (!validTable(table) || !record || typeof record !== "object") {
    return NextResponse.json({ error: "table and record required" }, { status: 400 });
  }
  const { data, error } = await opsSupabase().from(table).insert(record).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  if (!authorized(req)) return deny();
  const { table, id, fields } = await req.json();
  if (!validTable(table) || id === undefined || !fields || typeof fields !== "object") {
    return NextResponse.json({ error: "table, id and fields required" }, { status: 400 });
  }
  const { data, error } = await opsSupabase().from(table).update(fields).eq("id", id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
