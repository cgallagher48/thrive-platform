'use client'
import { useState, useEffect, useRef } from 'react'

function useInView() {
  const ref = useRef(null)
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

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease ' + delay + 'ms, transform 0.7s ease ' + delay + 'ms' }}>
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
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 380, background: '#0c0c0e' }}>
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0' }}>
        <div style={{ padding: '0.25rem 1rem', fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>INCOMING LEADS</div>
        {calls.map((c, i) => (
          <div key={i} onClick={() => setTick(i)} style={{ padding: '0.55rem 1rem', cursor: 'pointer', background: active === i ? 'rgba(139,92,246,0.08)' : 'transparent', borderLeft: active === i ? '2px solid #7c3aed' : '2px solid transparent', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '0.68rem', color: active === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)', fontWeight: active === i ? 600 : 400 }}>{c.name}</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)', marginTop: '0.1rem' }}>{c.src} -- {c.time}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LEAD DETAIL</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '0.35rem' }}>{calls[active].name}</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.58rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '0.12rem 0.45rem', borderRadius: 4 }}>{calls[active].status}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)' }}>{calls[active].src}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>ACTIVITY</div>
          {[
            { msg: 'Lead entered ATLAS system', time: 'just now', accent: false },
            { msg: calls[active].response, time: '38s later', accent: true },
            { msg: 'Lead tagged and routed to pipeline', time: '1 min', accent: false },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.7rem', alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.accent ? '#a78bfa' : 'rgba(255,255,255,0.12)', marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.68rem', color: a.accent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.32)' }}>{a.msg}</div>
                <div style={{ fontSize: '0.54rem', color: 'rgba(255,255,255,0.14)', marginTop: '0.1rem' }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 8, padding: '0.7rem 1rem' }}>
          <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', marginBottom: '0.15rem' }}>ATLAS response time</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em' }}>38 seconds</div>
        </div>
      </div>
    </div>
  )
}

function FollowUpUI() {
  const [messages, setMessages] = useState([
    { from: 'atlas', text: 'Hi John, this is ATLAS from Apex Roofing. We missed your call -- are you still looking for a free estimate?', time: '2:14 AM' },
    { from: 'lead', text: 'Yeah actually I am. Roof has been leaking for a few weeks', time: '2:16 AM' },
    { from: 'atlas', text: 'Sorry to hear that. We can get someone out this week. What area are you in and is it a full replacement or just a repair?', time: '2:16 AM' },
    { from: 'lead', text: 'Chicago north side, probably full replacement the thing is 20 years old', time: '2:18 AM' },
    { from: 'atlas', text: 'Got it. Here is a link to book a free inspection -- usually 30 min and we give you a quote same day.', time: '2:18 AM' },
  ])
  const [typing, setTyping] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setTyping(true), 3000)
    const id2 = setTimeout(() => { setTyping(false); setMessages(m => [...m, { from: 'lead', text: 'Perfect booking for Thursday', time: '2:19 AM' }]) }, 5500)
    return () => { clearTimeout(id); clearTimeout(id2) }
  }, [])
  return (
    <div style={{ background: '#0c0c0e', minHeight: 420, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: 420 }}>
        <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>SMS CONVERSATION -- JOHN MARCHETTI</div>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'lead' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '80%', padding: '0.6rem 0.85rem', borderRadius: m.from === 'lead' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.from === 'lead' ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.15)', border: '1px solid ' + (m.from === 'lead' ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.2)') }}>
              <div style={{ fontSize: '0.72rem', color: m.from === 'lead' ? 'rgba(255,255,255,0.75)' : 'rgba(196,181,253,0.9)', lineHeight: 1.5 }}>{m.text}</div>
            </div>
            <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.2rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>{m.from === 'atlas' ? 'ATLAS' : 'John'} -- {m.time}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '12px 12px 12px 2px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(196,181,253,0.5)' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(196,181,253,0.5)' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(196,181,253,0.5)' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>SEQUENCE STATS</div>
        {[
          { label: 'Time to first response', value: '38s', color: '#a78bfa' },
          { label: 'Time to appointment', value: '4m 02s', color: '#10b981' },
          { label: 'Messages sent by ATLAS', value: '3', color: 'rgba(255,255,255,0.6)' },
          { label: 'Outcome', value: 'Booked', color: '#10b981' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.32)' }}>{s.label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: s.color, letterSpacing: '-0.01em' }}>{s.value}</div>
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '0.85rem 1rem', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 8 }}>
          <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', marginBottom: '0.2rem' }}>NEXT ACTION</div>
          <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>Send 24hr appointment reminder</div>
        </div>
      </div>
    </div>
  )
}

function RevenueUI() {
  const [rev, setRev] = useState(284600)
  const bars = [42, 61, 38, 75, 55, 88, 92, 67, 78, 95, 84, 100]
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  useEffect(() => { const id = setInterval(() => setRev(r => r + Math.floor(Math.random() * 350 + 80)), 2400); return () => clearInterval(id) }, [])
  return (
    <div style={{ background: '#0c0c0e', minHeight: 420, padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div>
        <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '1rem' }}>REVENUE RECOVERED</div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.3rem' }}>THIS MONTH</div>
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.03em', lineHeight: 1, transition: 'all 0.5s', marginBottom: '1.5rem' }}>{'$' + rev.toLocaleString()}</div>
        <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>MONTHLY TREND</div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: 80, marginBottom: '1.5rem' }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: i === bars.length - 1 ? '#10b981' : 'rgba(139,92,246,0.3)', height: (h / 100) * 70, boxShadow: i === bars.length - 1 ? '0 0 8px rgba(16,185,129,0.4)' : 'none' }} />
              <div style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.15)' }}>{months[i].slice(0,1)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[['Invoices Sent', '47'], ['Paid On Time', '94%'], ['Avg Job Value', '$8,420'], ['Overdue', '3']].map(([l, v]) => (
            <div key={l} style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
              <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.18)', marginBottom: '0.2rem' }}>{l}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>RECENT INVOICES</div>
        {[
          { name: 'Johnson Roofing', job: 'Full replacement', amount: 14200, status: 'Paid' },
          { name: 'Metro HVAC', job: 'System install', amount: 8400, status: 'Paid' },
          { name: 'Williams Masonry', job: 'Patio and walkway', amount: 6100, status: 'Pending' },
          { name: 'Lakeside Power Wash', job: 'Commercial lot', amount: 2800, status: 'Paid' },
          { name: 'Apex Insurance', job: 'Water damage claim', amount: 11200, status: 'In Review' },
        ].map((j, i) => (
          <div key={i} style={{ padding: '0.65rem 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{j.name}</div>
                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', marginTop: '0.1rem' }}>{j.job}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{'$' + j.amount.toLocaleString()}</div>
                <div style={{ fontSize: '0.54rem', color: j.status === 'Paid' ? '#10b981' : j.status === 'Pending' ? '#f59e0b' : 'rgba(255,255,255,0.3)', background: j.status === 'Paid' ? 'rgba(16,185,129,0.08)' : j.status === 'Pending' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)', padding: '0.12rem 0.45rem', borderRadius: 4 }}>{j.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SECTIONS = [
  { num: '1.0', headline: 'Never miss another lead.', body: 'ATLAS answers every missed call, web form, and message within 60 seconds. Every lead logged, qualified, and responded to automatically.', label: 'Lead Capture', link: 'Lead Capture ->', subs: [['1.1', 'Missed Call AI'], ['1.2', 'Web Form Routing'], ['1.3', 'SMS Response'], ['1.4', 'Lead Qualification']], UI: LeadCaptureUI },
  { num: '2.0', headline: 'From lead to booked in under 5 minutes.', body: 'Automated sequences qualify prospects and drop appointments directly onto your calendar. No back and forth. No chasing.', label: 'Follow-Up Engine', link: 'Follow-Up Engine ->', subs: [['2.1', 'SMS Sequences'], ['2.2', 'Email Automation'], ['2.3', 'Appointment Booking'], ['2.4', 'CRM Sync']], UI: FollowUpUI },
  { num: '3.0', headline: 'Collect every dollar you have earned.', body: 'Invoices sent on job completion. Automated reminders until paid. Every dollar tracked so nothing slips through.', label: 'Revenue Operations', link: 'Revenue Operations ->', subs: [['3.1', 'Auto Invoicing'], ['3.2', 'Payment Reminders'], ['3.3', 'Revenue Tracking'], ['3.4', 'Review Generation']], UI: RevenueUI },
]

export default function Page() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <div style={{ background: '#08090a', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 54, padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,9,10,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #5b21b6)', boxShadow: '0 0 12px rgba(139,92,246,0.6)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.14em' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['Systems', 'Industries', 'Results'].map(s => (
            <a key={s} href={'#' + s.toLowerCase()} style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>{s}</a>
          ))}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#08090a', padding: '0.4rem 1.1rem', borderRadius: 20, textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem' }}>Sign up</a>
        </div>
      </nav>
      <section style={{ padding: '120px 2.5rem 50px', maxWidth: 1200, margin: '0 auto' }}>
        {mounted && (
          <>
            <FadeUp>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.8rem)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.95)', maxWidth: 900 }}>The automation system<br />for service businesses.</h1>
            </FadeUp>
            <FadeUp delay={100}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, maxWidth: 480 }}>Purpose-built for roofing, HVAC, masonry, and contracting. Designed to capture every lead, book every appointment, and collect every dollar.</p>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap', paddingTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 700 }}>New</span>
                  Get a Free Audit &rarr;
                </a>
              </div>
            </FadeUp>
          </>
        )}
      </section>
      <div style={{ padding: '0 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
        {mounted && (
          <FadeUp>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0d0d0f' }}>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                </div>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em', marginLeft: '0.5rem' }}>ATLAS -- Lead Operations</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.7)' }} />
                  <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.18)' }}>Live</span>
                </div>
              </div>
              <LeadCaptureUI />
            </div>
          </FadeUp>
        )}
      </div>
      <div style={{ padding: '8rem 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
        {mounted && (
          <FadeUp>
            <p style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>A new standard for service operations.</span>
              <span style={{ color: 'rgba(255,255,255,0.22)' }}> Purpose-built for the businesses that keep the world running. Roofing, HVAC, masonry, contracting. Designed so every lead gets captured, every job gets booked, and every dollar gets collected.</span>
            </p>
          </FadeUp>
        )}
      </div>
      <div id="systems">
        {SECTIONS.map((s, i) => (
          <section key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding: '5rem 2.5rem 3rem', maxWidth: 1200, margin: '0 auto' }}>
              {mounted && (
                <FadeUp>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.8rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.035em', color: 'rgba(255,255,255,0.94)', maxWidth: 600 }}>{s.headline}</h2>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.7, maxWidth: 340, marginBottom: '1rem' }}>{s.body}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>{s.num}</span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)' }}>{s.link}</span>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              )}
            </div>
            <div style={{ padding: '0 2.5rem 5rem', maxWidth: 1200, margin: '0 auto' }}>
              {mounted && (
                <FadeUp>
                  <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0d0d0f' }}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em', marginLeft: '0.5rem' }}>ATLAS -- {s.label}</span>
                    </div>
                    <s.UI />
                  </div>
                </FadeUp>
              )}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '1.5rem 2.5rem', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {s.subs.map(([num, label]) => (
                <div key={num} style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.16)', fontWeight: 600 }}>{num}</span>
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)' }}>{label}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section id="industries" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '7rem 2.5rem' }}>
        {mounted && (
          <FadeUp>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '2rem' }}>BUILT FOR SERVICE BUSINESSES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Roofing', 'HVAC', 'Masonry', 'Power Washing', 'Insurance', 'Landscaping', 'Construction', 'Plumbing', 'Electrical', 'Pest Control'].map(ind => (
                  <div key={ind} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{ind}</div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}
      </section>
      <section id="results" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '7rem 2.5rem' }}>
        {mounted && (
          <FadeUp>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '1.25rem' }}>THE MATH</div>
                <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.035em', maxWidth: 640, color: 'rgba(255,255,255,0.94)' }}>What this is actually worth to your business.</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { industry: 'Roofing', roi: '163x', detail: 'One recovered job covers months of system cost. Average job value: $14,000.' },
                  { industry: 'Landscaping', roi: '26x', detail: 'Recurring maintenance contracts booked without chasing a single lead.' },
                  { industry: 'Power Washing', roi: '21x', detail: 'Every missed call is a potential $800 job. ATLAS catches all of them.' },
                ].map((r, i) => (
                  <div key={i} style={{ background: '#0d0d0f', padding: '3rem 2.5rem' }}>
                    <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.16)', letterSpacing: '0.18em', fontWeight: 600, marginBottom: '1rem' }}>{r.industry.toUpperCase()}</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#a78bfa', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.4rem' }}>{r.roi}</div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(139,92,246,0.35)', marginBottom: '1.5rem' }}>return on investment</div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.68 }}>{r.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}
      </section>
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10rem 2.5rem' }}>
        {mounted && (
          <FadeUp>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.04em', marginBottom: '2rem', color: 'rgba(255,255,255,0.95)', maxWidth: 700 }}>Built for the future.<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>Available today.</span></h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#08090a', padding: '0.8rem 2rem', borderRadius: 20, textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>Book Your Free Audit</a>
                <a href="mailto:casey.gallagher@thriveautomation.agency" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', padding: '0.8rem 2rem', borderRadius: 20, textDecoration: 'none', fontWeight: 500, fontSize: '0.88rem' }}>Contact us</a>
              </div>
            </div>
          </FadeUp>
        )}
      </section>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #5b21b6)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.3)' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['Systems', '#systems'], ['Results', '#results'], ['Contact', 'mailto:casey.gallagher@thriveautomation.agency']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.18)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.1)' }}>Intelligent Operations Automations</div>
      </footer>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #08090a; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #08090a; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 2px; }
      `}</style>
    </div>
  )
}




