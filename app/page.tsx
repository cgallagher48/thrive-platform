"use client";

import { useState, useEffect, useRef } from "react";

// ─── Utility ───────────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const PRICING: PricingTier[] = [
  {
    name: "Starter",
    price: "$197",
    period: "/ month",
    description: "Get your first automation live and start recovering missed calls fast.",
    features: [
      "Up to 3 automation workflows",
      "CRM & email integrations",
      "Monthly performance report",
      "Dedicated onboarding call",
      "Slack support channel",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$397",
    period: "/ month",
    description: "Full automation coverage across your business. The engine for scale.",
    features: [
      "Unlimited workflows",
      "Custom automation build-out",
      "Real-time analytics dashboard",
      "Priority integration support",
      "Weekly strategy sessions",
    ],
    cta: "Start Growing",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Operator",
    price: "$697",
    period: "/ month",
    description: "Advanced systems for high-volume operations that can't afford downtime.",
    features: [
      "Everything in Growth",
      "Custom workflow architecture",
      "Dedicated automation engineer",
      "Advanced reporting & insights",
      "Priority phone support",
      "Quarterly growth reviews",
    ],
    cta: "Talk to Us",
    highlighted: false,
  },
];

const INDUSTRIES = [
  { icon: "◈", label: "Finance & Fintech", stat: "68% ops cost reduction" },
  { icon: "⬡", label: "Healthcare", stat: "Same-day patient workflows" },
  { icon: "◎", label: "Logistics", stat: "10× shipment capacity" },
  { icon: "⬢", label: "SaaS & Tech", stat: "Zero-touch onboarding" },
  { icon: "◇", label: "Real Estate", stat: "Lead-to-close in 48 hrs" },
  { icon: "⬟", label: "Legal & Compliance", stat: "90% faster doc review" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Discovery Call",
    desc: "We map every manual, repetitive process costing you time and money. No fluff — just a precise diagnosis.",
  },
  {
    step: "02",
    title: "Blueprint & Build",
    desc: "Our engineers design bespoke automation flows using AI agents, APIs, and your existing stack.",
  },
  {
    step: "03",
    title: "Deploy & Measure",
    desc: "Go live in days, not months. Every workflow is tracked against hard ROI metrics from day one.",
  },
  {
    step: "04",
    title: "Iterate & Scale",
    desc: "We continuously optimize and expand coverage. Your automation compounds over time.",
  },
];

// ─── Animation Hook ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["The Problem", "How It Works", "Industries", "Pricing"];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.4s ease",
        background: scrolled
          ? "rgba(10, 6, 20, 0.95)"
          : "rgba(10, 6, 20, 0.4)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>
          Thrive <span style={{ color: "#a78bfa" }}>.</span>
        </span>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }} className="thrive-desktop-nav">
          {links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#a78bfa")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
            >
              {item}
            </a>
          ))}
          <a
            href="#pricing"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              padding: "0.55rem 1.4rem",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.opacity = "0.85";
              (e.target as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.opacity = "1";
              (e.target as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Book a Call
          </a> 
          <a
  href="/login"
  onClick={() => setMenuOpen(false)}
  style={{
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.85rem",
    padding: "0.55rem 1rem",
    borderRadius: 6,
    background: "rgba(139,92,246,0.9)",
    border: "1px solid rgba(139,92,246,0.6)",
    textAlign: "center",
  }}
>
  Client Login
</a>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="thrive-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
          }}
          aria-label="Toggle menu"
        >
          <span style={{
            display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2,
            transition: "transform 0.2s",
            transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
          }} />
          <span style={{
            display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2,
            transition: "opacity 0.2s",
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2,
            transition: "transform 0.2s",
            transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
          }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div style={{
        maxHeight: menuOpen ? 400 : 0,
        overflow: "hidden",
        transition: "max-height 0.3s ease",
        background: "rgba(10, 6, 20, 0.97)",
        borderTop: menuOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{ display: "flex", flexDirection: "column", padding: "1rem 1.5rem 1.5rem", gap: "1.25rem" }}>
          {links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "1rem", fontWeight: 500 }}
            >
              {item}
            </a>
          ))}
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              padding: "0.75rem 1.4rem",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            Book a Call
          </a>
          <a
  href="/login"
  onClick={() => setMenuOpen(false)}
  style={{
    display: "block",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "0.75rem 1rem",
    borderRadius: 8,
    background: "#7c3aed",
    border: "none",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
  }}
>
  Client Login
</a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .thrive-desktop-nav { display: none !important; }
          .thrive-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}


// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "8rem 2rem 6rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Glow orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "20%", width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
        filter: "blur(40px)", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%", width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
        filter: "blur(50px)", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 100, padding: "0.4rem 1rem", marginBottom: "2.5rem",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", display: "inline-block", boxShadow: "0 0 8px #a78bfa" }} />
          <span style={{ color: "#c4b5fd", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            AI-Powered Business Automation
          </span>
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(3rem, 7vw, 5.5rem)",
          color: "#fff",
          lineHeight: 1.07,
          letterSpacing: "-0.03em",
          marginBottom: "1.8rem",
          fontWeight: 400,
        }}>
          Your business runs.<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Thrive automates it.
          </span>
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "clamp(1rem, 2vw, 1.2rem)",
          lineHeight: 1.75,
          maxWidth: 620,
          margin: "0 auto 3rem",
        }}>
          We build custom AI automation systems that eliminate manual work, accelerate revenue operations, and scale your team's output — without adding headcount.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#pricing"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              padding: "1rem 2.2rem",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.03em",
              boxShadow: "0 0 40px rgba(124,58,237,0.4)",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "translateY(-2px)"; (e.target as HTMLElement).style.boxShadow = "0 0 60px rgba(124,58,237,0.6)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "none"; (e.target as HTMLElement).style.boxShadow = "0 0 40px rgba(124,58,237,0.4)"; }}
          >
            Book a Free Strategy Call →
          </a>
          <a
            href="#how-it-works"
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.75)",
              padding: "1rem 2rem",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              border: "1px solid rgba(255,255,255,0.12)",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)"; (e.target as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.target as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}
          >
            See How It Works
          </a>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "3rem", justifyContent: "center", marginTop: "4.5rem", flexWrap: "wrap" }}>
          {[["60–80%", "Of service calls go unanswered"], ["$200–$2K", "Lost per missed call"], ["48 hrs", "To go live"], ["163×", "ROI on recovered leads"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2rem", color: "#a78bfa", letterSpacing: "-0.03em" }}>{num}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem ───────────────────────────────────────────────────────────────────
function Problem() {
  const { ref, inView } = useInView();
  return (
    <section id="the-problem" ref={ref} style={{ padding: "7rem 2rem", background: "rgba(12, 8, 30, 0.6)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>The Problem</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em",
            opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)",
            transition: "all 0.7s ease",
          }}>
            Your team is buried in work<br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>that shouldn't require humans.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {[
            { icon: "⏳", title: "Manual data entry", desc: "Hours lost to copy-pasting between systems that should talk to each other automatically." },
            { icon: "📋", title: "Report generation", desc: "Analysts spending weekends compiling dashboards instead of surfacing insights." },
            { icon: "📧", title: "Follow-up sequences", desc: "Leads going cold because no one had bandwidth to send the right email at the right time." },
            { icon: "⚙️", title: "Ops bottlenecks", desc: "Growth stalled because back-office processes weren't built to scale beyond 10 people." },
          ].map(({ icon, title, desc }, i) => (
            <div
              key={title}
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
                borderRadius: 12,
                padding: "2rem",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(30px)",
                transition: `all 0.6s ease ${i * 0.1 + 0.2}s`,
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{icon}</div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.6rem" }}>{title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, inView } = useInView();
  return (
    <section id="how-it-works" ref={ref} style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>The Process</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em",
          }}>
            From kickoff to ROI<br />
            <span style={{ color: "#a78bfa" }}>in under 30 days.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <div
              key={step}
              style={{
                position: "relative",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(30px)",
                transition: `all 0.65s ease ${i * 0.12}s`,
              }}
            >
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "4.5rem",
                color: "rgba(139,92,246,0.12)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                marginBottom: "0.75rem",
                userSelect: "none",
              }}>{step}</div>
              <div style={{
                width: 40, height: 3,
                background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                borderRadius: 2, marginBottom: "1.2rem",
              }} />
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.75rem" }}>{title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  const { ref, inView } = useInView();
  const bars = [62, 78, 55, 90, 83, 71, 95, 68, 88, 76, 92, 85];

  return (
    <section ref={ref} style={{ padding: "5rem 2rem 7rem", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Your Command Center</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "#fff", lineHeight: 1.2, letterSpacing: "-0.025em",
          }}>
            Every automation. One dashboard.
          </h2>
        </div>

        {/* Dashboard Card */}
        <div style={{
          background: "linear-gradient(145deg, rgba(20,12,48,0.95), rgba(12,8,32,0.98))",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 16,
          padding: "1.5rem",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 1px rgba(139,92,246,0.24)",
          opacity: inView ? 1 : 0,
          transform: inView ? "perspective(1200px) rotateX(0deg)" : "perspective(1200px) rotateX(8deg)",
          transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          {/* Window chrome */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1.25rem" }}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "0.2rem 0.75rem", marginLeft: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem" }}>app.Thrive.ai/dashboard</span>
            </div>
          </div>

          {/* Responsive grid — stacks on mobile */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "min(180px, 35%) 1fr",
            gap: "1rem",
          }}>
            {/* Sidebar */}
            <div style={{ background: "rgba(139,92,246,0.05)", borderRadius: 10, padding: "1rem 0.75rem" }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Navigation</div>
              {[["▪", "Overview", true], ["◈", "Workflows", false], ["◎", "Integrations", false], ["⬡", "Analytics", false], ["◇", "Reports", false]].map(([icon, label, active]) => (
                <div key={String(label)} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.45rem 0.6rem", borderRadius: 7,
                  background: active ? "rgba(139,92,246,0.2)" : "transparent",
                  border: active ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                  marginBottom: "0.3rem",
                }}>
                  <span style={{ fontSize: "0.7rem", color: active ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>{String(icon)}</span>
                  <span style={{ fontSize: "0.72rem", color: active ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: active ? 600 : 400 }}>{String(label)}</span>
                </div>
              ))}
              <div style={{ marginTop: "1rem", padding: "0.6rem", background: "rgba(139,92,246,0.08)", borderRadius: 7, border: "1px solid rgba(139,92,246,0.15)" }}>
                <div style={{ fontSize: "0.6rem", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.35rem" }}>LIVE STATUS</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>14 workflows running</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.6rem" }}>
                {[["Hours Saved", "247h", "#22c55e"], ["Tasks Automated", "1,840", "#a78bfa"], ["Cost Reduction", "68%", "#f59e0b"], ["Active Workflows", "14", "#38bdf8"]].map(([label, val, color]) => (
                  <div key={String(label)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "0.65rem 0.75rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>{String(label)}</div>
                    <div style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", fontWeight: 700, color: String(color) }}>{String(val)}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "0.75rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem", fontWeight: 600 }}>Automation Volume</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 60 }}>
                  {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{
                        width: "100%", height: `${h}%`,
                        background: i === bars.length - 1 ? "linear-gradient(180deg, #a855f7, #7c3aed)" : "rgba(139,92,246,0.3)",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 1s ease",
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                  {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                    <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.5rem" }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// ─── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useInView();
  const features = [
    { icon: "⚡", title: "Intelligent Automation", desc: "Smart workflows that handle your repetitive tasks automatically — around the clock, without you lifting a finger." },
    { icon: "🔗", title: "Seamless Integrations", desc: "Connects with the tools you already use — CRMs, scheduling software, email, and more. No technical headaches." },
    { icon: "📊", title: "ROI Attribution", desc: "Every workflow is tracked to a dollar figure. Know exactly what automation is worth." },
    { icon: "🛡️", title: "Secure by Default", desc: "Your data is encrypted in transit and at rest. Access controls keep the right people in and everyone else out." },
    { icon: "🔄", title: "Self-Healing Workflows", desc: "When something breaks or changes, our systems detect and recover automatically — no manual debugging." },
    { icon: "📈", title: "Compound Scaling", desc: "Each new workflow leverages existing infrastructure. Your automation ROI compounds over time." },
  ];

  return (
    <section ref={ref} style={{ padding: "7rem 2rem", background: "rgba(12, 8, 30, 0.5)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Capabilities</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em",
          }}>
            Built for the way<br />
            <span style={{ color: "#a78bfa" }}>modern businesses operate.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {features.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              style={{
                padding: "2rem",
                borderRadius: 12,
                border: "1px solid rgba(139,92,246,0.12)",
                background: "rgba(139,92,246,0.04)",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(20px)",
                transition: `all 0.55s ease ${i * 0.08}s`,
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.4)";
                (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.09)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.12)";
                (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.04)";
              }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>{icon}</div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.65rem" }}>{title}</h3>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.88rem", lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Industries ─────────────────────────────────────────────────────────────────
function Industries() {
  const { ref, inView } = useInView();
  return (
    <section id="industries" ref={ref} style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Industries</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em",
          }}>
            Automation that speaks<br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>your industry's language.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {INDUSTRIES.map(({ icon, label, stat }, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                padding: "1.5rem 1.75rem",
                borderRadius: 12,
                border: "1px solid rgba(139,92,246,0.15)",
                background: "rgba(139,92,246,0.05)",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateX(-20px)",
                transition: `all 0.55s ease ${i * 0.07}s`,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", flexShrink: 0,
              }}>{icon}</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: 3 }}>{label}</div>
                <div style={{ color: "#a78bfa", fontSize: "0.78rem", fontWeight: 600 }}>{stat}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ROI Calculator ────────────────────────────────────────────────────────────
const ROI_CARDS = [
  {
    industry: "Power Washing",
    icon: "💧",
    missedCalls: 5,
    avgJobValue: 400,
    weeklyLost: 2000,
    annualLost: 104000,
    ThriveCost: 4764,
    roi: "21×",
    roiNum: 21,
    color: "#60a5fa",
  },
  {
    industry: "Landscaping",
    icon: "🌿",
    missedCalls: 4,
    avgJobValue: 600,
    weeklyLost: 2400,
    annualLost: 124800,
    ThriveCost: 4764,
    roi: "26×",
    roiNum: 26,
    color: "#a78bfa",
    highlighted: true,
  },
  {
    industry: "Roofing",
    icon: "🏠",
    missedCalls: 3,
    avgJobValue: 5000,
    weeklyLost: 15000,
    annualLost: 780000,
    ThriveCost: 4764,
    roi: "163×",
    roiNum: 163,
    color: "#e879f9",
  },
];

function ROICalculator() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} style={{ padding: "7rem 2rem", background: "rgba(12, 8, 30, 0.5)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>The Numbers</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em",
          }}>
            The math is simple.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", marginTop: "1rem", lineHeight: 1.7 }}>
            Every missed call is a job that goes to your competitor.<br />Here's what that costs — and what it costs to fix it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "stretch" }}>
          {ROI_CARDS.map(({ industry, icon, missedCalls, avgJobValue, annualLost, ThriveCost, roi, roiNum, color, highlighted }, i) => (
            <div
              key={industry}
              style={{
                borderRadius: 16,
                border: highlighted ? "1px solid rgba(139,92,246,0.45)" : "1px solid rgba(139,92,246,0.15)",
                background: highlighted
                  ? "linear-gradient(160deg, rgba(124,58,237,0.18), rgba(10,6,24,0.9))"
                  : "linear-gradient(160deg, rgba(20,12,48,0.7), rgba(10,6,24,0.85))",
                boxShadow: highlighted ? "0 0 60px rgba(124,58,237,0.18)" : "none",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(28px)",
                transition: `all 0.65s ease ${i * 0.12}s`,
              }}
            >
              {/* Card header */}
              <div style={{ padding: "1.75rem 2rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{industry}</span>
                </div>
                {/* ROI badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: `rgba(${color === "#60a5fa" ? "96,165,250" : color === "#a78bfa" ? "167,139,250" : "232,121,249"},0.15)`,
                  border: `1px solid ${color}40`,
                  borderRadius: 100, padding: "0.4rem 1rem", marginTop: "0.5rem",
                }}>
                  <span style={{ color, fontWeight: 900, fontSize: "1.4rem", fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}>{roi}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", letterSpacing: "0.06em" }}>return on investment</span>
                </div>
              </div>

              {/* Math breakdown */}
              <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                {/* Missed calls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Missed calls / week</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>{missedCalls} calls</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Avg. job value</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>${avgJobValue.toLocaleString()}</div>
                  </div>
                </div>

                {/* Divider with formula */}
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.9rem 1rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>{missedCalls} calls × ${avgJobValue.toLocaleString()} × 52 weeks</span>
                </div>

                {/* Annual lost */}
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "1rem 1.25rem" }}>
                  <div style={{ color: "rgba(239,68,68,0.7)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Revenue lost per year</div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2rem", color: "#fca5a5", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    ${annualLost.toLocaleString()}
                  </div>
                </div>

                {/* Thrive cost */}
                <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "1rem 1.25rem" }}>
                  <div style={{ color: "rgba(167,139,250,0.7)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Thrive annual cost</div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2rem", color: "#a78bfa", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    ${ThriveCost.toLocaleString()}
                  </div>
                </div>

                {/* ROI bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>ROI multiplier</span>
                    <span style={{ color, fontWeight: 800, fontSize: "0.85rem" }}>{roi}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: inView ? `${Math.min((roiNum / 163) * 100, 100)}%` : "0%",
                      background: `linear-gradient(90deg, #7c3aed, ${color})`,
                      borderRadius: 3,
                      transition: `width 1.2s ease ${i * 0.15 + 0.4}s`,
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", marginTop: "2rem" }}>
          Based on industry averages. Thrive cost reflects the Growth plan at $397/month billed annually.
        </p>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, inView } = useInView();
  return (
    <section id="pricing" ref={ref} style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Pricing</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em",
          }}>
            Invest in automation.<br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>Watch your costs shrink.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
          {PRICING.map(({ name, price, period, description, features, cta, highlighted, badge }, i) => (
            <div
              key={name}
              style={{
                padding: "2.25rem",
                borderRadius: 16,
                border: highlighted ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(139,92,246,0.15)",
                background: highlighted
                  ? "linear-gradient(145deg, rgba(124,58,237,0.18), rgba(168,85,247,0.08))"
                  : "rgba(139,92,246,0.04)",
                position: "relative",
                boxShadow: highlighted ? "0 0 60px rgba(124,58,237,0.2)" : "none",
                opacity: inView ? 1 : 0,
                transform: inView ? (highlighted ? "scale(1.02)" : "none") : "translateY(24px)",
                transition: `all 0.65s ease ${i * 0.1}s`,
              }}
            >
              {badge && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#fff", padding: "0.3rem 1rem", borderRadius: 100,
                  fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>{badge}</div>
              )}

              <div style={{ marginBottom: "0.35rem", color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.75rem" }}>
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2.6rem", color: "#fff", lineHeight: 1 }}>{price}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>{period}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1.75rem" }}>{description}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
                {features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      background: highlighted ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "#a78bfa", fontSize: "0.6rem" }}>✓</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem" }}>{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="#cta"
                style={{
                  display: "block", textAlign: "center",
                  padding: "0.9rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 700, fontSize: "0.88rem",
                  background: highlighted ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
                  color: highlighted ? "#fff" : "rgba(255,255,255,0.6)",
                  border: highlighted ? "none" : "1px solid rgba(255,255,255,0.15)",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (highlighted) { el.style.opacity = "0.85"; }
                  else { el.style.borderColor = "rgba(139,92,246,0.5)"; el.style.color = "#a78bfa"; }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.opacity = "1";
                  el.style.borderColor = "rgba(255,255,255,0.15)";
                  el.style.color = highlighted ? "#fff" : "rgba(255,255,255,0.6)";
                }}
              >
                {cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  const { ref, inView } = useInView();
  return (
    <section id="cta" ref={ref} style={{ padding: "7rem 2rem 8rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(145deg, rgba(124,58,237,0.18), rgba(20,12,48,0.8))",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 24,
          padding: "4.5rem 3rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(124,58,237,0.15)",
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(30px)",
          transition: "all 0.8s ease",
        }}>
          <div style={{
            position: "absolute", top: "-40%", right: "-20%", width: 400, height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
            filter: "blur(40px)", zIndex: 0,
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "#a78bfa", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Ready to Thrive?</p>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
            }}>
              Stop managing work.<br />
              Start automating it.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", lineHeight: 1.75, maxWidth: 500, margin: "0 auto 2.5rem" }}>
              Book a free 45-minute strategy call. We'll map your highest-impact automation opportunities — no obligation, no sales pressure.
            </p>
            <a
              href="mailto:hello@Thriveautomation.ai"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
                padding: "1.1rem 2.8rem",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "0.02em",
                boxShadow: "0 0 50px rgba(124,58,237,0.45)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 80px rgba(124,58,237,0.65)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(124,58,237,0.45)"; }}
            >
              Book Your Free Strategy Call →
            </a>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", marginTop: "1.25rem" }}>
              Typically respond within 2 business hours · hello@Thriveautomation.ai
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(139,92,246,0.12)",
      padding: "2.5rem 2rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: "1rem",
      maxWidth: 1100, margin: "0 auto",
    }}>
      <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.2rem", color: "#fff" }}>
        Thrive<span style={{ color: "#a78bfa" }}>.</span>
      </span>
      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
        © 2025 Thrive Automation Agency. All rights reserved.
      </span>
      <div style={{ display: "flex", gap: "2rem" }}>
        {["Privacy", "Terms", "Contact"].map((l) => (
          <a key={l} href="#" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "0.78rem", transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#a78bfa")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ThriveAgencyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #080612;
          color: #fff;
          font-family: 'DM Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080612; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 3px; }
      `}</style>

      <div style={{ background: "#080612", minHeight: "100vh" }}>
        <Navbar />
        <Hero />
        <Problem />
        <HowItWorks />
        <DashboardMockup />
        <Features />
        <Industries />
        <ROICalculator />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </>
  );
}