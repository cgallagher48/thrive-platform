"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xlyzfcabvvuhrtnigydm.supabase.co",
  "sb_publishable_aZIy_vimeZ8V1UJRcZFLEw_iA0pf38O"
);

const INDUSTRIES = ["Roofing","HVAC","Plumbing","Real Estate","Legal","Medical","E-Commerce","Restaurant","Other"];
const REVENUES = ["Under $250K","$250K–$500K","$500K–$1M","$1M–$5M","$5M+"];
const TIMELINES = ["ASAP","Within 30 days","1-3 months","Just exploring"];

export default function Book() {
  const [form, setForm] = useState({
    name: "", email: "", business: "", industry: "",
    pain_point: "", revenue: "", timeline: ""
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.business) {
      setError("Please fill in your name, email, and business name.");
      return;
    }
    setError("");
    setLoading(true);
    await supabase.from("leads").insert([{
      name: form.name, email: form.email, business: form.business,
      industry: form.industry, pain_point: form.pain_point,
      revenue: form.revenue, timeline: form.timeline
    }]);
    setLoading(false);
    setDone(true);
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "2rem", fontFamily: "'Inter', sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 24, padding: "2.5rem", width: "100%", maxWidth: 560,
    boxShadow: "0 0 60px rgba(139,92,246,0.1)",
  };

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%", marginBottom: "1rem",
    padding: "0.85rem 1rem", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#fff", fontSize: "0.95rem", boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.5)", fontSize: "0.8rem",
    marginBottom: "0.4rem", display: "block", textTransform: "uppercase", letterSpacing: "0.05em"
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "1.5rem"
  };

  if (done) return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          You are booked!
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Casey will personally reach out within 24 hours to confirm your strategy call. Check your email for a confirmation.
        </p>
        <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem", textAlign: "left" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>What happens next</p>
          {["Casey reviews your info before the call", "You get a personalized automation roadmap", "No pressure — just a clear plan to grow"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <span style={{ color: "#a855f7", fontSize: "1rem" }}>✓</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{item}</span>
            </div>
          ))}
        </div>
        <a href="https://calendly.com/caseygallagher9209/free-operations-lead-flow-audit" target="_blank" style={{ display: "block", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", textAlign: "center", padding: "1rem", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>
          Pick Your Time - Book Your Free Call
        </a>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-block", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "0.4rem 1rem", marginBottom: "1rem" }}>
            <span style={{ color: "#a855f7", fontSize: "0.8rem", fontWeight: 600 }}>FREE 20-MINUTE STRATEGY CALL</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
            Book Your Free Strategy Call
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
            Tell us about your business and we will come prepared with a custom automation plan.
          </p>
        </div>

        {/* Name + Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input placeholder="John Smith" value={form.name}
              onChange={e => set("name", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input placeholder="john@business.com" value={form.email}
              onChange={e => set("email", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
        </div>

        {/* Business */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Business Name *</label>
          <input placeholder="Your business name" value={form.business}
            onChange={e => set("business", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>

        {/* Industry */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Industry</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => set("industry", ind)}
                style={{ padding: "0.6rem", borderRadius: 8, border: `1px solid ${form.industry === ind ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.industry === ind ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", transition: "all 0.2s" }}>
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Pain point */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Biggest challenge</label>
          <textarea placeholder="What is costing you the most time or money right now?"
            value={form.pain_point} onChange={e => set("pain_point", e.target.value)}
            rows={3}
            style={{ ...inputStyle, marginBottom: 0, resize: "none", lineHeight: 1.5 }} />
        </div>

        {/* Revenue */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Annual Revenue</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {REVENUES.map(r => (
              <button key={r} onClick={() => set("revenue", r)}
                style={{ padding: "0.5rem 1rem", borderRadius: 20, border: `1px solid ${form.revenue === r ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.revenue === r ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", transition: "all 0.2s" }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={sectionStyle}>
          <label style={labelStyle}>When do you want to get started?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {TIMELINES.map(t => (
              <button key={t} onClick={() => set("timeline", t)}
                style={{ padding: "0.5rem 1rem", borderRadius: 20, border: `1px solid ${form.timeline === t ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.timeline === t ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", transition: "all 0.2s" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "1rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem", fontWeight: 700, opacity: loading ? 0.7 : 1, transition: "all 0.2s" }}>
          {loading ? "Booking your call..." : "Book My Free Strategy Call"}
        </button>

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", textAlign: "center", marginTop: "1rem" }}>
          No spam. No pressure. Just a real conversation about your business.
        </p>
      </div>
    </div>
  );
}


