"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === "demo@thrive.ai" && password === "thrive2026") {
        router.push("/dashboard");
      } else {
        setError("Invalid email or password.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
 <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>  
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #080518 0%, #0d0920 50%, #080518 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
            Thrive <span style={{ color: "#a78bfa" }}>.</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Client Portal</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>Welcome back</h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: "2rem" }}>Sign in to your dashboard</p>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#f87171" }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin}
            style={{ width: "100%", background: loading ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: 8, padding: "0.85rem", fontSize: "0.95rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "rgba(139,92,246,0.08)", borderRadius: 8, border: "1px solid rgba(139,92,246,0.15)" }}>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem" }}>DEMO CREDENTIALS</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>demo@thrive.ai / thrive2026</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Back to Thrive</a>
        </div>
      </div>

      {/* Secret ops access — only Casey knows */}
      <a href="/ops" style={{ position: "fixed", bottom: 16, right: 16, fontSize: "0.7rem", color: "rgba(255,255,255,0.08)", textDecoration: "none", userSelect: "none" }}>⚡</a>
    </div>
  );
}