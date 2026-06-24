'use client'
import { useState, useEffect, useRef } from 'react'

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function FadeUp({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease ' + delay + 'ms, transform 0.7s ease ' + delay + 'ms', ...style }}>
      {children}
    </div>
  )
}

function LeadCaptureUI() {
  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 2200); return () => clearInterval(id) }, [])
  const calls = [
    { name: 'John Marchetti', src: 'Missed Call', response: 'AI responded in 38s', time: '2:14 AM', status: 'Captured' },
    { name: 'Sarah Kowalski', src: 'Web Form', response: 'Appointment booked', time: '7:02 AM', status: 'Booked' },
    { name: 'Mike Torres', src: 'Missed Call', response: 'Follow-up scheduled', time: '11:45 AM', status: 'Captured' },
    { name: 'David Reynolds', src: 'Missed Call', response: 'Quote sent via SMS', time: '3:30 PM', status: 'Captured' },
    { name: 'Linda Park', src: 'Web Form', response: 'Appointment booked', time: '5:12 PM', status: 'Booked' },
  ]
  const active = tick % calls.length
  return (
    <div style={{ background: '#0c0c0e', fontFamily: 'inherit', width: '100%' }}>
      <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        </div>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginLeft: '0.25rem' }}>ATLAS -- Lead Operations</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
          <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>Live</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 360 }}>
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0' }}>
          <div style={{ padding: '0.25rem 1rem', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>INCOMING</div>
          {calls.map((c, i) => (
            <div key={i} onClick={() => setTick(i)} style={{ padding: '0.55rem 1rem', cursor: 'pointer', background: active === i ? 'rgba(139,92,246,0.08)' : 'transparent', borderLeft: active === i ? '2px solid #7c3aed' : '2px solid transparent', transition: 'all 0.3s' }}>
              <div style={{ fontSize: '0.68rem', color: active === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)', fontWeight: active === i ? 600 : 400 }}>{c.name}</div>
              <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.1rem' }}>{c.src} -- {c.time}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LEAD DETAIL</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '0.2rem' }}>{calls[active].name}</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{calls[active].status}</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{calls[active].src}</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>ACTIVITY</div>
            {[
              { msg: 'Lead entered ATLAS system', time: 'just now', accent: false },
              { msg: calls[active].response, time: '38s later', accent: true },
              { msg: 'Lead tagged and routed to pipeline', time: '1 min', accent: false },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.accent ? '#a78bfa' : 'rgba(255,255,255,0.15)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: a.accent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)' }}>{a.msg}</div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.1rem' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 8, padding: '0.75rem 1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.2rem' }}>ATLAS response time</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em' }}>38 seconds</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FollowUpUI() {
  return (
    <div style={{ background: '#0c0c0e', fontFamily: 'inherit', width: '100%' }}>
      <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        </div>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginLeft: '0.25rem' }}>ATLAS -- Follow-Up Sequence</span>
      </div>
      <div style={{ padding: '1.5rem', minHeight: 360 }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>ACTIVE SEQUENCE -- JOHN MARCHETTI</div>
        {[
          { step: '01', label: 'Lead enters system', detail: 'Missed call logged automatically', time: '0:00', done: true, type: 'system' },
          { step: '02', label: 'Intro SMS sent', detail: '"Hi John, this is ATLAS from Apex Roofing..."', time: '0:38', done: true, type: 'sms' },
          { step: '03', label: 'Qualification sent', detail: '"What type of roofing issue are you experiencing?"', time: '1:12', done: true, type: 'sms' },
          { step: '04', label: 'Booking link delivered', detail: 'Calendly link sent with available slots', time: '3:54', done: true, type: 'sms' },
          { step: '05', label: 'Appointment confirmed', detail: 'Tuesday, June 25 at 10:00 AM', time: '4:02', done: true, type: 'booked' },
          { step: '06', label: 'Reminder sequence starts', detail: '24hr and 1hr reminders scheduled', time: 'Queued', done: false, type: 'queued' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.done ? (s.type === 'booked' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.12)') : 'rgba(255,255,255,0.04)', border: '1px solid ' + (s.done ? (s.type === 'booked' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.25)') : 'rgba(255,255,255,0.08)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.5rem', color: s.done ? (s.type === 'booked' ? '#10b981' : '#a78bfa') : 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{s.step}</span>
              </div>
              {i < 5 && <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.05)', marginTop: 2 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: s.done ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: '0.55rem', color: s.type === 'booked' ? '#10b981' : s.done ? '#a78bfa' : 'rgba(255,255,255,0.15)' }}>{s.time}</div>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)', marginTop: '0.15rem', fontStyle: s.type === 'sms' ? 'italic' : 'normal' }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RevenueUI() {
  const [rev, setRev] = useState(284600)
  useEffect(() => { const id = setInterval(() => setRev(r => r + Math.floor(Math.random() * 350 + 80)), 2400); return () => clearInterval(id) }, [])
  const jobs = [
    { name: 'Johnson Roofing -- Full tear-off and replacement', amount: 14200, status: 'Paid', days: 0 },
    { name: 'Metro HVAC -- Complete system install', amount: 8400, status: 'Paid', days: 1 },
    { name: 'Williams Masonry -- Patio and walkway', amount: 6100, status: 'Pending', days: 2 },
    { name: 'Lakeside Power Wash -- Commercial lot', amount: 2800, status: 'Paid', days: 2 },
    { name: 'Apex Insurance -- Water damage claim', amount: 11200, status: 'In Review', days: 3 },
  ]
  return (
    <div style={{ background: '#0c0c0e', fontFamily: 'inherit', width: '100%' }}>
      <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        </div>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginLeft: '0.25rem' }}>ATLAS -- Revenue Operations</span>
      </div>
      <div style={{ padding: '1.5rem', minHeight: 360 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {[
            { label: 'RECOVERED THIS MONTH', value: '$' + rev.toLocaleString(), color: '#10b981' },
            { label: 'INVOICES SENT', value: '47', color: 'rgba(255,255,255,0.75)' },
            { label: 'PAID ON TIME', value: '94%', color: '#a78bfa' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#0c0c0e', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>{m.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color, letterSpacing: '-0.02em', transition: 'all 0.5s' }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>RECENT INVOICES</div>
        {jobs.map((j, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < jobs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ flex: 1, fontSize: '0.65rem', color: 'rgba(255,255,255,0.42)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>{j.name}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginRight: '0.75rem', flexShrink: 0 }}>{'$' + j.amount.toLocaleString()}</div>
            <div style={{ fontSize: '0.55rem', color: j.status === 'Paid' ? '#10b981' : j.status === 'Pending' ? '#f59e0b' : 'rgba(255,255,255,0.25)', background: j.status === 'Paid' ? 'rgba(16,185,129,0.08)' : j.status === 'Pending' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)', padding: '0.15rem 0.5rem', borderRadius: 4, flexShrink: 0 }}>{j.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SECTIONS = [
  {
    num: '1.0',
    headline: 'Never miss another lead.',
    body: 'ATLAS answers every missed call, web form, and message within 60 seconds. Every lead is logged, qualified, and responded to -- automatically, even at 2 AM.',
    label: 'Lead Capture',
    subs: [['1.1', 'Missed Call AI'], ['1.2', 'Web Form Routing'], ['1.3', 'SMS Response'], ['1.4', 'Lead Qualification']],
    UI: LeadCaptureUI,
  },
  {
    num: '2.0',
    headline: 'From lead to booked in under 5 minutes.',
    body: 'Automated sequences qualify prospects and drop appointments directly onto your calendar. No back and forth. No chasing. No manual work.',
    label: 'Follow-Up Engine',
    subs: [['2.1', 'SMS Sequences'], ['2.2', 'Email Automation'], ['2.3', 'Appointment Booking'], ['2.4', 'CRM Sync']],
    UI: FollowUpUI,
  },
  {
    num: '3.0',
    headline: 'Collect every dollar you have earned.',
    body: 'Invoices sent automatically on job completion. Payment reminders until collected. Every dollar tracked and surfaced so nothing slips through.',
    label: 'Revenue Operations',
    subs: [['3.1', 'Auto Invoicing'], ['3.2', 'Payment Reminders'], ['3.3', 'Revenue Tracking'], ['3.4', 'Review Generation']],
    UI: RevenueUI,
  },
]

export default function Page() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div style={{ background: '#08090a', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 56, padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,9,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #5b21b6)', boxShadow: '0 0 12px rgba(139,92,246,0.7)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.16em' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          {['Systems', 'Industries', 'Results'].map(s => (
            <a key={s} href={'#' + s.toLowerCase()} style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>{s}</a>
          ))}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
            style={{ background: '#fff', color: '#08090a', padding: '0.42rem 1.1rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Sign up
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '180px 3rem 120px', textAlign: 'center' }}>
        {mounted && (
          <>
            <FadeUp>
              <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.95)' }}>
                The automation system<br />for service businesses.
              </h1>
            </FadeUp>
            <FadeUp delay={120}>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.18rem)', color: 'rgba(255,255,255,0.36)', lineHeight: 1.72, maxWidth: 560, margin: '0 auto 2.5rem' }}>
                Purpose-built for roofing, HVAC, masonry, and contracting. Designed to capture every lead, book every appointment, and collect every dollar -- without hiring anyone.
              </p>
            </FadeUp>
            <FadeUp delay={240}>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                  style={{ background: '#fff', color: '#08090a', padding: '0.8rem 2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
                  Get a Free Audit
                </a>
                <a href="#systems" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)', padding: '0.8rem 2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: '0.88rem' }}>
                  See the systems
                </a>
              </div>
            </FadeUp>
          </>
        )}
      </section>

      {/* STATS */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 3rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          {[['98%', 'Lead capture rate'], ['4 min', 'Avg response time'], ['163x', 'Roofing ROI'], ['$284K+', 'Revenue recovered'], ['94%', 'Invoices paid on time']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.025em' }}>{v}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)', marginTop: '0.2rem', letterSpacing: '0.06em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE SECTIONS */}
      <div id="systems">
        {SECTIONS.map((s, i) => (
          <section key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {/* FULL WIDTH UI MOCKUP */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              {mounted && (
                <FadeUp>
                  <s.UI />
                </FadeUp>
              )}
            </div>
            {/* TEXT BELOW */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 3rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              <div>
                {mounted && (
                  <FadeUp>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.035em', color: 'rgba(255,255,255,0.94)' }}>
                      {s.headline}
                    </h2>
                  </FadeUp>
                )}
              </div>
              <div>
                {mounted && (
                  <FadeUp delay={100}>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, marginBottom: '2rem' }}>{s.body}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>{s.num}</span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>→</span>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {s.subs.map(([num, label]) => (
                        <div key={num} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>{num}</span>
                          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </FadeUp>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* INDUSTRIES */}
      <section id="industries" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '7rem 3rem' }}>
        {mounted && (
          <FadeUp>
            <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '1.5rem' }}>BUILT FOR SERVICE BUSINESSES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {['Roofing', 'HVAC', 'Masonry', 'Power Washing', 'Insurance', 'Landscaping', 'Construction', 'Plumbing', 'Electrical', 'Pest Control'].map(ind => (
                  <div key={ind} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)' }}>
                    {ind}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}
      </section>

      {/* ROI */}
      <section id="results" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '7rem 3rem' }}>
        {mounted && (
          <FadeUp>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '1.25rem' }}>THE MATH</div>
                <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.035em', maxWidth: 640, color: 'rgba(255,255,255,0.94)' }}>
                  What this is actually worth to your business.
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { industry: 'Roofing', roi: '163x', detail: 'One recovered job covers months of system cost. Average roofing job value: $14,000.' },
                  { industry: 'Landscaping', roi: '26x', detail: 'Recurring maintenance contracts booked without chasing a single lead.' },
                  { industry: 'Power Washing', roi: '21x', detail: 'Every missed call is a potential $800 job. ATLAS catches all of them.' },
                ].map((r, i) => (
                  <div key={i} style={{ background: '#0d0d0f', padding: '3rem 2.5rem' }}>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.18em', fontWeight: 600, marginBottom: '1rem' }}>{r.industry.toUpperCase()}</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#a78bfa', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.4rem' }}>{r.roi}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(139,92,246,0.4)', marginBottom: '1.5rem' }}>return on investment</div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.68 }}>{r.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}
      </section>

      {/* CTA */}
      <section style={{ padding: '10rem 3rem', textAlign: 'center' }}>
        {mounted && (
          <FadeUp>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.95)' }}>
                Built for the future.<br />
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>Available today.</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.72, marginBottom: '2.5rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
                Book a free 30-minute systems audit. We'll map exactly where your business is losing revenue.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                  style={{ background: '#fff', color: '#08090a', padding: '0.85rem 2.2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                  Book Your Free Audit
                </a>
                <a href="mailto:casey.gallagher@thriveautomation.agency"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', padding: '0.85rem 2.2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  Contact us
                </a>
              </div>
            </div>
          </FadeUp>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #5b21b6)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['Systems', '#systems'], ['Results', '#results'], ['Contact', 'mailto:casey.gallagher@thriveautomation.agency']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.12)' }}>Intelligent Operations Automations</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #08090a; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #08090a; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 2px; }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 220px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

