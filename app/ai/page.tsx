"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xlyzfcabvvuhrtnigydm.supabase.co",
  "sb_publishable_aZIy_vimeZ8V1UJRcZFLEw_iA0pf38O"
);

const TIERS = [
  {
    name: "Spark",
    price: "$1,500",
    period: "one-time build",
    description: "Your first AI — a smart chatbot that captures leads, answers FAQs, and books calls automatically.",
    features: [
      "Custom-trained on your business",
      "Lead capture & qualification",
      "FAQ automation",
      "Calendly booking integration",
      "Website embed ready",
      "30-day support",
    ],
    cta: "Get Spark",
    color: "#60a5fa",
    highlighted: false,
  },
  {
    name: "Forge",
    price: "$3,500",
    period: "one-time build",
    description: "A full AI automation system — handles leads, follow-ups, client communication, and workflow monitoring.",
    features: [
      "Everything in Spark",
      "Automated follow-up sequences",
      "CRM integration",
      "Workflow monitoring AI",
      "Custom dashboard",
      "Email & SMS automation",
      "60-day support",
    ],
    cta: "Get Forge",
    color: "#a855f7",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Atlas",
    price: "$7,500",
    period: "one-time build",
    description: "Your own ATLAS — a full business command center with AI brain, pipeline management, analytics, and more.",
    features: [
      "Everything in Forge",
      "Full ops command center",
      "AI business advisor (like ATLAS)",
      "Custom pipeline & analytics",
      "Finance & marketing tracking",
      "Client management system",
      "90-day support + monthly check-ins",
    ],
    cta: "Get Atlas",
    color: "#e879f9",
    highlighted: false,
  },
];

const EXAMPLES = [
  { icon: "🏠", industry: "Roofing", ai: "Answers missed calls, books inspections, follows up with estimates automatically" },
  { icon: "⚕️", industry: "Medical Practice", ai: "Handles patient inquiries, appointment booking, and insurance FAQ 24/7" },
  { icon: "🏢", industry: "Real Estate", ai: "Qualifies leads, schedules showings, and nurtures prospects until they're ready to buy" },
  { icon: "⚖️", industry: "Legal", ai: "Screens potential clients, collects case info, and schedules consultations automatically" },
  { icon: "🔧", industry: "HVAC", ai: "Captures emergency calls, dispatches technicians, and sends follow-up surveys" },
  { icon: "💼", industry: "Agency", ai: "Onboards clients, tracks deliverables, and monitors campaign performance in real time" },
];

function useInView(threshold = 0.15) {
  const [inView, setInView] = useState(false);
  const ref = (el: HTMLDivElement | null) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
  };
  return { ref, inView };
}

export default function AIPage() {
  const [form, setForm] = useState({ name: "", email: "", business: "", industry: "", ai_vision: "", tier: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const hero = useInView();
  const examples = useInView();
  const tiers = useInView();
  const formSection = useInView();

  async function handleSubmit() {
    if (!form.name || !form.email || !form.business) {
      setError("Please fill in your name, email, and business name.");
      return;
    }
    setError("");
    setLoading(true);
    await supabase.from("leads").insert([{
      name: form.name,
      email: form.email,
      business: form.business,
      industry: form.industry,
      pain_point: `Custom AI Request (${form.tier || "Not specified"}): ${form.ai_vision}`,
    }]);
    setLoading(false);
    setDone(true);
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #080612; color: #fff; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #080612; }
    ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 3px; }
  `;

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.85rem 1rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#fff", fontSize: "0.95rem",
    outline: "none", fontFamily: "inherit",
  };

  if (done) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#080612", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "linear-gradient(145deg, rgba(124,58,237,0.18), rgba(20,12,48,0.8))", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 24, padding: "4rem 3rem", maxWidth: 560, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🧠</div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2rem", color: "#fff", marginBottom: "1rem" }}>You're on the list.</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "2rem" }}>
            Casey will personally review your request and reach out within 24 hours to map out your custom AI build.
          </p>
          <a href="/" style={{ display: "inline-block", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", padding: "1rem 2.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
            Back to Thrive →
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ background: "#080612", minHeight: "100vh" }}>

        {/* Navbar */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,6,18,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <img src="/logo.png" alt="Thrive" style={{ height: 32 }} />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>Thrive</span>
            </a>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem" }}>Home</a>
              <a href="/get-started" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem" }}>Get Started</a>
              <a href="/book" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem" }}>Book a Call</a>
              <a href="#build-your-ai" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", padding: "0.55rem 1.4rem", borderRadius: 6, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                Build My AI
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 2rem 6rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div style={{ position: "absolute", top: "20%", left: "25%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,121,249,0.15) 0%, transparent 70%)", filter: "blur(50px)" }} />

          <div ref={hero.ref} style={{ position: "relative", zIndex: 1, maxWidth: 860, opacity: hero.inView ? 1 : 0, transform: hero.inView ? "none" : "translateY(30px)", transition: "all 0.8s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 100, padding: "0.4rem 1rem", marginBottom: "2.5rem" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", display: "inline-block", boxShadow: "0 0 8px #a78bfa" }} />
              <span style={{ color: "#c4b5fd", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Custom AI Built For Your Business</span>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "#fff", lineHeight: 1.07, letterSpacing: "-0.03em", marginBottom: "1.8rem", fontWeight: 400 }}>
              Your business.<br />
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your AI.</span>
            </h1>

            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.75, maxWidth: 620, margin: "0 auto 3rem" }}>
              Thrive builds custom AI systems tailored to your exact business — answering leads, booking clients, monitoring workflows, and running your operations on autopilot.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="#build-your-ai" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", padding: "1rem 2.2rem", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
                Build My Custom AI →
              </a>
              <a href="#examples" style={{ background: "transparent", color: "rgba(255,255,255,0.75)", padding: "1rem 2rem", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", border: "1px solid rgba(255,255,255,0.12)" }}>
                See Examples
              </a>
            </div>

            <div style={{ display: "flex", gap: "3rem", justifyContent: "center", marginTop: "4.5rem", flexWrap: "wrap" }}>
              {[["48hrs", "Average build time"], ["100%", "Custom to your business"], ["24/7", "AI works around the clock"], ["$0", "No monthly fees on Spark"]].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2rem", color: "#a78bfa" }}>{num}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples */}
        <section id="examples" style={{ padding: "7rem 2rem", background: "rgba(12,8,30,0.6)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Real Examples</p>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
                What your AI could do<br />
                <span style={{ color: "rgba(255,255,255,0.3)" }}>starting this week.</span>
              </h2>
            </div>

            <div ref={examples.ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
              {EXAMPLES.map(({ icon, industry, ai }, i) => (
                <div key={industry} style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 14, padding: "1.75rem", opacity: examples.inView ? 1 : 0, transform: examples.inView ? "none" : "translateY(20px)", transition: `all 0.6s ease ${i * 0.08}s` }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{icon}</div>
                  <div style={{ color: "#a78bfa", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{industry}</div>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.7 }}>{ai}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section style={{ padding: "7rem 2rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Packages</p>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
                Pick your level.<br />
                <span style={{ color: "#a78bfa" }}>We build the rest.</span>
              </h2>
            </div>

            <div ref={tiers.ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
              {TIERS.map(({ name, price, period, description, features, cta, highlighted, badge, color }, i) => (
                <div key={name} style={{ padding: "2.25rem", borderRadius: 16, border: highlighted ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(139,92,246,0.15)", background: highlighted ? "linear-gradient(145deg, rgba(124,58,237,0.18), rgba(168,85,247,0.08))" : "rgba(139,92,246,0.04)", position: "relative", boxShadow: highlighted ? "0 0 60px rgba(124,58,237,0.2)" : "none", opacity: tiers.inView ? 1 : 0, transform: tiers.inView ? (highlighted ? "scale(1.02)" : "none") : "translateY(24px)", transition: `all 0.65s ease ${i * 0.1}s` }}>
                  {badge && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", padding: "0.3rem 1rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{badge}</div>
                  )}
                  <div style={{ color: color, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2.6rem", color: "#fff", lineHeight: 1 }}>{price}</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginBottom: "1rem" }}>{period}</div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1.75rem" }}>{description}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
                    {features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1, background: highlighted ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#a78bfa", fontSize: "0.6rem" }}>✓</span>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a href="#build-your-ai" onClick={() => setForm(f => ({ ...f, tier: name }))}
                    style={{ display: "block", textAlign: "center", padding: "0.9rem", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: "0.88rem", background: highlighted ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent", color: highlighted ? "#fff" : "rgba(255,255,255,0.6)", border: highlighted ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                    {cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section id="build-your-ai" style={{ padding: "7rem 2rem 8rem", background: "rgba(12,8,30,0.6)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div ref={formSection.ref} style={{ opacity: formSection.inView ? 1 : 0, transform: formSection.inView ? "none" : "translateY(30px)", transition: "all 0.8s ease" }}>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Get Started</p>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff", lineHeight: 1.15, marginBottom: "1rem" }}>
                  Tell us about your business.
                </h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  Casey will personally review your submission and reach out within 24 hours with a custom AI proposal.
                </p>
              </div>

              <div style={{ background: "linear-gradient(145deg, rgba(124,58,237,0.12), rgba(20,12,48,0.8))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, padding: "2.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Full Name *</label>
                    <input style={inp} placeholder="John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Email *</label>
                    <input style={inp} placeholder="john@business.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Business Name *</label>
                    <input style={inp} placeholder="Your business" value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Industry</label>
                    <input style={inp} placeholder="Roofing, Legal, HVAC..." value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Which package interests you?</label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {["Spark", "Forge", "Atlas", "Not sure"].map(t => (
                      <button key={t} onClick={() => setForm({ ...form, tier: t })}
                        style={{ flex: 1, padding: "0.65rem", borderRadius: 8, border: `1px solid ${form.tier === t ? "#a855f7" : "rgba(255,255,255,0.1)"}`, background: form.tier === t ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: form.tier === t ? 600 : 400 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>What do you want your AI to do?</label>
                  <textarea style={{ ...inp, resize: "none", lineHeight: 1.6 }} rows={4}
                    placeholder="Describe what you want automated — answering leads, booking calls, following up with clients, monitoring workflows, etc."
                    value={form.ai_vision} onChange={e => setForm({ ...form, ai_vision: e.target.value })} />
                </div>

                {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

                <button onClick={handleSubmit} disabled={loading}
                  style={{ width: "100%", padding: "1.1rem", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem", fontWeight: 700, opacity: loading ? 0.7 : 1, fontFamily: "inherit", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
                  {loading ? "Submitting..." : "Request My Custom AI →"}
                </button>

                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", textAlign: "center", marginTop: "1rem" }}>
                  No commitment. Casey reviews every submission personally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(139,92,246,0.12)", padding: "2.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.2rem", color: "#fff" }}>Thrive<span style={{ color: "#a78bfa" }}>.</span></span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>© 2025 Thrive Automation Agency</span>
          <div style={{ display: "flex", gap: "2rem" }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "0.78rem" }}>Home</a>
            <a href="/get-started" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "0.78rem" }}>Get Started</a>
            <a href="/book" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "0.78rem" }}>Book a Call</a>
          </div>
        </footer>
      </div>
    </>
  );
}
