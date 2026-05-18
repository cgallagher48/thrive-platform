"use client";
import { useState } from "react";

const SIDEBAR_LINKS = [
  { icon: "▪", label: "Overview" },
  { icon: "◈", label: "Workflows" },
  { icon: "◎", label: "Integrations" },
  { icon: "⬡", label: "Analytics" },
  { icon: "◇", label: "Reports" },
];

const WORKFLOWS = [
  { name: "Missed Call AI Responder", status: "running", lastRun: "2 min ago", nextRun: "On trigger", category: "Lead Recovery" },
  { name: "New Lead CRM Entry", status: "running", lastRun: "14 min ago", nextRun: "On trigger", category: "CRM" },
  { name: "Weekly Revenue Report", status: "running", lastRun: "2 days ago", nextRun: "Monday 8am", category: "Reporting" },
  { name: "Follow-up Email Sequence", status: "running", lastRun: "1 hr ago", nextRun: "On trigger", category: "Email" },
  { name: "Invoice Generation", status: "paused", lastRun: "5 days ago", nextRun: "Paused", category: "Billing" },
  { name: "Google Review Request", status: "running", lastRun: "3 hr ago", nextRun: "On trigger", category: "Reputation" },
  { name: "Job Completion Survey", status: "running", lastRun: "6 hr ago", nextRun: "On trigger", category: "CX" },
  { name: "Estimate Follow-up", status: "paused", lastRun: "12 days ago", nextRun: "Paused", category: "Sales" },
];

const INTEGRATIONS = [
  { name: "Jobber", status: "connected", icon: "🔧", desc: "Field service management" },
  { name: "Google Business", status: "connected", icon: "📍", desc: "Reviews & local presence" },
  { name: "Twilio", status: "connected", icon: "📞", desc: "SMS & call handling" },
  { name: "Gmail", status: "connected", icon: "📧", desc: "Email automation" },
  { name: "Stripe", status: "disconnected", icon: "💳", desc: "Payments & invoicing" },
  { name: "Slack", status: "disconnected", icon: "💬", desc: "Team notifications" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const BARS = [28, 42, 38, 55, 61, 70, 74, 82, 78, 88, 91, 95];

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #080518 0%, #0d0920 50%, #080518 100%)",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
    }}>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      )}

      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
        background: "rgba(10,6,24,0.98)",
        borderRight: "1px solid rgba(139,92,246,0.12)",
        display: "flex", flexDirection: "column", zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }} className="sidebar">
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>Thrive <span style={{ color: "#a78bfa" }}>.</span></div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.2rem" }}>Client Portal</div>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Account</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Apex Roofing Co.</div>
          <div style={{ fontSize: "0.72rem", color: "#a78bfa", marginTop: "0.2rem" }}>Growth Plan</div>
        </div>
        <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
          {SIDEBAR_LINKS.map(({ icon, label }) => (
            <button key={label} onClick={() => { setActive(label); setSidebarOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              width: "100%", padding: "0.65rem 0.75rem", borderRadius: 8,
              border: "none", cursor: "pointer", marginBottom: "0.25rem",
              background: active === label ? "rgba(139,92,246,0.18)" : "transparent",
              color: active === label ? "#fff" : "rgba(255,255,255,0.45)",
              fontSize: "0.875rem", fontWeight: active === label ? 600 : 400,
              textAlign: "left", transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: "0.8rem", color: active === label ? "#a78bfa" : "rgba(255,255,255,0.25)" }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ fontSize: "0.7rem", color: "#22c55e", fontWeight: 600, letterSpacing: "0.05em" }}>LIVE STATUS</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>6 workflows running</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="main-content">
        <div style={{
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,5,24,0.8)", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="hamburger-dash" onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "0.25rem",
              display: "none", flexDirection: "column", gap: 4,
            }}>
              <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
              <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
              <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
            </button>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{active}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Apex Roofing Co.</div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>A</div>
          </div>
        </div>

        <div style={{ padding: "2rem 1.5rem", flex: 1 }}>

          {active === "Overview" && (
            <div>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Good morning, Apex Roofing 👋</h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>Here is your automation performance this month.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Hours Saved", value: "247h", change: "+12h this week", color: "#22c55e" },
                  { label: "Tasks Automated", value: "1,840", change: "+143 this week", color: "#a78bfa" },
                  { label: "Cost Reduction", value: "68%", change: "vs. manual ops", color: "#f59e0b" },
                  { label: "Est. Revenue Recovered", value: "$34,200", change: "from missed calls", color: "#38bdf8" },
                ].map(({ label, value, change, color }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.25rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{label}</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color, marginBottom: "0.25rem" }}>{value}</div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>{change}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.25rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>Recent Activity</div>
                {[
                  { msg: "Missed call from (614) 882-4401 — AI responded in 12s", time: "2 min ago", dot: "#22c55e" },
                  { msg: "New lead synced to CRM — Mike Patterson, $8,400 estimate", time: "14 min ago", dot: "#a78bfa" },
                  { msg: "Follow-up email sent — Day 3 sequence, Jordan Reeves", time: "1 hr ago", dot: "#a78bfa" },
                  { msg: "Google review request sent — completed job #1847", time: "3 hr ago", dot: "#38bdf8" },
                  { msg: "Weekly revenue report generated and emailed", time: "2 days ago", dot: "#f59e0b" },
                ].map(({ msg, time, dot }, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", paddingBottom: "0.85rem", marginBottom: "0.85rem", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot, marginTop: "0.3rem", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{msg}</div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.2rem" }}>{time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Workflows" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Workflows</h1>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>6 active · 2 paused</p>
                </div>
                <div style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", padding: "0.55rem 1.25rem", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>+ Request Workflow</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {WORKFLOWS.map((w) => (
                  <div key={w.name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: w.status === "running" ? "#22c55e" : "rgba(255,255,255,0.2)", boxShadow: w.status === "running" ? "0 0 6px #22c55e" : "none", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{w.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: "0.15rem" }}>{w.category} · Last run: {w.lastRun}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>Next: {w.nextRun}</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 20, background: w.status === "running" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: w.status === "running" ? "#22c55e" : "rgba(255,255,255,0.35)", border: `1px solid ${w.status === "running" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}` }}>
                        {w.status === "running" ? "● Running" : "⏸ Paused"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Integrations" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Integrations</h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>4 connected · 2 available</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                {INTEGRATIONS.map((int) => (
                  <div key={int.name} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${int.status === "connected" ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "1.5rem" }}>{int.icon}</span>
                      <div style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 20, background: int.status === "connected" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: int.status === "connected" ? "#22c55e" : "rgba(255,255,255,0.35)", border: `1px solid ${int.status === "connected" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}` }}>
                        {int.status === "connected" ? "Connected" : "Available"}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{int.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{int.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Analytics" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Analytics</h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>Automation performance · Last 12 months</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.5rem", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "1.5rem" }}>Automation Volume</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: 160 }}>
                {BARS.map((h, i) => (
  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
    <div style={{
      width: "100%",
      height: `${h}%`,
      background: i === BARS.length - 1
        ? "linear-gradient(180deg, #a855f7, #7c3aed)"
        : "rgba(139,92,246,0.3)",
      borderRadius: "4px 4px 0 0",
      minHeight: "4px",
    }} />
  </div>
))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  {MONTHS.map((m, i) => (
                    <span key={i} style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem" }}>{m}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Avg. Response Time", value: "11s", sub: "Missed call to SMS" },
                  { label: "Lead Capture Rate", value: "94%", sub: "vs. 41% industry avg" },
                  { label: "Workflows Executed", value: "12,840", sub: "This year" },
                  { label: "Uptime", value: "99.9%", sub: "Last 90 days" },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.25rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{label}</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.25rem" }}>{value}</div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Reports" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Reports</h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>Generated automatically every week</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { title: "Weekly Performance Report", date: "May 12, 2026", size: "284 KB" },
                  { title: "Weekly Performance Report", date: "May 5, 2026", size: "271 KB" },
                  { title: "Monthly Summary — April 2026", date: "May 1, 2026", size: "1.2 MB" },
                  { title: "Weekly Performance Report", date: "Apr 28, 2026", size: "268 KB" },
                  { title: "Weekly Performance Report", date: "Apr 21, 2026", size: "255 KB" },
                  { title: "Monthly Summary — March 2026", date: "Apr 1, 2026", size: "1.1 MB" },
                ].map((r, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <span style={{ fontSize: "1.2rem" }}>📄</span>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{r.title}</div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: "0.15rem" }}>{r.date} · {r.size}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#a78bfa", cursor: "pointer", fontWeight: 500 }}>↓ Download</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
          .main-content { margin-left: 240px; }
          .hamburger-dash { display: none !important; }
        }
        @media (max-width: 768px) {
          .hamburger-dash { display: flex !important; }
        }
      `}</style>
    </div>
  );
}