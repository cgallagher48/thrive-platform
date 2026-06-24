'use client'
import { useState, useEffect, useRef } from 'react'

function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: { x: number; y: number; r: number; o: number; speed: number }[] = []
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2,
        o: Math.random() * 0.7 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
      })
    }

    let frame = 0
    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      stars.forEach((s, i) => {
        const flicker = s.o + Math.sin(frame * s.speed + i) * 0.15
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,' + flicker + ')'
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.9s ease ' + delay + 'ms, transform 0.9s ease ' + delay + 'ms',
      ...style
    }}>
      {children}
    </div>
  )
}

const SYSTEMS = [
  { name: 'Lead Capture AI', desc: 'Every missed call answered instantly. Every form filled. Every lead logged and responded to within 4 minutes.', stat: '98%', label: 'capture rate' },
  { name: 'Follow-Up Engine', desc: 'Automated sequences that nurture leads through SMS, email, and voicemail until they book or opt out.', stat: '4 min', label: 'avg response' },
  { name: 'Appointment Booking', desc: 'AI qualifies the lead and drops the appointment directly onto your calendar. No back and forth.', stat: '72%', label: 'book rate' },
  { name: 'Job Coordination', desc: 'From booked to invoiced. Crew scheduling, customer updates, and job status tracked automatically.', stat: '96%', label: 'completion rate' },
  { name: 'Invoice & Collection', desc: 'Invoices sent on job completion. Automated reminders until paid. Revenue in your account faster.', stat: '94%', label: 'paid on time' },
  { name: 'Reputation Manager', desc: 'Review requests sent automatically after every job. 5-star pipeline built on autopilot.', stat: '4.9x', label: 'avg review lift' },
]

const INDUSTRIES = ['Roofing', 'Masonry', 'Insurance', 'HVAC', 'Landscaping', 'Power Washing', 'Construction', 'Plumbing']

export default function Page() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div style={{ background: '#080808', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", overflowX: 'hidden' }}>

      {mounted && <Stars />}

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #5b21b6)', boxShadow: '0 0 14px rgba(139,92,246,0.8)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Systems', 'Industries', 'Results'].map(s => (
            <a key={s} href={'#' + s.toLowerCase()} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              {s}
            </a>
          ))}
        </div>
        <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '0.5rem 1.2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)' }}>
          Book a Call
        </a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8rem 2rem 4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(139,92,246,0.8)', fontWeight: 600, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          Intelligent Operations Automations
        </div>
        <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: 900, margin: '0 auto 1.5rem' }}>
          Your business runs.<br />
          <span style={{ background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Even when you don't.
          </span>
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.4)', maxWidth: 560, lineHeight: 1.7, marginBottom: '3rem' }}>
          We build custom AI automation systems for service businesses. Leads captured, follow-ups sent, appointments booked -- all without lifting a finger.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
            style={{ background: '#7c3aed', color: 'white', padding: '0.9rem 2.2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', boxShadow: '0 0 40px rgba(124,58,237,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.4)' }}>
            Get a Free Systems Audit
          </a>
          <a href="#systems"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '0.9rem 2.2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
            See the Systems
          </a>
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'flex', gap: '3rem', marginTop: '6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['98%', 'Lead capture rate'], ['4 min', 'Avg response time'], ['163x', 'Roofing ROI'], ['$284K', 'Revenue recovered']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#c4b5fd', letterSpacing: '-0.02em' }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', margin: '0 4rem', position: 'relative', zIndex: 1 }} />

      {/* SYSTEMS */}
      <section id="systems" style={{ padding: '8rem 2.5rem', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(139,92,246,0.7)', fontWeight: 600, marginBottom: '1rem' }}>WHAT WE BUILD</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Six systems.<br />One complete operation.
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {SYSTEMS.map((s, i) => (
            <FadeIn key={s.name} delay={i * 80}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '2rem', transition: 'all 0.3s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.05em' }}>{s.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a78bfa', lineHeight: 1 }}>{s.stat}</div>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{s.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', margin: '0 4rem', position: 'relative', zIndex: 1 }} />

      {/* INDUSTRIES */}
      <section id="industries" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <FadeIn>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(139,92,246,0.7)', fontWeight: 600, marginBottom: '1rem' }}>WHO WE WORK WITH</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '3rem' }}>Built for service businesses.</h2>
        </FadeIn>
        <FadeIn delay={200}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
            {INDUSTRIES.map(ind => (
              <div key={ind} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '0.6rem 1.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {ind}
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* DIVIDER */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', margin: '0 4rem', position: 'relative', zIndex: 1 }} />

      {/* RESULTS */}
      <section id="results" style={{ padding: '8rem 2.5rem', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(139,92,246,0.7)', fontWeight: 600, marginBottom: '1rem' }}>THE MATH</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>What this is actually worth.</h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {[
            { industry: 'Roofing', roi: '163x', detail: 'One recovered job covers months of system cost.' },
            { industry: 'Landscaping', roi: '26x', detail: 'Recurring contracts booked without chasing leads.' },
            { industry: 'Power Washing', roi: '21x', detail: 'Every missed call becomes a potential $800 job.' },
          ].map((r, i) => (
            <FadeIn key={r.industry} delay={i * 100}>
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>{r.industry}</div>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#a78bfa', letterSpacing: '-0.03em', lineHeight: 1 }}>{r.roi}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', marginBottom: '1rem' }}>return on investment</div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{r.detail}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '8rem 2.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(139,92,246,0.7)', fontWeight: 600, marginBottom: '1.5rem' }}>GET STARTED</div>
            <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.5rem' }}>
              Ready to stop<br />leaking revenue?
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Book a free 30-minute systems audit. We'll show you exactly where your business is losing money and how to fix it.
            </p>
            <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#7c3aed', color: 'white', padding: '1rem 2.8rem', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', boxShadow: '0 0 60px rgba(124,58,237,0.5)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.boxShadow = '0 0 80px rgba(124,58,237,0.7)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.5)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Book Your Free Audit
            </a>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #5b21b6)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>THRIVE</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Intelligent Operations Automations</div>
        <a href="mailto:casey.gallagher@thriveautomation.agency" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>casey.gallagher@thriveautomation.agency</a>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080808; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }
      `}</style>
    </div>
  )
}
