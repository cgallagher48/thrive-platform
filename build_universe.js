const fs = require('fs')

const universe = `'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { id: 'hero', label: 'HOME', color: '#7B3FE4' },
  { id: 'problem', label: 'THE PROBLEM', color: '#ef4444' },
  { id: 'solution', label: 'THE SOLUTION', color: '#10b981' },
  { id: 'systems', label: 'SYSTEMS', color: '#60a5fa' },
  { id: 'roi', label: 'THE ROI', color: '#f59e0b' },
  { id: 'pricing', label: 'PRICING', color: '#A56EFF' },
  { id: 'launch', label: 'LAUNCH', color: '#10b981' },
]

function UniverseCanvas({ activeSection }: { activeSection: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<any>({})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // Star field
    const starGeo = new THREE.BufferGeometry()
    const starCount = 8000
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
      sizes[i] = Math.random() * 2 + 0.5
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.8, sizeAttenuation: true })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // Nebula particles
    const nebulaGeo = new THREE.BufferGeometry()
    const nebulaCount = 2000
    const nebulaPos = new Float32Array(nebulaCount * 3)
    for (let i = 0; i < nebulaCount; i++) {
      const radius = Math.random() * 30 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      nebulaPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      nebulaPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      nebulaPos[i * 3 + 2] = radius * Math.cos(phi) - 20
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3))
    const nebulaMat = new THREE.PointsMaterial({ color: 0x7B3FE4, size: 0.15, transparent: true, opacity: 0.3, sizeAttenuation: true })
    const nebula = new THREE.Points(nebulaGeo, nebulaMat)
    scene.add(nebula)

    // Central THRIVE orb
    const orbGeo = new THREE.SphereGeometry(1.2, 64, 64)
    const orbMat = new THREE.MeshPhongMaterial({
      color: 0x7B3FE4,
      emissive: 0x3B1F7F,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    })
    const orb = new THREE.Mesh(orbGeo, orbMat)
    scene.add(orb)

    // Orb glow rings
    const ring1Geo = new THREE.TorusGeometry(1.8, 0.02, 16, 100)
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x7B3FE4, transparent: true, opacity: 0.4 })
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    ring1.rotation.x = Math.PI / 3
    scene.add(ring1)

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.015, 16, 100)
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xA56EFF, transparent: true, opacity: 0.25 })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = Math.PI / 5
    ring2.rotation.y = Math.PI / 4
    scene.add(ring2)

    // Planets for each section
    const planetData = [
      { color: 0xef4444, size: 0.4, x: -8, y: 3, z: -10 },
      { color: 0x10b981, size: 0.5, x: 10, y: -2, z: -15 },
      { color: 0x60a5fa, size: 0.35, x: -6, y: -5, z: -20 },
      { color: 0xf59e0b, size: 0.6, x: 12, y: 4, z: -25 },
      { color: 0xA56EFF, size: 0.45, x: -10, y: 2, z: -30 },
      { color: 0x10b981, size: 0.8, x: 0, y: 0, z: -35 },
    ]

    const planets = planetData.map(({ color, size, x, y, z }) => {
      const geo = new THREE.SphereGeometry(size, 32, 32)
      const mat = new THREE.MeshPhongMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(0.3), shininess: 80 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      scene.add(mesh)
      return mesh
    })

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222244, 2)
    scene.add(ambientLight)
    const pointLight1 = new THREE.PointLight(0x7B3FE4, 3, 50)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)
    const pointLight2 = new THREE.PointLight(0xA56EFF, 2, 30)
    pointLight2.position.set(-5, -3, 3)
    scene.add(pointLight2)

    sceneRef.current = { renderer, scene, camera, stars, nebula, orb, ring1, ring2, planets, pointLight1 }

    // Handle resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // Animation loop
    let animId: number
    const tick = () => {
      animId = requestAnimationFrame(tick)
      const t = Date.now() * 0.001

      stars.rotation.y = t * 0.02
      stars.rotation.x = t * 0.005
      nebula.rotation.y = -t * 0.01
      orb.rotation.y = t * 0.3
      ring1.rotation.z = t * 0.15
      ring2.rotation.x = t * 0.1

      planets.forEach((p, i) => {
        p.rotation.y = t * 0.2 * (i % 2 === 0 ? 1 : -1)
        p.position.y += Math.sin(t * 0.5 + i) * 0.002
      })

      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)

      pointLight1.position.x = Math.sin(t) * 5
      pointLight1.position.y = Math.cos(t * 0.7) * 3

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      renderer.dispose()
    }
  }, [])

  // Animate camera based on active section
  useEffect(() => {
    const { camera, orb, nebula } = sceneRef.current
    if (!camera) return

    const sectionZ = [0, -8, -15, -20, -25, -30, -35]
    const sectionColors = [0x7B3FE4, 0xef4444, 0x10b981, 0x60a5fa, 0xf59e0b, 0xA56EFF, 0x10b981]

    gsap.to(camera.position, {
      z: 5 + sectionZ[activeSection] * 0.15,
      duration: 1.5,
      ease: 'power3.inOut'
    })

    if (nebula?.material) {
      gsap.to(nebula.material.color, {
        r: new THREE.Color(sectionColors[activeSection]).r,
        g: new THREE.Color(sectionColors[activeSection]).g,
        b: new THREE.Color(sectionColors[activeSection]).b,
        duration: 1.5
      })
    }
  }, [activeSection])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
}

function HyperspeedFlash({ trigger }: { trigger: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trigger || !ref.current) return
    gsap.fromTo(ref.current,
      { opacity: 0, scaleY: 0 },
      { opacity: 1, scaleY: 1, duration: 0.15, yoyo: true, repeat: 1, ease: 'power4.in',
        onComplete: () => { if (ref.current) ref.current.style.opacity = '0' }
      }
    )
  }, [trigger])

  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none', opacity: 0,
      background: 'linear-gradient(180deg, transparent 0%, rgba(123,63,228,0.8) 50%, transparent 100%)',
      transformOrigin: 'center'
    }} />
  )
}

export default function UniversePage() {
  const [activeSection, setActiveSection] = useState(0)
  const [hyperspeed, setHyperspeed] = useState(false)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  const navigateTo = (index: number) => {
    setHyperspeed(true)
    setTimeout(() => {
      setHyperspeed(false)
      sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  useEffect(() => {
    const observers = sectionsRef.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(i)
      }, { threshold: 0.5 })
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  const glass = {
    background: 'rgba(8,5,16,0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(123,63,228,0.2)',
    borderRadius: 16,
  }

  return (
    <div style={{ background: '#04020C', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <UniverseCanvas activeSection={activeSection} />
      <HyperspeedFlash trigger={hyperspeed} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(4,2,12,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(123,63,228,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'radial-gradient(circle, #A56EFF, #7B3FE4)', boxShadow: '0 0 20px rgba(123,63,228,0.6)' }} />
          <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.1em' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => navigateTo(i)}
              style={{ background: activeSection === i ? 'rgba(123,63,228,0.25)' : 'none', border: activeSection === i ? '1px solid rgba(123,63,228,0.4)' : '1px solid transparent', borderRadius: 20, padding: '0.3rem 0.75rem', color: activeSection === i ? '#A56EFF' : 'rgba(255,255,255,0.35)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s' }}>
              {s.label}
            </button>
          ))}
        </div>
        <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
          style={{ background: 'linear-gradient(135deg, #7B3FE4, #A56EFF)', color: 'white', padding: '0.6rem 1.4rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 0 20px rgba(123,63,228,0.4)' }}>
          LAUNCH CALL
        </a>
      </nav>

      {/* SECTION 1: HERO */}
      <section ref={el => { sectionsRef.current[0] = el }} id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 800 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #C090FF, #7B3FE4)', boxShadow: '0 0 60px rgba(123,63,228,0.8), 0 0 120px rgba(123,63,228,0.4)', margin: '0 auto 3rem', animation: 'orbPulse 3s ease-in-out infinite' }} />
          <div style={{ display: 'inline-block', background: 'rgba(123,63,228,0.15)', border: '1px solid rgba(123,63,228,0.3)', borderRadius: 100, padding: '0.4rem 1.2rem', marginBottom: '2rem', fontSize: '0.7rem', letterSpacing: '0.2em', color: '#A56EFF', fontWeight: 700 }}>
            INTELLIGENT OPERATIONS AUTOMATIONS
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Your business.<br />
            <span style={{ background: 'linear-gradient(135deg, #A56EFF, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Fully automated.
            </span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '3rem', maxWidth: 560, margin: '0 auto 3rem' }}>
            We build custom intelligent systems that eliminate manual work, capture every lead, and run your operations on autopilot. For any business. Starting with roofing.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigateTo(6)} style={{ background: 'linear-gradient(135deg, #7B3FE4, #A56EFF)', border: 'none', color: 'white', padding: '1rem 2.5rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 40px rgba(123,63,228,0.5)', letterSpacing: '0.05em' }}>
              ENTER THE COMMAND CENTER
            </button>
            <button onClick={() => navigateTo(1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '1rem 2rem', borderRadius: 10, fontSize: '0.9rem', cursor: 'pointer' }}>
              SEE THE PROBLEM
            </button>
          </div>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '5rem', flexWrap: 'wrap' }}>
            {[['163x', 'ROI on recovered leads'], ['40hrs', 'Saved per month'], ['4 min', 'Lead response time'], ['48hrs', 'To go live']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#A56EFF', letterSpacing: '-0.03em' }}>{num}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section ref={el => { sectionsRef.current[1] = el }} id="problem" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#ef4444', fontWeight: 700, marginBottom: '1rem' }}>THE PROBLEM</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Your team is doing work<br />
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>that machines should handle.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '⏳', title: 'Missed Leads', desc: 'Leads calling after hours get no response. By morning they hired your competitor.' },
              { icon: '📋', title: 'Manual Follow-Up', desc: 'Your team manually chasing estimates, invoices, and callbacks every single day.' },
              { icon: '⚙️', title: 'Ops Chaos', desc: 'Six different tools, no single source of truth, and you in the middle of all of it.' },
              { icon: '💸', title: 'Revenue Leakage', desc: 'Roofing companies lose $780K/year on average to missed and slow-responded leads.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ ...glass, padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE SOLUTION */}
      <section ref={el => { sectionsRef.current[2] = el }} id="solution" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#10b981', fontWeight: 700, marginBottom: '1rem' }}>THE SOLUTION</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            One intelligent system.<br />
            <span style={{ color: '#10b981' }}>Running everything.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 3rem' }}>
            Thrive builds custom automation systems tailored to your business. Every lead captured. Every follow-up sent. Every invoice tracked. All automatic.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
            {[
              ['01', 'Discovery', 'We map every manual process costing you time and money.'],
              ['02', 'Build', 'Custom automation systems designed for your exact workflow.'],
              ['03', 'Deploy', 'Live in 48 hours. Tracked against hard ROI from day one.'],
            ].map(([num, title, desc]) => (
              <div key={title} style={{ ...glass, padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(16,185,129,0.2)', marginBottom: '0.5rem' }}>{num}</div>
                <h3 style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SYSTEMS */}
      <section ref={el => { sectionsRef.current[3] = el }} id="systems" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#60a5fa', fontWeight: 700, marginBottom: '1rem' }}>THE SYSTEMS</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Built once.<br />
              <span style={{ color: '#60a5fa' }}>Deployed infinitely.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Lead Capture Engine', desc: 'Every inbound lead captured and responded to in under 4 minutes. 24/7.', color: '#60a5fa' },
              { name: 'Follow-Up Automation', desc: 'Estimates, invoices, and callbacks handled automatically on your schedule.', color: '#A56EFF' },
              { name: 'Ops Dashboard', desc: 'One screen showing your entire business in real time. No more tool-switching.', color: '#10b981' },
              { name: 'Invoice Collection', desc: 'Automatic payment reminders at 3, 7, and 14 days. Cash flow on autopilot.', color: '#f59e0b' },
              { name: 'Client Updates', desc: 'Automated job status updates to homeowners. Zero calls about "whats the status."', color: '#ef4444' },
              { name: 'AI Document Scanner', desc: 'Phone camera to searchable database in seconds. Find any file instantly.', color: '#60a5fa' },
            ].map(({ name, desc, color }) => (
              <div key={name} style={{ ...glass, padding: '1.5rem', borderLeft: '3px solid ' + color }}>
                <h3 style={{ fontWeight: 700, color, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: ROI */}
      <section ref={el => { sectionsRef.current[4] = el }} id="roi" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#f59e0b', fontWeight: 700, marginBottom: '1rem' }}>THE MATH</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              The numbers<br />
              <span style={{ color: '#f59e0b' }}>don't lie.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { industry: 'Roofing', missed: 3, value: 5000, annual: 780000, cost: 11964, roi: '163x', color: '#f59e0b' },
              { industry: 'Landscaping', missed: 4, value: 600, annual: 124800, cost: 11964, roi: '26x', color: '#10b981' },
              { industry: 'Construction', missed: 2, value: 15000, annual: 1560000, cost: 29964, roi: '52x', color: '#60a5fa' },
            ].map(({ industry, missed, value, annual, cost, roi, color }) => (
              <div key={industry} style={{ ...glass, padding: '2rem', border: '1px solid ' + color + '33' }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{industry}</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '1.5rem' }}>{roi}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Missed leads/week</span>
                    <span style={{ fontWeight: 700 }}>{missed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Avg job value</span>
                    <span style={{ fontWeight: 700 }}>\${value.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <span style={{ color: 'rgba(239,68,68,0.7)' }}>Annual loss</span>
                    <span style={{ color: '#fca5a5', fontWeight: 700 }}>\${annual.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.75rem', background: 'rgba(123,63,228,0.08)', borderRadius: 8, border: '1px solid rgba(123,63,228,0.15)' }}>
                    <span style={{ color: 'rgba(165,110,255,0.7)' }}>Thrive annual cost</span>
                    <span style={{ color: '#A56EFF', fontWeight: 700 }}>\${cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: PRICING */}
      <section ref={el => { sectionsRef.current[5] = el }} id="pricing" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#A56EFF', fontWeight: 700, marginBottom: '1rem' }}>INVESTMENT</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              One closed job.<br />
              <span style={{ color: '#A56EFF' }}>Pays for everything.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'SMB', setup: '$4,997', monthly: '$997/mo', desc: 'Perfect for roofing, landscaping, service businesses under 20 people.', color: '#60a5fa' },
              { name: 'MID-MARKET', setup: '$2,997', monthly: '$797/mo', desc: 'Construction, insurance, and growing service companies.', color: '#A56EFF', highlighted: true },
              { name: 'COMMERCIAL', setup: '$14,997', monthly: '$2,497/mo', desc: 'Large commercial operations, multi-location, enterprise-ready.', color: '#f59e0b' },
            ].map(({ name, setup, monthly, desc, color, highlighted }) => (
              <div key={name} style={{ ...glass, padding: '2rem', border: highlighted ? '1px solid rgba(165,110,255,0.4)' : '1px solid rgba(255,255,255,0.06)', boxShadow: highlighted ? '0 0 40px rgba(123,63,228,0.2)' : 'none' }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color, fontWeight: 700, marginBottom: '1rem' }}>{name}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '0.25rem' }}>{setup}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>setup + {monthly}</div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{desc}</p>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', background: highlighted ? 'linear-gradient(135deg, #7B3FE4, #A56EFF)' : 'transparent', color: highlighted ? 'white' : color, border: highlighted ? 'none' : '1px solid ' + color + '44', letterSpacing: '0.05em' }}>
                  BOOK A CALL
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: LAUNCH */}
      <section ref={el => { sectionsRef.current[6] = el }} id="launch" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 700 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #10b981, #065f46)', boxShadow: '0 0 60px rgba(16,185,129,0.6)', margin: '0 auto 3rem', animation: 'orbPulse 2s ease-in-out infinite' }} />
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#10b981', fontWeight: 700, marginBottom: '1rem' }}>READY?</div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Stop managing.<br />
            <span style={{ background: 'linear-gradient(135deg, #10b981, #A56EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start commanding.
            </span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: '3rem' }}>
            Book a free 20-minute strategy call. We map your highest-impact automation opportunities. No obligation. No fluff. Just the plan.
          </p>
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #7B3FE4)', color: 'white', padding: '1.2rem 3rem', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: '0 0 60px rgba(16,185,129,0.4)', letterSpacing: '0.05em' }}>
            BOOK YOUR FREE STRATEGY CALL
          </a>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.5rem' }}>
            casey.gallagher@thriveautomation.agency
          </p>
        </div>
      </section>

      <style>{\`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(123,63,228,0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(123,63,228,0.9); }
        }
      \`}</style>
    </div>
  )
}
`

fs.writeFileSync('app/page.tsx', universe, 'utf8')
console.log('Universe homepage created')
