'use client'
import { useState, useEffect, useCallback } from 'react'

const LEFT_LABELS = ['MISSED CALL', 'LOST LEAD', 'NO FOLLOW-UP', 'MISSED OPPORTUNITY', 'NO RESPONSE']
const LEFT_VALUES = ['-$4,200', '-$1,800', '-$3,100', '-$6,400', '-$2,900']
const RIGHT_LABELS = ['LEAD CAPTURED', 'FOLLOW-UP SENT', 'APPOINTMENT BOOKED', 'JOB CONFIRMED', 'REVENUE SECURED']
const RIGHT_VALUES = ['+$4,200', 'AI Agent Active', 'On Calendar', 'Scheduled', '+$4,200']

const TOTAL_FRAMES = 242

function FramePlayer({ scrollDepth }: { scrollDepth: number }) {
  const frameIndex = Math.min(Math.floor(scrollDepth * (TOTAL_FRAMES - 1)) + 1, TOTAL_FRAMES)
  const padded = String(frameIndex).padStart(4, '0')
  const src = '/frames/frame_' + padded + '.jpg'
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <img src={src} alt="ATLAS" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(1,0,8,0.05) 0%, rgba(1,0,8,0.82) 100%)', pointerEvents: 'none' }} />
    </div>
  )
}

function LeftPanel({ scrollDepth }: { scrollDepth: number }) {
  const activeLanes = Math.min(Math.floor(scrollDepth * 6) + 1, 5)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ position: 'fixed', left: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ fontSize: '0.52rem', letterSpacing: '0.25em', color: 'rgba(239,68,68,0.5)', fontWeight: 700, marginBottom: '0.5rem' }}>THE PROBLEM</div>
      <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'white', marginBottom: '0.4rem', maxWidth: 220 }}>Most businesses<br />leak revenue<br />every day.</h1>
      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, maxWidth: 200, marginBottom: '1rem' }}>Missed calls. Lost leads.<br />Slow follow-up. Manual work.<br />Revenue slips through the cracks.</p>
      {LEFT_LABELS.slice(0, activeLanes).map((label, i) => (
        <div key={i} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '2px solid #ef4444', borderRadius: 6, padding: '0.4rem 0.65rem', opacity: 0.5 + (i === (tick % activeLanes) ? 0.5 : 0), transition: 'opacity 0.5s' }}>
          <div style={{ fontSize: '0.58rem', color: 'rgba(239,68,68,0.7)', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</div>
          <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)' }}>No answer</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FCA5A5', marginTop: '0.1rem' }}>{LEFT_VALUES[i]}</div>
          <div style={{ fontSize: '0.46rem', color: 'rgba(255,255,255,0.2)' }}>Revenue lost</div>
        </div>
      ))}
    </div>
  )
}

function RightPanel({ scrollDepth }: { scrollDepth: number }) {
  const activeLanes = Math.min(Math.floor(scrollDepth * 6) + 1, 5)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ position: 'fixed', right: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
      <div style={{ fontSize: '0.52rem', letterSpacing: '0.25em', color: 'rgba(16,185,129,0.5)', fontWeight: 700, marginBottom: '0.5rem' }}>ATLAS RESPONSE</div>
      {RIGHT_LABELS.slice(0, activeLanes).map((label, i) => (
        <div key={i} style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRight: '2px solid #10b981', borderRadius: 6, padding: '0.4rem 0.65rem', textAlign: 'right', opacity: 0.5 + (i === (tick % activeLanes) ? 0.5 : 0), transition: 'opacity 0.5s' }}>
          <div style={{ fontSize: '0.58rem', color: 'rgba(16,185,129,0.7)', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</div>
          <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)' }}>{i === 0 ? 'AI agent active' : i === 1 ? '4 min response' : i === 2 ? 'On calendar' : i === 3 ? 'Scheduled' : 'Collected'}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#6EE7B7', marginTop: '0.1rem' }}>{RIGHT_VALUES[i]}</div>
        </div>
      ))}
      {scrollDepth > 0.7 && (
        <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer" style={{ marginTop: '1rem', display: 'inline-block', background: 'linear-gradient(135deg,#10b981,#3B0F8C)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: '0.7rem', boxShadow: '0 0 30px rgba(16,185,129,0.2)', letterSpacing: '0.1em', textAlign: 'center' }}>LAUNCH THRIVE -&gt;</a>
      )}
    </div>
  )
}

function CenterLabel({ scrollDepth }: { scrollDepth: number }) {
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
      <div style={{ fontSize: '0.42rem', letterSpacing: '0.35em', color: 'rgba(196,181,253,0.3)', fontWeight: 700, marginBottom: '0.3rem' }}>{scrollDepth < 0.2 ? 'DORMANT' : scrollDepth < 0.4 ? 'ACTIVATING' : scrollDepth < 0.6 ? 'AWARE' : scrollDepth < 0.8 ? 'INTELLIGENT' : 'FULL COMMAND'}</div>
      <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.45em', color: 'rgba(167,139,250,0.4)', textShadow: '0 0 20px rgba(167,139,250,0.3)' }}>ATLAS</div>
    </div>
  )
}

function BottomTicker() {
  const [counts, setCounts] = useState({ calls: 2847, leads: 1246, appts: 892, jobs: 847, invoices: 801, revenue: 284600 })
  useEffect(() => {
    const id = setInterval(() => {
      setCounts(c => ({ calls: c.calls + Math.floor(Math.random() * 3), leads: c.leads + (Math.random() > 0.7 ? 1 : 0), appts: c.appts + (Math.random() > 0.8 ? 1 : 0), jobs: c.jobs + (Math.random() > 0.85 ? 1 : 0), invoices: c.invoices + (Math.random() > 0.85 ? 1 : 0), revenue: c.revenue + Math.floor(Math.random() * 200) }))
    }, 1800)
    return () => clearInterval(id)
  }, [])
  const metrics = [
    { label: 'CALLS', value: 'Captured 98%', sub: counts.calls.toLocaleString() },
    { label: 'LEADS', value: 'Responded 4 min', sub: counts.leads.toLocaleString() },
    { label: 'APPOINTMENTS', value: 'Booked 72%', sub: counts.appts.toLocaleString() },
    { label: 'JOBS', value: 'Completed 96%', sub: counts.jobs.toLocaleString() },
    { label: 'INVOICES', value: 'Paid 94%', sub: counts.invoices.toLocaleString() },
    { label: 'REVENUE', value: '+$' + counts.revenue.toLocaleString(), sub: 'This month' },
    { label: 'ATLAS', value: 'Always On', sub: '99.9% uptime' },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(1,0,8,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(109,40,217,0.1)', padding: '0.6rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
      {metrics.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <div>
            <div style={{ fontSize: '0.44rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: '0.6rem', color: i === 5 ? '#10b981' : i === 6 ? '#A78BFA' : 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{m.value}</div>
            <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.25)' }}>{m.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ts = [setTimeout(() => setStep(1), 1200), setTimeout(() => setStep(2), 2000), setTimeout(() => setStep(3), 4200), setTimeout(() => setStep(4), 5800), setTimeout(() => setStep(5), 7200), setTimeout(() => setStep(6), 8600)]
    return () => ts.forEach(clearTimeout)
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: step >= 6 ? 'all' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#010006', opacity: step >= 3 ? 0 : 1, transition: 'opacity 2.8s ease', pointerEvents: 'none' }} />
      {step >= 1 && <div style={{ position: 'absolute', width: step >= 2 ? 200 : 3, height: step >= 2 ? 200 : 3, borderRadius: '50%', background: 'radial-gradient(circle,#fff,#A78BFA 30%,transparent 70%)', opacity: step >= 3 ? 0 : 1, transition: 'all 2.5s cubic-bezier(0.16,1,0.3,1),opacity 1.5s ease 2s', boxShadow: '0 0 100px rgba(167,139,250,0.9)', pointerEvents: 'none' }} />}
      {step >= 4 && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'clamp(1rem,3.5vw,1.8rem)', fontWeight: 900, letterSpacing: '0.65em', color: 'rgba(255,255,255,0.92)', textShadow: '0 0 60px rgba(167,139,250,0.7)', marginBottom: '0.5rem', paddingLeft: '0.65em' }}>THRIVE</div>
          {step >= 5 && <div style={{ fontSize: '0.55rem', letterSpacing: '0.28em', color: 'rgba(196,181,253,0.4)', fontWeight: 600, marginBottom: '2.5rem', paddingLeft: '0.28em' }}>INTELLIGENT OPERATIONS AUTOMATIONS</div>}
          {step >= 6 && <button onClick={onDone} style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: 'rgba(196,181,253,0.7)', padding: '0.75rem 2rem', borderRadius: 7, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', cursor: 'pointer' }}>ENTER THE COMMAND CENTER</button>}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [scrollDepth, setScrollDepth] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!localStorage.getItem('thriveIntroSeen')) setShowIntro(true)
  }, [])

  const doneIntro = useCallback(() => {
    localStorage.setItem('thriveIntroSeen', 'true')
    setShowIntro(false)
  }, [])

  useEffect(() => {
    const fn = () => {
      const p = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight || 1), 1)
      setScrollDepth(p)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: '#010006', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
      {mounted && <FramePlayer scrollDepth={scrollDepth} />}
      {showIntro && <Intro onDone={doneIntro} />}
      {!showIntro && (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.65rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(1,0,6,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(109,40,217,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#DDD6FE,#4C1D95)', boxShadow: '0 0 10px rgba(109,40,217,0.9)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.22em' }}>THRIVE</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['THE PROBLEM','ATLAS','THE SOLUTION','SYSTEMS','LAUNCH'].map((s, i) => (
              <button key={i} onClick={() => window.scrollTo({ top: (i/4)*(document.body.scrollHeight-window.innerHeight), behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer', padding: '0.2rem 0.4rem' }}>{s}</button>
            ))}
          </div>
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(76,29,149,0.35)', border: '1px solid rgba(109,40,217,0.3)', color: 'rgba(196,181,253,0.8)', padding: '0.38rem 0.8rem', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em' }}>LAUNCH CALL</a>
        </nav>
      )}
      <div style={{ height: '500vh' }} />
      {!showIntro && (
        <>
          <LeftPanel scrollDepth={scrollDepth} />
          <CenterLabel scrollDepth={scrollDepth} />
          <RightPanel scrollDepth={scrollDepth} />
          <BottomTicker />
        </>
      )}
      {!showIntro && (
        <button onClick={() => { localStorage.removeItem('thriveIntroSeen'); setShowIntro(true) }} style={{ position: 'fixed', bottom: '3.5rem', right: '0.8rem', zIndex: 50, background: 'rgba(1,0,8,0.5)', border: '1px solid rgba(109,40,217,0.08)', borderRadius: 4, padding: '0.2rem 0.4rem', color: 'rgba(255,255,255,0.08)', fontSize: '0.38rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>REPLAY INTRO</button>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#010006;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        ::-webkit-scrollbar{width:2px}
        ::-webkit-scrollbar-track{background:#010006}
        ::-webkit-scrollbar-thumb{background:rgba(109,40,217,0.12);border-radius:1px}
      `}</style>
    </div>
  )
}
