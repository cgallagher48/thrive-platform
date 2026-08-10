"use client";
import { useState, useEffect, useRef } from "react";
import LogoMark from "@/components/LogoMark";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const NONE = "None";

// Talks to /api/ops-data (server-side, service_role) instead of hitting
// Supabase directly from the browser, RLS now blocks the old publishable
// key entirely. `query` is only inspected for PATCH to pull the row id out
// of the old "?id=eq.<id>" shape callers already pass.
async function db(table: string, method = "GET", body?: any, query = "", secret = "") {
  if (method === "GET") {
    const res = await fetch(`/api/ops-data?table=${encodeURIComponent(table)}`, {
      headers: { "x-atlas-secret": secret },
    });
    return res.json();
  }
  if (method === "PATCH") {
    const m = query.match(/id=eq\.([^&]+)/);
    const id = m ? decodeURIComponent(m[1]) : undefined;
    const res = await fetch("/api/ops-data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-atlas-secret": secret },
      body: JSON.stringify({ table, id, fields: body }),
    });
    return res.json();
  }
  const res = await fetch("/api/ops-data", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-atlas-secret": secret },
    body: JSON.stringify({ table, record: body }),
  });
  return res.json();
}

const STATUS_COLORS: Record<string, string> = { New: "#7c3aed", Contacted: "#2563eb", Booked: "#059669", Closed: "#d97706" };
const STATUSES = ["New", "Contacted", "Booked", "Closed"];
// Must match CAMPAIGN_NAME in app/api/ops-funnel/route.ts, display only.
const CAMPAIGN_NAME = "Roofing Owners - IL IN WI";
const TABS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pipeline", label: "Pipeline" },
  { key: "analytics", label: "Analytics" },
  { key: "leads", label: "Leads" },
  { key: "clients", label: "Clients" },
  { key: "marketing", label: "Marketing" },
];

function scoreLead(l: any) {
  let s = 0;
  if ((l.revenue || "").includes("5M+")) s += 40;
  else if ((l.revenue || "").includes("1M")) s += 30;
  else if ((l.revenue || "").includes("500K")) s += 20;
  else if ((l.revenue || "").includes("250K")) s += 10;
  if ((l.timeline || "") === "ASAP") s += 40;
  else if ((l.timeline || "").includes("30")) s += 25;
  else if ((l.timeline || "").includes("1-3")) s += 15;
  if (l.pain_point) s += 20;
  return Math.min(s, 100);
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
}

function scoreColor(s: number) {
  if (s >= 70) return "#059669";
  if (s >= 40) return "#d97706";
  return "#7c3aed";
}

export default function CompanyDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [tab, setTab] = useState("overview");
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<{ stage: string; label: string; count: number; rate: number | null; sampleSize: number | null }[]>([]);
  const [hotLeads, setHotLeads] = useState<any[]>([]);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [atlasInput, setAtlasInput] = useState("");
  const [atlasMessages, setAtlasMessages] = useState<{ role: string; content: string }[]>([]);
  const [atlasLoading, setAtlasLoading] = useState(false);
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [atlasNote, setAtlasNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", business: "", industry: "", monthly_value: "", status: "Active" });
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", business: "", industry: "", revenue: "", timeline: "", pain_point: "", status: "New" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only load data (and generate the AI briefing) once the access code has
  // been verified, otherwise every anonymous visitor triggers an API call.
  useEffect(() => { if (unlocked) loadAll(); }, [unlocked]);

  async function tryUnlock() {
    if (!pin || unlocking) return;
    setUnlocking(true);
    setUnlockError("");
    try {
      const res = await fetch("/api/atlas", { headers: { "x-atlas-secret": pin } });
      if (res.status === 204) {
        setUnlocked(true);
      } else if (res.status === 503) {
        setUnlockError("Server missing ATLAS_SHARED_SECRET env var.");
      } else {
        setUnlockError("Wrong access code.");
      }
    } catch {
      setUnlockError("Could not reach the server. Try again.");
    }
    setUnlocking(false);
  }
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [atlasMessages]);

  async function fetchFunnel(secret: string) {
    setFunnelLoading(true);
    try {
      const res = await fetch("/api/ops-funnel", { headers: { "x-atlas-secret": secret } });
      const data = await res.json();
      setFunnelLoading(false);
      return data;
    } catch {
      setFunnelLoading(false);
      return null;
    }
  }

  async function loadAll() {
    const [l, cl, fu] = await Promise.all([
      db("leads", "GET", undefined, "", pin),
      db("clients", "GET", undefined, "", pin),
      fetchFunnel(pin),
    ]);
    const la = Array.isArray(l) ? l : [];
    const ca2 = Array.isArray(cl) ? cl : [];
    const funnelData = fu?.funnel || [];
    setLeads(la);
    setClients(ca2);
    setFunnel(funnelData);
    setHotLeads(fu?.hotLeads || []);
    const n: Record<number, string> = {};
    la.forEach((x: any) => { n[x.id] = x.notes || ""; });
    setNotes(n);
    generateBriefing(la, ca2, funnelData);
  }

  async function generateBriefing(l: any[], cl: any[], fu: typeof funnel) {
    setBriefingLoading(true);
    const newLeads = l.filter((x) => !x.status || x.status === "New").length;
    const booked = l.filter((x) => x.status === "Booked").length;
    const sent = fu.find((f) => f.stage === "sent")?.count ?? 0;
    const replied = fu.find((f) => f.stage === "replied")?.count ?? 0;
    const context = `Pipeline (manually tracked opportunities): ${l.length} total, ${newLeads} new, ${booked} booked. Clients: ${cl.length}. Outreach campaign "${CAMPAIGN_NAME}": ${sent} contacted, ${replied} replied.`;
    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-atlas-secret": pin },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 300,
          messages: [{ role: "user", content: `You are ATLAS, the AI brain of Thrive Automation Agency. Give a short, direct morning briefing in 3 to 4 sentences, action oriented. Business data: ${context}. Start with "Good morning."` }],
        }),
      });
      const data = await res.json();
      setBriefing(data.content?.[0]?.text || "Good morning. ATLAS is online and your dashboard is ready.");
    } catch {
      setBriefing("Good morning. ATLAS is online. Your dashboard is ready, let's build something great today.");
    }
    setBriefingLoading(false);
  }

  async function askAtlas(msg?: string) {
    const question = msg || atlasInput.trim();
    if (!question) return;
    setAtlasInput("");

    const navMap: Record<string, string> = {
      pipeline: "pipeline", leads: "leads", analytics: "analytics",
      marketing: "marketing", clients: "clients", overview: "overview",
    };
    for (const [key, val] of Object.entries(navMap)) {
      if (question.toLowerCase().includes(key)) setTab(val);
    }

    const userMsg = { role: "user", content: question };
    const newMsgs = [...atlasMessages, userMsg];
    setAtlasMessages(newMsgs);
    setAtlasLoading(true);

    const topLeads = leads.filter((l) => scoreLead(l) >= 60).map((l) => l.name).slice(0, 3).join(", ");
    const sent = funnel.find((f) => f.stage === "sent")?.count ?? 0;
    const replied = funnel.find((f) => f.stage === "replied")?.count ?? 0;
    const called = funnel.find((f) => f.stage === "call_booked")?.count ?? 0;
    const context = `Business snapshot: ${leads.length} manually tracked pipeline opportunities (${leads.filter((l) => !l.status || l.status === "New").length} new, ${leads.filter((l) => l.status === "Booked").length} booked, ${leads.filter((l) => l.status === "Closed").length} closed). ${clients.length} active clients. Top scoring leads: ${topLeads || "none yet"}. Outreach campaign "${CAMPAIGN_NAME}": ${sent} contacted, ${replied} replied, ${called} calls booked.`;

    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-atlas-secret": pin },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 400,
          system: `You are ATLAS, the AI brain of Thrive Automation Agency. You are direct, intelligent, and action oriented. You know the business. ${context}`,
          messages: newMsgs,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm analyzing your data now.";
      setAtlasMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setAtlasMessages([...newMsgs, { role: "assistant", content: "Connection issue. Try again." }]);
    }
    setAtlasLoading(false);
  }

  async function moveStatus(id: number, status: string) {
    await db("leads", "PATCH", { status }, `?id=eq.${id}`, pin);
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function saveLeadNote(id: number) {
    await db("leads", "PATCH", { notes: notes[id] }, `?id=eq.${id}`, pin);
  }

  async function addClient() {
    const res = await db("clients", "POST", { ...newClient, monthly_value: parseFloat(newClient.monthly_value) || 0 }, "", pin);
    if (Array.isArray(res)) setClients([...res, ...clients]);
    setShowAddClient(false);
    setNewClient({ name: "", email: "", phone: "", business: "", industry: "", monthly_value: "", status: "Active" });
  }

  async function addLead() {
    const res = await db("leads", "POST", { ...newLead }, "", pin);
    if (Array.isArray(res)) setLeads([...res, ...leads]);
    setShowAddLead(false);
    setNewLead({ name: "", email: "", phone: "", business: "", industry: "", revenue: "", timeline: "", pain_point: "", status: "New" });
  }

  // Pre-fills the Add Lead form from a real reply so promoting it to a
  // tracked opportunity is one click, not retyping what's already known.
  function promoteToLead(h: any) {
    setNewLead({
      name: h.lead_name || "",
      email: h.lead_email || "",
      phone: "",
      business: h.company || "",
      industry: "",
      revenue: "",
      timeline: "",
      pain_point: "",
      status: "New",
    });
    setShowAddLead(true);
  }

  // Estimated total deal size sitting in the open pipeline, derived from
  // each lead's stated business size. Not Thrive's own revenue.
  const pipelineValue = leads.filter((l) => l.status !== "Closed").reduce((a, l) => {
    const rev = l.revenue || "";
    if (rev.includes("5M+")) return a + 5000000;
    if (rev.includes("1M")) return a + 1000000;
    if (rev.includes("500K")) return a + 500000;
    if (rev.includes("250K")) return a + 250000;
    return a + 50000;
  }, 0);

  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    const match = !q || (l.name || "").toLowerCase().includes(q) || (l.email || "").toLowerCase().includes(q) || (l.business || "").toLowerCase().includes(q);
    const s = l.status || "New";
    return match && (filter === "all" || s === filter);
  });

  const industryData = leads.reduce((acc: Record<string, number>, l) => {
    if (l.industry) acc[l.industry] = (acc[l.industry] || 0) + 1;
    return acc;
  }, {});
  const maxInd = Math.max(...Object.values(industryData), 1);

  const conversionRate = leads.length > 0 ? Math.round((leads.filter((l) => l.status === "Closed").length / leads.length) * 100) : 0;

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex justify-center">
            <LogoMark size={44} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Thrive Company Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Internal access only.</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            placeholder="Enter access code"
            className="mt-6 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-900 outline-none focus:border-violet-400"
          />
          {unlockError && <div className="mt-3 text-sm text-red-600">{unlockError}</div>}
          <button
            onClick={tryUnlock}
            disabled={unlocking}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 disabled:opacity-60"
          >
            {unlocking ? "Checking..." : "Access"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
            <LogoMark size={30} />
            Thrive<span className="text-violet-600"> Dashboard</span>
          </div>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="hidden text-xs text-slate-400 sm:block">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div>
            <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">AI Briefing</p>
              {briefingLoading ? (
                <div className="mt-3 flex gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:300ms]" />
                </div>
              ) : (
                <p className="mt-3 leading-relaxed text-slate-700">{briefing}</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["What should I focus on today?", "Show me my hottest leads", "How's my pipeline?", "Where can I improve?", "Which industry converts best?"].map((q) => (
                <button
                  key={q}
                  onClick={() => askAtlas(q)}
                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="flex h-[420px] flex-col rounded-xl border border-slate-200 bg-white">
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {atlasMessages.length === 0 && (
                    <div className="mt-8 text-center text-sm text-slate-400">Ask ATLAS anything about the business.</div>
                  )}
                  {atlasMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto bg-violet-50 text-slate-900"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {atlasLoading && (
                    <div className="flex w-fit gap-1.5 rounded-lg bg-slate-50 px-3.5 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:300ms]" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2 border-t border-slate-200 p-3">
                  <input
                    value={atlasInput}
                    onChange={(e) => setAtlasInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askAtlas()}
                    placeholder="Ask ATLAS anything..."
                    className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={() => askAtlas()}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</h3>
                <textarea
                  value={atlasNote}
                  onChange={(e) => setAtlasNote(e.target.value)}
                  placeholder="Add a note or idea..."
                  className="mt-3 h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
                <button
                  onClick={() => {
                    if (atlasNote.trim()) {
                      setSavedNotes([atlasNote, ...savedNotes]);
                      setAtlasNote("");
                    }
                  }}
                  className="mt-2 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
                >
                  Save Note
                </button>
                {savedNotes.length === 0 && <div className="mt-4 text-sm text-slate-400">No notes yet.</div>}
                <div className="mt-4 space-y-2">
                  {savedNotes.map((n, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab === "pipeline" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Outreach Funnel, live from Instantly</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{CAMPAIGN_NAME}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {funnel.map((f) => (
                <div key={f.stage} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-2xl font-bold text-slate-900">{f.count}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{f.label}</div>
                  {f.rate !== null && f.sampleSize ? (
                    <div className="mt-1 text-[11px] text-slate-400">{f.rate.toFixed(0)}% of {f.sampleSize}</div>
                  ) : null}
                </div>
              ))}
              {funnelLoading && funnel.length === 0 && (
                <div className="col-span-2 py-4 text-center text-sm text-slate-400 sm:col-span-4">Loading outreach data...</div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Recently Replied</div>
              {hotLeads.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-400">{funnelLoading ? "Loading..." : "No replies yet"}</div>
              ) : (
                <div className="space-y-2">
                  {hotLeads.slice(0, 8).map((h, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{h.lead_name || h.lead_email || NONE}</div>
                        <div className="truncate text-xs text-slate-500">{h.lead_email}{h.company ? ` · ${h.company}` : ""}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-[11px] text-slate-400">{h.timestamp ? fmt(h.timestamp) : NONE}</span>
                        {h.called || h.won ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {h.won ? "Won" : "Called"}
                          </span>
                        ) : (
                          <button
                            onClick={() => promoteToLead(h)}
                            className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
                          >
                            Add as Lead
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Your Pipeline</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Real opportunities you&apos;re tracking</h2>
              </div>
              <button
                onClick={() => setShowAddLead(true)}
                className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
              >
                Add Lead
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[["all", "Total", "#7c3aed"], ["New", "New", "#7c3aed"], ["Contacted", "Contacted", "#2563eb"], ["Booked", "Booked", "#059669"], ["Closed", "Closed", "#d97706"]].map(([k, label, color]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-xl border bg-white p-4 text-center transition-colors ${
                    filter === k ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-2xl font-bold" style={{ color }}>
                    {k === "all" ? leads.length : leads.filter((l) => (l.status || "New") === k).length}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="mt-6 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {STATUSES.map((status) => {
                const col = filteredLeads.filter((l) => (l.status || "New") === status);
                return (
                  <div key={status} className="min-h-[300px] rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: STATUS_COLORS[status] }}>
                        {status}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: `${STATUS_COLORS[status]}1a`, color: STATUS_COLORS[status] }}
                      >
                        {col.length}
                      </span>
                    </div>
                    {col.length === 0 ? (
                      <div className="py-6 text-center text-sm text-slate-400">Empty</div>
                    ) : (
                      col.map((lead) => {
                        const score = scoreLead(lead);
                        const isOpen = expanded === lead.id;
                        return (
                          <div
                            key={lead.id}
                            onClick={() => setExpanded(isOpen ? null : lead.id)}
                            className={`mb-2 cursor-pointer rounded-lg border bg-white p-3 transition-colors ${
                              isOpen ? "border-violet-300" : "border-slate-200 hover:border-violet-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-slate-900">
                                  {lead.name || "Unknown"}
                                  {(!lead.status || lead.status === "New") && (
                                    <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500 align-middle" />
                                  )}
                                </div>
                                <div className="truncate text-xs text-slate-500">{lead.business || NONE}</div>
                              </div>
                              <span className="whitespace-nowrap text-[11px] text-slate-400">{fmt(lead.created_at)}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {lead.industry && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{lead.industry}</span>}
                              {lead.revenue && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{lead.revenue}</span>}
                              {lead.timeline && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{lead.timeline}</span>}
                            </div>
                            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full" style={{ width: `${score}%`, background: scoreColor(score) }} />
                            </div>
                            <div className="mt-1 text-[11px] text-slate-400">Score: {score}/100</div>
                            {isOpen && (
                              <div className="mt-3 border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                                <div className="mb-2.5 grid grid-cols-2 gap-2">
                                  {[["Email", lead.email], ["Phone", lead.phone], ["Pain Points", lead.pain_point], ["Timeline", lead.timeline]].map(([k, v]) => (
                                    <div key={k}>
                                      <label className="block text-[10px] uppercase tracking-wide text-slate-400">{k}</label>
                                      <span className="break-words text-xs text-slate-700">{v || NONE}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mb-2.5 flex flex-wrap gap-1.5">
                                  {STATUSES.filter((s) => s !== (lead.status || "New")).map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => moveStatus(lead.id, s)}
                                      className="rounded-md border px-2 py-1 text-[11px] font-semibold"
                                      style={{ color: STATUS_COLORS[s], borderColor: `${STATUS_COLORS[s]}44` }}
                                    >
                                      Move to {s}
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={notes[lead.id] || ""}
                                  onChange={(e) => setNotes({ ...notes, [lead.id]: e.target.value })}
                                  placeholder="Notes..."
                                  rows={2}
                                  className="mb-2 w-full resize-none rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-violet-400"
                                />
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => saveLeadNote(lead.id)}
                                    className="rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-3 py-1.5 text-xs font-semibold text-white"
                                  >
                                    Save
                                  </button>
                                  <a href={`mailto:${lead.email}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">
                                    Email
                                  </a>
                                  {lead.phone && (
                                    <a href={`tel:${lead.phone}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">
                                      Call
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Total Leads", leads.length],
                ["Pipeline Value", `$${(pipelineValue / 1000).toFixed(0)}K`],
                ["Conversion Rate", `${conversionRate}%`],
                ["Avg Score", Math.round(leads.reduce((a, l) => a + scoreLead(l), 0) / Math.max(leads.length, 1))],
              ].map(([label, val]) => (
                <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="text-2xl font-bold text-slate-900">{val}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Leads by Industry</div>
                {Object.entries(industryData).sort((a, b) => b[1] - a[1]).map(([ind, count]) => (
                  <div key={ind} className="mb-2.5 flex items-center gap-3">
                    <div className="w-24 flex-shrink-0 text-sm text-slate-600">{ind}</div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500" style={{ width: `${(count / maxInd) * 100}%` }} />
                    </div>
                    <div className="w-6 text-right text-sm text-slate-500">{count}</div>
                  </div>
                ))}
                {Object.keys(industryData).length === 0 && <div className="py-6 text-center text-sm text-slate-400">No data yet</div>}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Pipeline Stage</div>
                {STATUSES.map((s) => {
                  const count = leads.filter((l) => (l.status || "New") === s).length;
                  return (
                    <div key={s} className="mb-2.5 flex items-center gap-3">
                      <div className="w-24 flex-shrink-0 text-sm text-slate-600">{s}</div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${(count / Math.max(leads.length, 1)) * 100}%`, background: STATUS_COLORS[s] }} />
                      </div>
                      <div className="w-6 text-right text-sm text-slate-500">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {tab === "leads" && (
          <div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all leads..."
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {["all", ...STATUSES].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    filter === f ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Name", "Email", "Business", "Industry", "Revenue", "Timeline", "Pain Points", "Score", "Status", "Date"].map((h) => (
                      <th key={h} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">{l.name || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">{l.email || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{l.business || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{l.industry || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{l.revenue || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{l.timeline || NONE}</td>
                      <td className="max-w-[150px] truncate border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{l.pain_point || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold" style={{ color: scoreColor(scoreLead(l)) }}>
                        {scoreLead(l)}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: `${STATUS_COLORS[l.status || "New"]}1a`, color: STATUS_COLORS[l.status || "New"] }}
                        >
                          {l.status || "New"}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">{fmt(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && <div className="py-10 text-center text-sm text-slate-400">No leads found</div>}
            </div>
          </div>
        )}

        {/* CLIENTS TAB */}
        {tab === "clients" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-slate-900">Active Clients</div>
                <div className="mt-1 text-sm text-slate-500">
                  {clients.length} clients, ${clients.reduce((a, c) => a + parseFloat(c.monthly_value || 0), 0).toLocaleString()}/mo MRR
                </div>
              </div>
              <button
                onClick={() => setShowAddClient(true)}
                className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
              >
                Add Client
              </button>
            </div>
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Name", "Business", "Email", "Phone", "Industry", "Monthly Value", "Status", "Start Date"].map((h) => (
                      <th key={h} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">{c.name || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{c.business || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">{c.email || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">{c.phone || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{c.industry || NONE}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-emerald-600">
                        ${parseFloat(c.monthly_value || 0).toLocaleString()}/mo
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{c.status || "Active"}</span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">{c.start_date || NONE}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && <div className="py-10 text-center text-sm text-slate-400">No clients yet. Close some leads.</div>}
            </div>
          </div>
        )}

        {/* MARKETING TAB */}
        {tab === "marketing" && (
          <div>
            <div className="text-xl font-bold text-slate-900">Campaign</div>
            <div className="mt-1 text-sm text-slate-500">
              Computed live from Instantly and outreach data, nothing here is entered by hand.
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-1 font-semibold text-slate-900">{CAMPAIGN_NAME}</div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Instantly</span>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {funnel.map((f) => (
                  <div key={f.stage}>
                    <div className="text-[11px] text-slate-400">{f.label}</div>
                    <div className="text-xl font-bold text-slate-900">{f.count}</div>
                    {f.rate !== null && f.sampleSize ? (
                      <div className="text-[11px] text-slate-400">{f.rate.toFixed(0)}% of {f.sampleSize}</div>
                    ) : null}
                  </div>
                ))}
              </div>
              {funnel.length === 0 && (
                <div className="mt-4 text-sm text-slate-400">{funnelLoading ? "Loading..." : "No outreach data yet"}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddClient && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setShowAddClient(false)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-slate-900">Add Client</h2>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Name" value={newClient.name} onChange={(v) => setNewClient({ ...newClient, name: v })} />
              <Field label="Business" value={newClient.business} onChange={(v) => setNewClient({ ...newClient, business: v })} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Email" value={newClient.email} onChange={(v) => setNewClient({ ...newClient, email: v })} />
              <Field label="Phone" value={newClient.phone} onChange={(v) => setNewClient({ ...newClient, phone: v })} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Industry" value={newClient.industry} onChange={(v) => setNewClient({ ...newClient, industry: v })} />
              <Field label="Monthly Value ($)" type="number" value={newClient.monthly_value} onChange={(v) => setNewClient({ ...newClient, monthly_value: v })} />
            </div>
            <div className="flex gap-2">
              <button onClick={addClient} className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white">
                Add Client
              </button>
              <button onClick={() => setShowAddClient(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddLead && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setShowAddLead(false)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-slate-900">Add Lead</h2>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Name" value={newLead.name} onChange={(v) => setNewLead({ ...newLead, name: v })} />
              <Field label="Business" value={newLead.business} onChange={(v) => setNewLead({ ...newLead, business: v })} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Email" value={newLead.email} onChange={(v) => setNewLead({ ...newLead, email: v })} />
              <Field label="Phone" value={newLead.phone} onChange={(v) => setNewLead({ ...newLead, phone: v })} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Industry" value={newLead.industry} onChange={(v) => setNewLead({ ...newLead, industry: v })} />
              <Field label="Timeline" placeholder="ASAP, 1-3 months" value={newLead.timeline} onChange={(v) => setNewLead({ ...newLead, timeline: v })} />
            </div>
            <div className="mb-3">
              <Field label="Revenue Range" placeholder="Under $250K, $1M to $5M" value={newLead.revenue} onChange={(v) => setNewLead({ ...newLead, revenue: v })} />
            </div>
            <div className="mb-3">
              <Field label="Pain Points" value={newLead.pain_point} onChange={(v) => setNewLead({ ...newLead, pain_point: v })} />
            </div>
            <div className="flex gap-2">
              <button onClick={addLead} className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white">
                Add Lead
              </button>
              <button onClick={() => setShowAddLead(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
      />
    </div>
  );
}
