const fs = require('fs')

let page = fs.readFileSync('app/page.tsx', 'utf8')

const newFollowUpUI = `function FollowUpUI() {
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
}`

const newRevenueUI = `function RevenueUI() {
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
}`

const followStart = page.indexOf('function FollowUpUI()')
const revenueStart = page.indexOf('function RevenueUI()')
const sectionsStart = page.indexOf('const SECTIONS')

page = page.slice(0, followStart) + newFollowUpUI + '\n\n' + newRevenueUI + '\n\n' + page.slice(sectionsStart)

fs.writeFileSync('app/page.tsx', page)
console.log('Done:', fs.readFileSync('app/page.tsx','utf8').split('\n').length, 'lines')
