"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xlyzfcabvvuhrtnigydm.supabase.co",
  "sb_publishable_aZIy_vimeZ8V1UJRcZFLEw_iA0pf38O"
);

const STEPS = 5;
const INDUSTRIES = ["Roofing","HVAC","Plumbing","Real Estate","Legal","Medical","E-Commerce","Restaurant","Other"];
const PAIN_POINTS = ["Missing calls & leads","Manual follow-ups","No-shows","Slow response times","Too much admin work","Poor client communication"];
const REVENUES = ["Under $250K","$250K–$500K","$500K–$1M","$1M–$5M","$5M+"];
const TIMELINES = ["ASAP","Within 30 days","1-3 months","Just exploring"];

function renderText(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function GetStarted() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", business: "", industry: "",
    pain_points: [] as string[], pain_point_other: "",
    revenue: "", timeline: ""
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const [done, setDone] = useState(false);

  const progress = (step / STEPS) * 100;

  function togglePainPoint(p: string) {
    setForm(f => ({
      ...f,
      pain_points: f.pain_points.includes(p)
        ? f.pain_points.filter(x => x !== p)
        : [...f.pain_points, p]
    }));
  }

  function getPainPointString() {
    const all = [...form.pain_points];
    if (form.pain_point_other.trim()) all.push(form.pain_point_other.trim());
    return all.join(", ");
  }

  async function handleSubmit() {
    setLoading(true);
    const pain_point = getPainPointString();
    const payload = { ...form, pain_point };
    await supabase.from("leads").insert([{
      name: form.name, email: form.email, business: form.business,
      industry: form.industry, pain_point, revenue: form.revenue, timeline: form.timeline
    }]);
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setRecommendation(data.recommendation);
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
  };

  if (done) return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem" }}>🚀</div>
          <h1 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 700, margin: "0.5rem 0" }}>
            You are all set, {form.name.split(" ")[0]}!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Here is your custom automation plan:</p>
        </div>
        <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.8, fontSize: "1rem" }}>
            {recommendation ? renderText(recommendation) : "Generating your custom plan..."}
          </p>
        </div>
        <a href="https://calendly.com/caseygallagher9209/free-operations-lead-flow-audit" target="_blank" style={{ display: "block", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", textAlign: "center", padding: "1rem", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>
          Book Your Free Strategy Call
        </a>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Progress */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Step {step} of {STEPS}</span>
            <span style={{ color: "#a855f7", fontSize: "0.8rem" }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)", borderRadius: 4, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Let us get to know you</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Tell us about yourself and your business</p>
            {["name","email","business"].map(field => (
              <input key={field}
                placeholder={field === "name" ? "Your full name" : field === "email" ? "Your email" : "Business name"}
                value={form[field as keyof typeof form] as string}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={inputStyle}
              />
            ))}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>What industry are you in?</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>We will tailor your automation plan to your industry</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => setForm({ ...form, industry: ind })}
                  style={{ padding: "0.85rem", borderRadius: 10, border: `1px solid ${form.industry === ind ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.industry === ind ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}>
                  {ind}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Multi-select pain points */}
        {step === 3 && (
          <div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>What are your biggest pain points?</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Select all that apply</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {PAIN_POINTS.map(p => {
                const selected = form.pain_points.includes(p);
                return (
                  <button key={p} onClick={() => togglePainPoint(p)}
                    style={{ padding: "1rem", borderRadius: 10, border: `1px solid ${selected ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: selected ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.9rem", textAlign: "left", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {p}
                    {selected && <span style={{ color: "#a855f7", fontSize: "1.1rem" }}>✓</span>}
                  </button>
                );
              })}
              {/* Other text box */}
              <input
                placeholder="Other — describe your challenge..."
                value={form.pain_point_other}
                onChange={e => setForm({ ...form, pain_point_other: e.target.value })}
                style={{ ...inputStyle, marginBottom: 0, borderColor: form.pain_point_other ? "#a855f7" : "rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>What is your annual revenue?</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>This helps us size the right solution for you</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {REVENUES.map(r => (
                <button key={r} onClick={() => setForm({ ...form, revenue: r })}
                  style={{ padding: "1rem", borderRadius: 10, border: `1px solid ${form.revenue === r ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.revenue === r ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.9rem", textAlign: "left", transition: "all 0.2s" }}>
                  {r}
                </button>
              ))}
            </div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>When do you want to go live?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {TIMELINES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, timeline: t })}
                  style={{ padding: "0.85rem", borderRadius: 10, border: `1px solid ${form.timeline === t ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.timeline === t ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>You are almost there!</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "2rem", fontSize: "0.9rem" }}>We will generate a custom AI automation plan just for {form.business}</p>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
              {[
                ["Name", form.name], ["Email", form.email], ["Business", form.business],
                ["Industry", form.industry], ["Pain Points", getPainPointString()],
                ["Revenue", form.revenue], ["Timeline", form.timeline]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>{k}</span>
                  <span style={{ color: "#fff", fontSize: "0.85rem", maxWidth: "60%", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              style={{ padding: "0.85rem 1.5rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: "0.9rem" }}>
              Back
            </button>
          )}
          <button onClick={step === STEPS ? handleSubmit : () => setStep(step + 1)}
            disabled={loading}
            style={{ marginLeft: "auto", padding: "0.85rem 2rem", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Generating your plan..." : step === STEPS ? "Get My Custom Plan" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
