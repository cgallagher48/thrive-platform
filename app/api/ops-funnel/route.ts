import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Same shared-secret auth as /api/ops-data and /api/atlas.
function authorized(req: NextRequest) {
  const secret = process.env.ATLAS_SHARED_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("x-atlas-secret") || "");
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function deny() {
  if (!process.env.ATLAS_SHARED_SECRET) {
    return NextResponse.json({ error: "ATLAS_SHARED_SECRET is not configured on the server" }, { status: 503 });
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function opsSupabase() {
  return createClient(process.env.OPS_SUPABASE_URL!, process.env.OPS_SUPABASE_SERVICE_ROLE_KEY!);
}

// Real Instantly campaign this whole funnel is built around. Same id and
// name atlas-os's leadgen cron and outreach route use, kept in sync by hand
// since Thrive currently runs exactly one outbound campaign.
export const CAMPAIGN_ID = "a12bec14-093e-4523-a53d-2a94ebad44da";
export const CAMPAIGN_NAME = "Roofing Owners - IL IN WI";

const AUTO_REPLY_PATTERN = /automatic reply|out of office|auto-reply|autoreply|away from|on pto|on vacation|will be out|holiday weekend|undeliverable|delivery status|mailer-daemon/i;

// Ported test payloads from Instantly arrive with unrendered template
// variables (e.g. "{{lead.firstName}}"). Filter them out the same way
// atlas-os's /api/outreach does, rather than trusting every row is real.
function hasPlaceholder(e: any) {
  return [e.lead_email, e.lead_name, e.company, e.campaign].some(
    (v) => typeof v === "string" && v.includes("{{")
  );
}

// Webhooks aren't available on the current Instantly plan, so real repliers
// are pulled live from the API instead, exactly as atlas-os's
// fetchInstantlyHotLeads does.
async function fetchInstantlyHotLeads() {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      "https://api.instantly.ai/api/v2/emails?" +
        new URLSearchParams({ campaign_id: CAMPAIGN_ID, email_type: "received", limit: "50" }),
      { headers: { Authorization: "Bearer " + key } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || data.emails || [];
    return items
      .filter((e: any) => {
        const subj = String(e.subject || "");
        const body = String(e.content_preview || e.body_text || "");
        return !AUTO_REPLY_PATTERN.test(subj) && !AUTO_REPLY_PATTERN.test(body.slice(0, 200));
      })
      .map((e: any) => ({
        id: "instantly_" + e.id,
        event_type: "replied",
        lead_email: e.from_address_email || e.lead || "",
        lead_name: e.from_address_json?.[0]?.name || "",
        company: "",
        campaign: e.campaign_id || "",
        timestamp: e.timestamp_created || e.timestamp_email || null,
      }));
  } catch {
    return [];
  }
}

async function getContactedEmails(): Promise<Set<string>> {
  try {
    const { data, error } = await opsSupabase().from("os_contacted_leads").select("email");
    if (error) return new Set();
    return new Set((data || []).map((r: any) => (r.email || "").toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return deny();

  const [{ data, error }, instantlyLeads, contactedEmails] = await Promise.all([
    opsSupabase().from("outreach_events").select("*").order("timestamp", { ascending: false }).limit(500),
    fetchInstantlyHotLeads(),
    getContactedEmails(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const events = (data || []).filter((e) => !hasPlaceholder(e));

  const sentEmails = new Set(contactedEmails);
  events.filter((e) => e.event_type === "sent").forEach((e) => {
    if (e.lead_email) sentEmails.add(String(e.lead_email).toLowerCase());
  });

  const repliedEmails = new Set<string>();
  [...instantlyLeads, ...events.filter((e) => e.event_type === "replied")].forEach((e: any) => {
    if (e.lead_email) repliedEmails.add(String(e.lead_email).toLowerCase());
  });

  const calledEmails = new Set<string>();
  events.filter((e) => e.event_type === "call_booked").forEach((e) => {
    if (e.lead_email) calledEmails.add(String(e.lead_email).toLowerCase());
  });

  const wonEmails = new Set<string>();
  events.filter((e) => e.event_type === "won" || e.event_type === "closed").forEach((e) => {
    if (e.lead_email) wonEmails.add(String(e.lead_email).toLowerCase());
  });

  const lostEmails = new Set<string>();
  events.filter((e) => e.event_type === "lost").forEach((e) => {
    if (e.lead_email) lostEmails.add(String(e.lead_email).toLowerCase());
  });

  const rate = (num: number, denom: number): number | null => (denom > 0 ? (num / denom) * 100 : null);

  const funnel = [
    { stage: "sent", label: "Sent", count: sentEmails.size, rate: null as number | null, sampleSize: null as number | null },
    { stage: "replied", label: "Replied", count: repliedEmails.size, rate: rate(repliedEmails.size, sentEmails.size), sampleSize: sentEmails.size },
    { stage: "call_booked", label: "Call Booked", count: calledEmails.size, rate: rate(calledEmails.size, repliedEmails.size), sampleSize: repliedEmails.size },
    { stage: "won", label: "Won", count: wonEmails.size, rate: rate(wonEmails.size, calledEmails.size), sampleSize: calledEmails.size },
  ];

  // Declines leave the Replied list entirely, a "not interested" reply is
  // not something to act on and would misrepresent live opportunities.
  const hotLeads = [...instantlyLeads, ...events.filter((e) => e.event_type === "replied")]
    .reduce((acc: any[], e: any) => {
      if (e.lead_email && !acc.find((l) => l.lead_email === e.lead_email)) acc.push(e);
      return acc;
    }, [])
    .filter((l: any) => !lostEmails.has(String(l.lead_email || "").toLowerCase()))
    .map((l: any) => ({
      ...l,
      called: calledEmails.has(String(l.lead_email || "").toLowerCase()),
      won: wonEmails.has(String(l.lead_email || "").toLowerCase()),
    }));

  return NextResponse.json({
    campaign: { id: CAMPAIGN_ID, name: CAMPAIGN_NAME },
    funnel,
    hotLeads,
  });
}
