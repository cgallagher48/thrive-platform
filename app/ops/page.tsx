"use client";
import { useState, useEffect, useRef } from "react";

const SB = "https://xlyzfcabvvuhrtnigydm.supabase.co";
const KEY = "sb_publishable_aZIy_vimeZ8V1UJRcZFLEw_iA0pf38O";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

async function db(table: string, method = "GET", body?: any, query = "") {
  const res = await fetch(`${SB}/rest/v1/${table}${query}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

const STATUS_COLORS: Record<string, string> = { New: "#a855f7", Contacted: "#3b82f6", Booked: "#10b981", Closed: "#f59e0b" };
const STATUSES = ["New", "Contacted", "Booked", "Closed"];
const TABS = ["atlas", "pipeline", "analytics", "leads", "clients", "marketing", "finance"];

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
  if (s >= 70) return "#10b981";
  if (s >= 40) return "#f59e0b";
  return "#a855f7";
}

export default function CommandCenter() {
  const [tab, setTab] = useState("atlas");
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
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
  const [showAddFinance, setShowAddFinance] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", business: "", industry: "", monthly_value: "", status: "Active" });
  const [newFinance, setNewFinance] = useState({ type: "revenue", amount: "", description: "", date: new Date().toISOString().split("T")[0], category: "" });
  const [newCampaign, setNewCampaign] = useState({ name: "", platform: "", messages_sent: "", responses: "", leads_generated: "", status: "Active", notes: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [atlasMessages]);

  async function loadAll() {
    const [l, cl, fi, ca] = await Promise.all([
      db("leads", "GET", undefined, "?select=*&order=created_at.desc"),
      db("clients", "GET", undefined, "?select=*&order=created_at.desc"),
      db("finances", "GET", undefined, "?select=*&order=created_at.desc"),
      db("campaigns", "GET", undefined, "?select=*&order=created_at.desc"),
    ]);
    const la = Array.isArray(l) ? l : [];
    const ca2 = Array.isArray(cl) ? cl : [];
    const fa = Array.isArray(fi) ? fi : [];
    const caa = Array.isArray(ca) ? ca : [];
    setLeads(la);
    setClients(ca2);
    setFinances(fa);
    setCampaigns(caa);
    const n: Record<number, string> = {};
    la.forEach((x: any) => { n[x.id] = x.notes || ""; });
    setNotes(n);
    generateBriefing(la, ca2, fa);
  }

  async function generateBriefing(l: any[], cl: any[], fi: any[]) {
    setBriefingLoading(true);
    const revenue = fi.filter(f => f.type === "revenue").reduce((a: number, f: any) => a + parseFloat(f.amount || 0), 0);
    const expenses = fi.filter(f => f.type === "expense").reduce((a: number, f: any) => a + parseFloat(f.amount || 0), 0);
    const newLeads = l.filter(x => !x.status || x.status === "New").length;
    const booked = l.filter(x => x.status === "Booked").length;
    const context = `Leads: ${l.length} total, ${newLeads} new, ${booked} booked. Clients: ${cl.length}. Revenue: $${revenue.toFixed(0)}, Expenses: $${expenses.toFixed(0)}, Profit: $${(revenue - expenses).toFixed(0)}.`;
    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 300,
          messages: [{ role: "user", content: `You are ATLAS, the AI brain of Thrive Automation Agency. Give Casey a powerful morning briefing in 3-4 sentences. Be direct, specific, and action-oriented. Business data: ${context}. Start with "Good morning, Casey."` }],
        }),
      });
      const data = await res.json();
      setBriefing(data.content?.[0]?.text || "Good morning, Casey. ATLAS is online and your command center is ready.");
    } catch {
      setBriefing("Good morning, Casey. ATLAS is online. Your command center is ready — let's build something great today.");
    }
    setBriefingLoading(false);
  }

  async function askAtlas(msg?: string) {
    const question = msg || atlasInput.trim();
    if (!question) return;
    setAtlasInput("");

    const navMap: Record<string, string> = {
      pipeline: "pipeline", leads: "leads", analytics: "analytics",
      marketing: "marketing", finance: "finance", clients: "clients", atlas: "atlas",
    };
    for (const [key, val] of Object.entries(navMap)) {
      if (question.toLowerCase().includes(key)) { setTab(val); }
    }

    const userMsg = { role: "user", content: question };
    const newMsgs = [...atlasMessages, userMsg];
    setAtlasMessages(newMsgs);
    setAtlasLoading(true);

    const revenue = finances.filter(f => f.type === "revenue").reduce((a, f) => a + parseFloat(f.amount || 0), 0);
    const expenses = finances.filter(f => f.type === "expense").reduce((a, f) => a + parseFloat(f.amount || 0), 0);
    const topLeads = leads.filter(l => scoreLead(l) >= 60).map(l => l.name).slice(0, 3).join(", ");
    const context = `Business snapshot: ${leads.length} leads (${leads.filter(l => !l.status || l.status === "New").length} new, ${leads.filter(l => l.status === "Booked").length} booked, ${leads.filter(l => l.status === "Closed").length} closed). ${clients.length} active clients. Revenue: $${revenue.toFixed(0)}, Expenses: $${expenses.toFixed(0)}, Profit: $${(revenue - expenses).toFixed(0)}. Top scoring leads: ${topLeads || "none yet"}. Campaigns: ${campaigns.length}.`;

    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 400,
          system: `You are ATLAS, the elite AI brain of Thrive Automation Agency. You are direct, intelligent, and action-oriented. You know Casey's entire business. ${context}`,
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
    await db("leads", "PATCH", { status }, `?id=eq.${id}`);
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  }

  async function saveLeadNote(id: number) {
    await db("leads", "PATCH", { notes: notes[id] }, `?id=eq.${id}`);
  }

  async function addClient() {
    const res = await db("clients", "POST", { ...newClient, monthly_value: parseFloat(newClient.monthly_value) || 0 });
    if (Array.isArray(res)) setClients([...res, ...clients]);
    setShowAddClient(false);
    setNewClient({ name: "", email: "", phone: "", business: "", industry: "", monthly_value: "", status: "Active" });
  }

  async function addFinance() {
    const res = await db("finances", "POST", { ...newFinance, amount: parseFloat(newFinance.amount) || 0 });
    if (Array.isArray(res)) setFinances([...res, ...finances]);
    setShowAddFinance(false);
    setNewFinance({ type: "revenue", amount: "", description: "", date: new Date().toISOString().split("T")[0], category: "" });
  }

  async function addCampaign() {
    const res = await db("campaigns", "POST", { ...newCampaign, messages_sent: parseInt(newCampaign.messages_sent) || 0, responses: parseInt(newCampaign.responses) || 0, leads_generated: parseInt(newCampaign.leads_generated) || 0 });
    if (Array.isArray(res)) setCampaigns([...res, ...campaigns]);
    setShowAddCampaign(false);
  }

  const totalRevenue = finances.filter(f => f.type === "revenue").reduce((a, f) => a + parseFloat(f.amount || 0), 0);
  const totalExpenses = finances.filter(f => f.type === "expense").reduce((a, f) => a + parseFloat(f.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;
  const pipelineValue = leads.filter(l => l.status !== "Closed").reduce((a, l) => {
    const rev = l.revenue || "";
    if (rev.includes("5M+")) return a + 5000000;
    if (rev.includes("1M")) return a + 1000000;
    if (rev.includes("500K")) return a + 500000;
    if (rev.includes("250K")) return a + 250000;
    return a + 50000;
  }, 0);

  const filteredLeads = leads.filter(l => {
    const q = search.toLowerCase();
    const match = !q || (l.name || "").toLowerCase().includes(q) || (l.email || "").toLowerCase().includes(q) || (l.business || "").toLowerCase().includes(q);
    const s = l.status || "New";
    return match && (filter === "all" || s === filter);
  });

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #060612; --surface: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.07);
      --purple: #a855f7; --blue: #3b82f6; --green: #10b981; --amber: #f59e0b;
      --text: #fff; --muted: rgba(255,255,255,0.45); --hint: rgba(255,255,255,0.2);
    }
    body { background: var(--bg); color: var(--text); font-family: 'Space Grotesk', sans-serif; }
    .cc { min-height: 100vh; background: radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.05) 0%, transparent 60%), #060612; }
    .topbar { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border); background: rgba(6,6,18,0.8); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; }
    .logo-mark { font-size: 1.1rem; font-weight: 700; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }
    .tabs { display: flex; gap: 0.25rem; flex: 1; justify-content: center; }
    .tab-btn { padding: 0.4rem 0.85rem; border-radius: 8px; border: none; background: transparent; color: var(--muted); font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; text-transform: capitalize; letter-spacing: 0.02em; }
    .tab-btn:hover { color: var(--text); background: rgba(255,255,255,0.05); }
    .tab-btn.active { background: rgba(168,85,247,0.15); color: var(--purple); border: 1px solid rgba(168,85,247,0.25); }
    .tab-btn.atlas-tab { background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2)); color: var(--purple); border: 1px solid rgba(168,85,247,0.3); }
    .content { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; }
    .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .stat { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s; }
    .stat:hover, .stat.active { border-color: rgba(168,85,247,0.4); background: rgba(168,85,247,0.06); }
    .stat-num { font-size: 1.8rem; font-weight: 700; line-height: 1; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .stat-label { font-size: 0.68rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .pipeline-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .col { background: rgba(255,255,255,0.015); border: 1px solid var(--border); border-radius: 14px; padding: 0.85rem; min-height: 300px; }
    .col-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding-bottom: 0.65rem; border-bottom: 1px solid var(--border); }
    .col-title { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .col-count { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 8px; }
    .lead-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 0.8rem; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.15s; }
    .lead-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(168,85,247,0.3); transform: translateY(-1px); }
    .lead-card.open { border-color: rgba(168,85,247,0.5); background: rgba(168,85,247,0.05); }
    .lead-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lead-biz { font-size: 0.72rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
    .tags { display: flex; gap: 0.3rem; margin-top: 0.45rem; flex-wrap: wrap; }
    .tag { font-size: 0.62rem; padding: 0.12rem 0.4rem; border-radius: 5px; background: rgba(255,255,255,0.06); color: var(--muted); }
    .score-bar { height: 2px; background: rgba(255,255,255,0.07); border-radius: 2px; margin-top: 0.55rem; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 2px; }
    .score-txt { font-size: 0.6rem; color: var(--hint); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
    .expand-content { padding-top: 0.75rem; margin-top: 0.7rem; border-top: 1px solid var(--border); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.65rem; }
    .detail-item label { font-size: 0.6rem; color: var(--hint); text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
    .detail-item span { font-size: 0.75rem; color: rgba(255,255,255,0.8); word-break: break-all; }
    .move-row { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.55rem; }
    .move-btn { padding: 0.22rem 0.5rem; border-radius: 6px; border: 1px solid; background: transparent; font-size: 0.62rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .notes-input { width: 100%; padding: 0.5rem 0.65rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 7px; color: var(--text); font-size: 0.75rem; resize: none; outline: none; font-family: inherit; margin-bottom: 0.5rem; }
    .notes-input:focus { border-color: rgba(168,85,247,0.4); }
    .action-row { display: flex; gap: 0.4rem; }
    .btn-primary { padding: 0.38rem 0.85rem; border-radius: 7px; border: none; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-ghost { padding: 0.38rem 0.85rem; border-radius: 7px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 0.72rem; cursor: pointer; font-family: inherit; text-decoration: none; display: inline-flex; align-items: center; }
    .btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
    .atlas-container { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; }
    .briefing-box { background: linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.06)); border: 1px solid rgba(168,85,247,0.2); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.25rem; }
    .atlas-name { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--purple); margin-bottom: 0.5rem; }
    .briefing-text { font-size: 0.9rem; line-height: 1.7; color: rgba(255,255,255,0.85); }
    .chat-area { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; display: flex; flex-direction: column; height: 400px; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 2px; }
    .msg { max-width: 85%; padding: 0.65rem 0.9rem; border-radius: 12px; font-size: 0.83rem; line-height: 1.6; }
    .msg.user { background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.3); align-self: flex-end; color: var(--text); }
    .msg.assistant { background: rgba(255,255,255,0.04); border: 1px solid var(--border); align-self: flex-start; color: rgba(255,255,255,0.85); }
    .chat-input-row { padding: 0.75rem; border-top: 1px solid var(--border); display: flex; gap: 0.5rem; }
    .chat-input { flex: 1; padding: 0.6rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.82rem; outline: none; font-family: inherit; }
    .chat-input:focus { border-color: rgba(168,85,247,0.4); }
    .chat-send { padding: 0.6rem 1rem; border-radius: 10px; border: none; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; cursor: pointer; font-size: 0.8rem; font-weight: 600; font-family: inherit; }
    .quick-btns { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
    .quick-btn { padding: 0.35rem 0.75rem; border-radius: 20px; border: 1px solid rgba(168,85,247,0.3); background: rgba(168,85,247,0.08); color: var(--purple); font-size: 0.72rem; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .quick-btn:hover { background: rgba(168,85,247,0.2); }
    .notes-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; }
    .notes-panel h3 { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 1rem; }
    .note-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 0.65rem 0.75rem; margin-bottom: 0.5rem; font-size: 0.78rem; line-height: 1.5; color: rgba(255,255,255,0.8); }
    .analytics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .ana-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.1rem; }
    .ana-num { font-size: 1.6rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-bottom: 3px; }
    .ana-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; }
    .industry-chart { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem; }
    .bar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
    .bar-label { font-size: 0.75rem; color: var(--muted); width: 90px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .bar-val { font-size: 0.72rem; color: var(--muted); font-family: 'JetBrains Mono', monospace; width: 30px; text-align: right; }
    .full-table { width: 100%; border-collapse: collapse; }
    .full-table th { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding: 0.65rem 0.85rem; text-align: left; border-bottom: 1px solid var(--border); }
    .full-table td { font-size: 0.78rem; padding: 0.75rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.03); color: rgba(255,255,255,0.8); }
    .full-table tr:hover td { background: rgba(255,255,255,0.02); }
    .status-pill { font-size: 0.65rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 20px; display: inline-block; }
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(8px); }
    .form-card { background: #0d0d20; border: 1px solid rgba(168,85,247,0.3); border-radius: 20px; padding: 2rem; width: 500px; max-height: 80vh; overflow-y: auto; }
    .form-card h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem; }
    .form-field { margin-bottom: 1rem; }
    .form-field label { display: block; font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.35rem; }
    .form-input { width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 9px; color: var(--text); font-size: 0.85rem; outline: none; font-family: inherit; }
    .form-input:focus { border-color: rgba(168,85,247,0.5); }
    .form-row { display: flex; gap: 0.75rem; }
    .form-row .form-field { flex: 1; }
    .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .section-title { font-size: 1.1rem; font-weight: 700; }
    .add-btn { padding: 0.45rem 1rem; border-radius: 9px; border: 1px solid rgba(168,85,247,0.4); background: rgba(168,85,247,0.1); color: var(--purple); font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .finance-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 0.5rem; }
    .campaign-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 0.75rem; }
    .pulse-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-left: 5px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .empty { text-align: center; padding: 3rem; color: var(--hint); font-size: 0.85rem; }
    .search-bar { width: 100%; padding: 0.7rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.85rem; outline: none; font-family: inherit; margin-bottom: 1.25rem; }
    .search-bar:focus { border-color: rgba(168,85,247,0.3); }
    .filter-row { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .filter-btn { padding: 0.35rem 0.85rem; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 0.75rem; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .filter-btn.active { border-color: rgba(168,85,247,0.5); background: rgba(168,85,247,0.1); color: var(--purple); }
    .typing { display: flex; gap: 4px; align-items: center; padding: 0.65rem 0.9rem; }
    .typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--purple); animation: bounce 1.2s infinite; }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
  `;

  const industryData = leads.reduce((acc: Record<string, number>, l) => {
    if (l.industry) acc[l.industry] = (acc[l.industry] || 0) + 1;
    return acc;
  }, {});
  const maxInd = Math.max(...Object.values(industryData), 1);

  const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === "Closed").length / leads.length) * 100) : 0;

  return (
    <>
      <style>{css}</style>
      <div className="cc">
        {/* Top Bar */}
        <div className="topbar">
          <div className="logo-mark">⚡ THRIVE</div>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t} className={`tab-btn ${t === "atlas" ? "atlas-tab" : ""} ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t === "atlas" ? "🧠 ATLAS" : t}
              </button>
            ))}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        <div className="content">

          {/* ATLAS TAB */}
          {tab === "atlas" && (
            <div>
              <div className="briefing-box">
                <div className="atlas-name">🧠 ATLAS — Daily Briefing</div>
                {briefingLoading ? (
                  <div className="typing"><span /><span /><span /></div>
                ) : (
                  <div className="briefing-text">{briefing}</div>
                )}
              </div>

              <div className="quick-btns">
                {["What should I focus on today?", "Show me my hottest leads", "How's my pipeline?", "Where can I improve?", "What's my revenue this month?", "Which industry converts best?"].map(q => (
                  <button key={q} className="quick-btn" onClick={() => askAtlas(q)}>{q}</button>
                ))}
              </div>

              <div className="atlas-container">
                <div>
                  <div className="chat-area">
                    <div className="chat-messages">
                      {atlasMessages.length === 0 && (
                        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem", textAlign: "center", marginTop: "2rem" }}>
                          Ask ATLAS anything about your business...
                        </div>
                      )}
                      {atlasMessages.map((m, i) => (
                        <div key={i} className={`msg ${m.role}`}>{m.content}</div>
                      ))}
                      {atlasLoading && (
                        <div className="msg assistant"><div className="typing"><span /><span /><span /></div></div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-row">
                      <input className="chat-input" value={atlasInput} onChange={e => setAtlasInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && askAtlas()}
                        placeholder="Ask ATLAS anything..." />
                      <button className="chat-send" onClick={() => askAtlas()}>Send</button>
                    </div>
                  </div>
                </div>

                <div className="notes-panel">
                  <h3>📌 Command Notes</h3>
                  <textarea className="notes-input" style={{ height: 80 }} value={atlasNote} onChange={e => setAtlasNote(e.target.value)} placeholder="Add a note or idea..." />
                  <button className="btn-primary" style={{ marginBottom: "1rem", width: "100%" }} onClick={() => { if (atlasNote.trim()) { setSavedNotes([atlasNote, ...savedNotes]); setAtlasNote(""); } }}>
                    Save Note
                  </button>
                  {savedNotes.length === 0 && <div style={{ color: "var(--hint)", fontSize: "0.75rem" }}>No notes yet</div>}
                  {savedNotes.map((n, i) => <div key={i} className="note-item">{n}</div>)}
                </div>
              </div>
            </div>
          )}

          {/* PIPELINE TAB */}
          {tab === "pipeline" && (
            <div>
              <div className="stat-grid">
                {[["all", "Total", "#a855f7"], ["New", "New", "#a855f7"], ["Contacted", "Contacted", "#3b82f6"], ["Booked", "Booked", "#10b981"], ["Closed", "Closed", "#f59e0b"]].map(([k, label, color]) => (
                  <div key={k} className={`stat ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>
                    <div className="stat-num" style={{ color }}>{k === "all" ? leads.length : leads.filter(l => (l.status || "New") === k).length}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>
              <input className="search-bar" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className="pipeline-grid">
                {STATUSES.map(status => {
                  const col = filteredLeads.filter(l => (l.status || "New") === status);
                  return (
                    <div key={status} className="col">
                      <div className="col-head">
                        <span className="col-title" style={{ color: STATUS_COLORS[status] }}>{status}</span>
                        <span className="col-count" style={{ background: `${STATUS_COLORS[status]}20`, color: STATUS_COLORS[status] }}>{col.length}</span>
                      </div>
                      {col.length === 0 ? <div className="empty" style={{ padding: "1.5rem 0" }}>Empty</div> : col.map(lead => {
                        const score = scoreLead(lead);
                        const isOpen = expanded === lead.id;
                        return (
                          <div key={lead.id} className={`lead-card ${isOpen ? "open" : ""}`} onClick={() => setExpanded(isOpen ? null : lead.id)}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="lead-name">{lead.name || "Unknown"}{(!lead.status || lead.status === "New") && <span className="pulse-dot" style={{ background: STATUS_COLORS.New }} />}</div>
                                <div className="lead-biz">{lead.business || "—"}</div>
                              </div>
                              <span style={{ fontSize: "0.6rem", color: "var(--hint)", whiteSpace: "nowrap", marginLeft: 6 }}>{fmt(lead.created_at)}</span>
                            </div>
                            <div className="tags">
                              {lead.industry && <span className="tag">{lead.industry}</span>}
                              {lead.revenue && <span className="tag">{lead.revenue}</span>}
                              {lead.timeline && <span className="tag">{lead.timeline}</span>}
                            </div>
                            <div className="score-bar"><div className="score-fill" style={{ width: `${score}%`, background: scoreColor(score) }} /></div>
                            <div className="score-txt">Score: {score}/100</div>
                            {isOpen && (
                              <div className="expand-content" onClick={e => e.stopPropagation()}>
                                <div className="detail-grid">
                                  {[["Email", lead.email], ["Phone", lead.phone], ["Pain Points", lead.pain_point], ["Timeline", lead.timeline]].map(([k, v]) => (
                                    <div key={k} className="detail-item"><label>{k}</label><span>{v || "—"}</span></div>
                                  ))}
                                </div>
                                <div className="move-row">
                                  {STATUSES.filter(s => s !== (lead.status || "New")).map(s => (
                                    <button key={s} className="move-btn" style={{ color: STATUS_COLORS[s], borderColor: `${STATUS_COLORS[s]}44` }} onClick={() => moveStatus(lead.id, s)}>→ {s}</button>
                                  ))}
                                </div>
                                <textarea className="notes-input" rows={2} value={notes[lead.id] || ""} onChange={e => setNotes({ ...notes, [lead.id]: e.target.value })} placeholder="Notes..." />
                                <div className="action-row">
                                  <button className="btn-primary" onClick={() => saveLeadNote(lead.id)}>Save</button>
                                  <a className="btn-ghost" href={`mailto:${lead.email}`}>Email</a>
                                  {lead.phone && <a className="btn-ghost" href={`tel:${lead.phone}`}>Call</a>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <div>
              <div className="analytics-grid">
                {[
                  ["Total Leads", leads.length, "#a855f7"],
                  ["Pipeline Value", `$${(pipelineValue / 1000).toFixed(0)}K`, "#3b82f6"],
                  ["Conversion Rate", `${conversionRate}%`, "#10b981"],
                  ["Avg Score", Math.round(leads.reduce((a, l) => a + scoreLead(l), 0) / Math.max(leads.length, 1)), "#f59e0b"],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="ana-card">
                    <div className="ana-num" style={{ color: color as string }}>{val}</div>
                    <div className="ana-label">{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div className="industry-chart">
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Leads by Industry</div>
                  {Object.entries(industryData).sort((a, b) => b[1] - a[1]).map(([ind, count]) => (
                    <div key={ind} className="bar-row">
                      <div className="bar-label">{ind}</div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / maxInd) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} /></div>
                      <div className="bar-val">{count}</div>
                    </div>
                  ))}
                  {Object.keys(industryData).length === 0 && <div className="empty">No data yet</div>}
                </div>
                <div className="industry-chart">
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Pipeline Stage</div>
                  {STATUSES.map(s => {
                    const count = leads.filter(l => (l.status || "New") === s).length;
                    return (
                      <div key={s} className="bar-row">
                        <div className="bar-label">{s}</div>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / Math.max(leads.length, 1)) * 100}%`, background: STATUS_COLORS[s] }} /></div>
                        <div className="bar-val">{count}</div>
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
              <input className="search-bar" placeholder="Search all leads..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className="filter-row">
                {["all", ...STATUSES].map(f => (
                  <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <div className="card" style={{ overflowX: "auto" }}>
                <table className="full-table">
                  <thead>
                    <tr>
                      {["Name", "Email", "Business", "Industry", "Revenue", "Timeline", "Pain Points", "Score", "Status", "Date"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.name || "—"}</td>
                        <td style={{ color: "var(--muted)" }}>{l.email || "—"}</td>
                        <td>{l.business || "—"}</td>
                        <td>{l.industry || "—"}</td>
                        <td>{l.revenue || "—"}</td>
                        <td>{l.timeline || "—"}</td>
                        <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.pain_point || "—"}</td>
                        <td><span style={{ color: scoreColor(scoreLead(l)), fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem" }}>{scoreLead(l)}</span></td>
                        <td><span className="status-pill" style={{ background: `${STATUS_COLORS[l.status || "New"]}20`, color: STATUS_COLORS[l.status || "New"] }}>{l.status || "New"}</span></td>
                        <td style={{ color: "var(--muted)" }}>{fmt(l.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && <div className="empty">No leads found</div>}
              </div>
            </div>
          )}

          {/* CLIENTS TAB */}
          {tab === "clients" && (
            <div>
              <div className="section-head">
                <div>
                  <div className="section-title">Active Clients</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 3 }}>
                    {clients.length} clients · ${clients.reduce((a, c) => a + parseFloat(c.monthly_value || 0), 0).toLocaleString()}/mo MRR
                  </div>
                </div>
                <button className="add-btn" onClick={() => setShowAddClient(true)}>+ Add Client</button>
              </div>
              <div className="card" style={{ overflowX: "auto" }}>
                <table className="full-table">
                  <thead>
                    <tr>{["Name", "Business", "Email", "Phone", "Industry", "Monthly Value", "Status", "Start Date"].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name || "—"}</td>
                        <td>{c.business || "—"}</td>
                        <td style={{ color: "var(--muted)" }}>{c.email || "—"}</td>
                        <td style={{ color: "var(--muted)" }}>{c.phone || "—"}</td>
                        <td>{c.industry || "—"}</td>
                        <td style={{ color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>${parseFloat(c.monthly_value || 0).toLocaleString()}/mo</td>
                        <td><span className="status-pill" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>{c.status || "Active"}</span></td>
                        <td style={{ color: "var(--muted)" }}>{c.start_date || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clients.length === 0 && <div className="empty">No clients yet — close some leads!</div>}
              </div>
            </div>
          )}

          {/* MARKETING TAB */}
          {tab === "marketing" && (
            <div>
              <div className="section-head">
                <div className="section-title">Campaigns</div>
                <button className="add-btn" onClick={() => setShowAddCampaign(true)}>+ Add Campaign</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {[
                  ["Total Campaigns", campaigns.length, "#a855f7"],
                  ["Total Messages Sent", campaigns.reduce((a, c) => a + parseInt(c.messages_sent || 0), 0), "#3b82f6"],
                  ["Total Leads Generated", campaigns.reduce((a, c) => a + parseInt(c.leads_generated || 0), 0), "#10b981"],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="ana-card">
                    <div className="ana-num" style={{ color: color as string }}>{val}</div>
                    <div className="ana-label">{label}</div>
                  </div>
                ))}
              </div>
              {campaigns.length === 0 ? <div className="empty">No campaigns yet</div> : campaigns.map(c => {
                const rate = c.messages_sent > 0 ? Math.round((c.responses / c.messages_sent) * 100) : 0;
                return (
                  <div key={c.id} className="campaign-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 3 }}>{c.name}</div>
                        <span className="status-pill" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>{c.platform}</span>
                      </div>
                      <span className="status-pill" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>{c.status}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                      {[["Messages", c.messages_sent], ["Responses", c.responses], ["Response Rate", `${rate}%`], ["Leads", c.leads_generated]].map(([label, val]) => (
                        <div key={label as string}>
                          <div style={{ fontSize: "0.65rem", color: "var(--hint)", marginBottom: 2 }}>{label}</div>
                          <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FINANCE TAB */}
          {tab === "finance" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {[["Total Revenue", `$${totalRevenue.toLocaleString()}`, "#10b981"], ["Total Expenses", `$${totalExpenses.toLocaleString()}`, "#f87171"], ["Net Profit", `$${profit.toLocaleString()}`, profit >= 0 ? "#10b981" : "#f87171"]].map(([label, val, color]) => (
                  <div key={label as string} className="ana-card">
                    <div className="ana-num" style={{ color: color as string }}>{val}</div>
                    <div className="ana-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="section-head">
                <div className="section-title">Transactions</div>
                <button className="add-btn" onClick={() => setShowAddFinance(true)}>+ Add Entry</button>
              </div>
              {finances.length === 0 ? <div className="empty">No entries yet</div> : finances.map(f => (
                <div key={f.id} className="finance-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{f.description || "—"}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{f.category} · {f.date}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: f.type === "revenue" ? "#10b981" : "#f87171", fontSize: "0.95rem" }}>
                    {f.type === "revenue" ? "+" : "-"}${parseFloat(f.amount || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODALS */}
        {showAddClient && (
          <div className="form-overlay" onClick={() => setShowAddClient(false)}>
            <div className="form-card" onClick={e => e.stopPropagation()}>
              <h2>Add Client</h2>
              <div className="form-row">
                <div className="form-field"><label>Name</label><input className="form-input" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} /></div>
                <div className="form-field"><label>Business</label><input className="form-input" value={newClient.business} onChange={e => setNewClient({ ...newClient, business: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label>Email</label><input className="form-input" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} /></div>
                <div className="form-field"><label>Phone</label><input className="form-input" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label>Industry</label><input className="form-input" value={newClient.industry} onChange={e => setNewClient({ ...newClient, industry: e.target.value })} /></div>
                <div className="form-field"><label>Monthly Value ($)</label><input className="form-input" type="number" value={newClient.monthly_value} onChange={e => setNewClient({ ...newClient, monthly_value: e.target.value })} /></div>
              </div>
              <div className="form-field"><label>Start Date</label><input className="form-input" type="date" /></div>
              <div className="action-row" style={{ marginTop: "1rem" }}>
                <button className="btn-primary" onClick={addClient}>Add Client</button>
                <button className="btn-ghost" onClick={() => setShowAddClient(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showAddFinance && (
          <div className="form-overlay" onClick={() => setShowAddFinance(false)}>
            <div className="form-card" onClick={e => e.stopPropagation()}>
              <h2>Add Finance Entry</h2>
              <div className="form-row">
                <div className="form-field"><label>Type</label>
                  <select className="form-input" value={newFinance.type} onChange={e => setNewFinance({ ...newFinance, type: e.target.value })}>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="form-field"><label>Amount ($)</label><input className="form-input" type="number" value={newFinance.amount} onChange={e => setNewFinance({ ...newFinance, amount: e.target.value })} /></div>
              </div>
              <div className="form-field"><label>Description</label><input className="form-input" value={newFinance.description} onChange={e => setNewFinance({ ...newFinance, description: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-field"><label>Category</label><input className="form-input" value={newFinance.category} onChange={e => setNewFinance({ ...newFinance, category: e.target.value })} /></div>
                <div className="form-field"><label>Date</label><input className="form-input" type="date" value={newFinance.date} onChange={e => setNewFinance({ ...newFinance, date: e.target.value })} /></div>
              </div>
              <div className="action-row" style={{ marginTop: "1rem" }}>
                <button className="btn-primary" onClick={addFinance}>Add Entry</button>
                <button className="btn-ghost" onClick={() => setShowAddFinance(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showAddCampaign && (
          <div className="form-overlay" onClick={() => setShowAddCampaign(false)}>
            <div className="form-card" onClick={e => e.stopPropagation()}>
              <h2>Add Campaign</h2>
              <div className="form-row">
                <div className="form-field"><label>Campaign Name</label><input className="form-input" value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} /></div>
                <div className="form-field"><label>Platform</label><input className="form-input" placeholder="Instagram, LinkedIn..." value={newCampaign.platform} onChange={e => setNewCampaign({ ...newCampaign, platform: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label>Messages Sent</label><input className="form-input" type="number" value={newCampaign.messages_sent} onChange={e => setNewCampaign({ ...newCampaign, messages_sent: e.target.value })} /></div>
                <div className="form-field"><label>Responses</label><input className="form-input" type="number" value={newCampaign.responses} onChange={e => setNewCampaign({ ...newCampaign, responses: e.target.value })} /></div>
              </div>
              <div className="form-field"><label>Leads Generated</label><input className="form-input" type="number" value={newCampaign.leads_generated} onChange={e => setNewCampaign({ ...newCampaign, leads_generated: e.target.value })} /></div>
              <div className="action-row" style={{ marginTop: "1rem" }}>
                <button className="btn-primary" onClick={addCampaign}>Add Campaign</button>
                <button className="btn-ghost" onClick={() => setShowAddCampaign(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

