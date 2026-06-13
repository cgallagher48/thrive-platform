const fs = require('fs')

const page = `'use client'
import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { BlendFunction, KernelSize } from 'postprocessing'

// ATLAS Dyson Megastructure - the only 3D element
function ATLASMegastructure() {
  const coreRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const latticeRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.12
      ring1Ref.current.rotation.x = Math.PI / 2.3 + Math.sin(t * 0.08) * 0.03
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.08
      ring2Ref.current.rotation.x = Math.PI / 3.2
      ring2Ref.current.rotation.y = t * 0.04
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.05
      ring3Ref.current.rotation.x = Math.PI / 4
      ring3Ref.current.rotation.y = -t * 0.06
    }
    if (latticeRef.current) {
      latticeRef.current.rotation.y = t * 0.015
      latticeRef.current.rotation.x = t * 0.008
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04)
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.06
    }
  })

  return (
    <group ref={groupRef} position={[1.5, -0.5, 0]}>
      {/* The artificial star core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Core energy field */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      {/* Pulsing glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#6D28D9" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Primary Dyson ring - massive structural */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.05, 24, 300]} />
        <meshStandardMaterial
          color="#C4B5FD"
          emissive="#7C3AED"
          emissiveIntensity={2.5}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Secondary ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.1, 0.035, 24, 300]} />
        <meshStandardMaterial
          color="#93C5FD"
          emissive="#3B82F6"
          emissiveIntensity={2.0}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Tertiary ring */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[3.9, 0.025, 24, 300]} />
        <meshStandardMaterial
          color="#DDD6FE"
          emissive="#8B5CF6"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.08}
        />
      </mesh>

      {/* Geodesic lattice shell */}
      <mesh ref={latticeRef}>
        <icosahedronGeometry args={[1.6, 3]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#4C1D95"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Energy particle streams */}
      <EnergyStream radius={2.2} count={800} color="#A78BFA" speed={0.6} />
      <EnergyStream radius={3.1} count={500} color="#60A5FA" speed={-0.4} />
      <EnergyStream radius={3.9} count={300} color="#C4B5FD" speed={0.25} />

      {/* Lights */}
      <pointLight color="#A78BFA" intensity={15} distance={30} />
      <pointLight color="#ffffff" intensity={6} distance={12} />
      <pointLight color="#3B82F6" intensity={3} distance={20} position={[4, 2, 2]} />
    </group>
  )
}

function EnergyStream({ radius, count, color, speed }: { radius: number; count: number; color: string; speed: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const jitter = (Math.random() - 0.5) * 0.25
      pos[i * 3] = Math.cos(angle) * (radius + jitter)
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.15
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter)
    }
    return pos
  }, [count, radius])

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.getElapsedTime() * speed * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.012} transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

// Floating dust particles
function SpaceDust() {
  const ref = useRef<THREE.Points>(null)
  const count = 2000
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10
    }
    return pos
  }, [])

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.getElapsedTime() * 0.002
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9B8EC4" size={0.025} transparent opacity={0.25} sizeAttenuation />
    </points>
  )
}

// Cinematic camera with drift
function CinematicCamera({ phase }: { phase: string }) {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0, z: 18 })
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5)
      mouse.current.y = (e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useEffect(() => {
    if (phase === 'intro') {
      target.current = { x: -2, y: 0.5, z: 28 }
      gsap.to(target.current, { x: 0, y: 0, z: 18, duration: 4, ease: 'power2.inOut' })
    } else if (phase === 'hero') {
      gsap.to(target.current, { x: 0, y: 0, z: 18, duration: 2, ease: 'power2.inOut' })
    }
  }, [phase])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const driftX = Math.sin(t * 0.05) * 0.3
    const driftY = Math.cos(t * 0.04) * 0.15

    camera.position.x += (target.current.x + mouse.current.x * 0.8 + driftX - camera.position.x) * 0.025
    camera.position.y += (target.current.y - mouse.current.y * 0.5 + driftY - camera.position.y) * 0.025
    camera.position.z += (target.current.z - camera.position.z) * 0.025
    camera.lookAt(1.5, -0.5, 0)
  })

  return null
}

function Scene({ phase }: { phase: string }) {
  return (
    <>
      <CinematicCamera phase={phase} />
      <Stars radius={400} depth={120} count={20000} factor={10} saturation={0.1} fade speed={0.2} />
      <Stars radius={150} depth={60} count={6000} factor={5} saturation={0.3} fade speed={0.08} />
      <SpaceDust />
      <ATLASMegastructure />
      <ambientLight intensity={0.05} color="#04010F" />
      <directionalLight position={[15, 10, 8]} intensity={0.4} color="#E0D7FF" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.8} radius={0.9} kernelSize={KernelSize.HUGE} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0006, 0.0006)} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.3} darkness={0.85} />
      </EffectComposer>
    </>
  )
}

// Cinematic intro sequence
function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const pixelRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Step 1: darkness for 1.5s
    tl.to({}, { duration: 1.5 })

    // Step 2: pixel appears
    tl.call(() => setStep(1))
    tl.to({}, { duration: 0.5 })

    // Step 3: pixel expands
    tl.call(() => setStep(2))
    tl.to({}, { duration: 2.5 })

    // Step 4: universe reveals
    tl.call(() => setStep(3))
    tl.to({}, { duration: 3.0 })

    // Step 5: THRIVE text
    tl.call(() => setStep(4))
    tl.to({}, { duration: 2.0 })

    // Step 6: subtext
    tl.call(() => setStep(5))
    tl.to({}, { duration: 2.0 })

    // Step 7: CTA appears
    tl.call(() => setStep(6))
    tl.to({}, { duration: 1.5 })

    // Complete
    tl.call(() => onComplete())

    return () => { tl.kill() }
  }, [onComplete])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      {/* Darkness overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'black',
        opacity: step >= 3 ? 0 : 1,
        transition: 'opacity 2.5s ease',
        pointerEvents: 'none'
      }} />

      {/* The pixel */}
      {step >= 1 && (
        <div style={{
          position: 'absolute',
          width: step >= 2 ? '300px' : '2px',
          height: step >= 2 ? '300px' : '2px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffffff, #A78BFA 40%, transparent 70%)',
          opacity: step >= 3 ? 0 : 1,
          transition: 'all 2.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s ease 2s',
          boxShadow: '0 0 60px rgba(167,139,250,0.8)',
          pointerEvents: 'none'
        }} />
      )}

      {/* THRIVE wordmark */}
      {step >= 4 && (
        <div style={{
          position: 'relative',
          fontSize: 'clamp(1rem, 3vw, 1.4rem)',
          fontWeight: 900,
          letterSpacing: '0.6em',
          color: 'rgba(255,255,255,0.9)',
          opacity: step >= 4 ? 1 : 0,
          transform: step >= 4 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.5s ease',
          marginBottom: '1rem',
          textShadow: '0 0 40px rgba(167,139,250,0.5)',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          THRIVE
        </div>
      )}

      {step >= 5 && (
        <div style={{
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          color: 'rgba(196,181,253,0.5)',
          fontWeight: 600,
          opacity: step >= 5 ? 1 : 0,
          transition: 'opacity 1.5s ease',
          marginBottom: '3rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          INTELLIGENT OPERATIONS AUTOMATIONS
        </div>
      )}

      {step >= 6 && (
        <button
          onClick={onComplete}
          style={{
            background: 'rgba(109,40,217,0.2)',
            border: '1px solid rgba(167,139,250,0.3)',
            color: 'rgba(196,181,253,0.8)',
            padding: '0.75rem 2rem',
            borderRadius: 8,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            cursor: 'pointer',
            opacity: step >= 6 ? 1 : 0,
            transition: 'opacity 1s ease',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
          ENTER THE COMMAND CENTER
        </button>
      )}
    </div>
  )
}

const SECTIONS = [
  { id: 'hero', label: 'HOME' },
  { id: 'problem', label: 'THE PROBLEM' },
  { id: 'solution', label: 'THE SOLUTION' },
  { id: 'systems', label: 'SYSTEMS' },
  { id: 'roi', label: 'THE ROI' },
  { id: 'pricing', label: 'PRICING' },
  { id: 'launch', label: 'LAUNCH' },
]

export default function ThrivePage() {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'site'>('loading')
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem('thriveIntroSeen')
    if (seen) {
      setPhase('site')
    } else {
      setPhase('intro')
    }
  }, [])

  const handleIntroComplete = () => {
    localStorage.setItem('thriveIntroSeen', 'true')
    setPhase('site')
  }

  const replayIntro = () => {
    localStorage.removeItem('thriveIntroSeen')
    setPhase('intro')
  }

  const navigateTo = (index: number) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const observers = sectionsRef.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(i) },
        { threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [phase])

  const glass: React.CSSProperties = {
    background: 'rgba(1,0,8,0.78)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(109,40,217,0.1)',
    borderRadius: 14,
  }

  return (
    <div style={{ background: '#010006', color: 'white', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* Webb telescope background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/textures/webb-deep-field.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.35) saturate(1.4)',
        transform: 'scale(1.05)',
      }} />

      {/* Dark overlay for depth */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, rgba(1,0,8,0.3) 0%, rgba(1,0,8,0.7) 100%)' }} />

      {/* 3D Canvas - ATLAS only */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 18], fov: 50, near: 0.1, far: 1000 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, powerPreference: 'high-performance', alpha: true }}
            style={{ background: 'transparent' }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <Scene phase={phase} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Intro sequence */}
      {phase === 'intro' && <IntroSequence onComplete={handleIntroComplete} />}

      {/* Main site - only shown after intro */}
      {phase === 'site' && (
        <>
          {/* NAV */}
          <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(1,0,6,0.6)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(109,40,217,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigateTo(0)}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #DDD6FE, #4C1D95)', boxShadow: '0 0 12px rgba(109,40,217,0.9)' }} />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.2em' }}>THRIVE</span>
            </div>
            <div style={{ display: 'flex', gap: '0.15rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SECTIONS.map((s, i) => (
                <button key={s.id} onClick={() => navigateTo(i)}
                  style={{ background: activeSection === i ? 'rgba(109,40,217,0.15)' : 'none', border: activeSection === i ? '1px solid rgba(109,40,217,0.3)' : '1px solid transparent', borderRadius: 20, padding: '0.22rem 0.55rem', color: activeSection === i ? '#C4B5FD' : 'rgba(255,255,255,0.22)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap' }}>
                  {s.label}
                </button>
              ))}
            </div>
            <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(76,29,149,0.5)', border: '1px solid rgba(109,40,217,0.4)', color: 'rgba(196,181,253,0.9)', padding: '0.45rem 1rem', borderRadius: 7, textDecoration: 'none', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
              LAUNCH CALL
            </a>
          </nav>

          <div style={{ position: 'relative', zIndex: 2 }}>

            {/* HERO */}
            <section ref={el => { sectionsRef.current[0] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '9rem 3rem 5rem', maxWidth: 580 }}>
              <div>
                <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: 'rgba(196,181,253,0.5)', fontWeight: 700, marginBottom: '1.5rem' }}>
                  INTELLIGENT OPERATIONS AUTOMATIONS
                </div>
                <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', fontWeight: 900, lineHeight: 0.97, letterSpacing: '-0.04em', marginBottom: '1.4rem', textShadow: '0 0 80px rgba(109,40,217,0.4)' }}>
                  Your business.<br />
                  <span style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 50%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Fully automated.
                  </span>
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.9, marginBottom: '2.5rem', maxWidth: 420 }}>
                  Custom intelligent systems that eliminate manual work, capture every lead, and run your operations on autopilot.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => navigateTo(6)}
                    style={{ background: 'linear-gradient(135deg, #3B0F8C, #5B21B6)', border: 'none', color: 'white', padding: '0.875rem 2rem', borderRadius: 9, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 40px rgba(91,33,182,0.5)', letterSpacing: '0.1em' }}>
                    ENTER COMMAND CENTER
                  </button>
                  <button onClick={() => navigateTo(1)}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', padding: '0.875rem 1.5rem', borderRadius: 9, fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                    THE PROBLEM
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
                  {[['163x', 'ROI'], ['40hrs', 'Saved/month'], ['4min', 'Response time'], ['48hrs', 'To deploy']].map(([num, label]) => (
                    <div key={label}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#A78BFA', letterSpacing: '-0.04em', textShadow: '0 0 20px rgba(167,139,250,0.4)' }}>{num}</div>
                      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PROBLEM */}
            <section ref={el => { sectionsRef.current[1] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
              <div style={{ maxWidth: 820, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: '#F87171', fontWeight: 700, marginBottom: '0.875rem' }}>THE PROBLEM</div>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                    Your team is doing work<br /><span style={{ color: 'rgba(255,255,255,0.15)' }}>that machines should handle.</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { icon: '⏳', title: 'Missed Leads', desc: 'Leads call after hours. No response. By morning they hired someone else.' },
                    { icon: '📋', title: 'Manual Follow-Up', desc: 'Your team manually chasing estimates and invoices every single day.' },
                    { icon: '⚙️', title: 'Ops Chaos', desc: 'Six tools. No source of truth. You as the bottleneck between everything.' },
                    { icon: '💸', title: 'Revenue Leakage', desc: 'Roofing companies lose $780K per year average to missed leads alone.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} style={{ ...glass, padding: '1.4rem' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>{icon}</div>
                      <h3 style={{ fontWeight: 800, marginBottom: '0.45rem', color: '#F87171', fontSize: '0.85rem', letterSpacing: '0.02em' }}>{title}</h3>
                      <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SOLUTION */}
            <section ref={el => { sectionsRef.current[2] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
              <div style={{ maxWidth: 820, width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: '#34D399', fontWeight: 700, marginBottom: '0.875rem' }}>THE SOLUTION</div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.2rem' }}>
                  One intelligent system.<br /><span style={{ color: '#34D399' }}>Running everything.</span>
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.85, maxWidth: 480, margin: '0 auto 2.5rem' }}>
                  Custom automation built for your exact business. Every lead captured. Every follow-up sent. Everything tracked.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[['01', 'Discovery', 'Map every manual process costing you time.'], ['02', 'Build', 'Custom systems. 2 to 4 weeks.'], ['03', 'Deploy', 'Live fast. Tracked against ROI from day one.']].map(([num, title, desc]) => (
                    <div key={title} style={{ ...glass, padding: '1.5rem 1.25rem' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'rgba(52,211,153,0.1)', marginBottom: '0.35rem', letterSpacing: '-0.06em' }}>{num}</div>
                      <h3 style={{ fontWeight: 700, color: '#34D399', marginBottom: '0.4rem', fontSize: '0.82rem' }}>{title}</h3>
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SYSTEMS */}
            <section ref={el => { sectionsRef.current[3] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
              <div style={{ maxWidth: 820, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: '#60A5FA', fontWeight: 700, marginBottom: '0.875rem' }}>THE SYSTEMS</div>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                    Built once.<br /><span style={{ color: '#60A5FA' }}>Deployed infinitely.</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { name: 'Lead Capture Engine', desc: 'Every lead responded to in under 4 minutes. 24 hours a day.', color: '#60A5FA' },
                    { name: 'Follow-Up Automation', desc: 'Estimates, invoices, callbacks. All automatic. Zero manual work.', color: '#A78BFA' },
                    { name: 'Ops Command Center', desc: 'One screen. Your entire business in real time.', color: '#34D399' },
                    { name: 'Invoice Collection', desc: 'Automatic payment reminders. Cash flow on autopilot.', color: '#FBBF24' },
                    { name: 'Client Updates', desc: 'Automated job status to clients at every milestone.', color: '#F87171' },
                    { name: 'AI Document Scanner', desc: 'Phone camera to searchable database in seconds.', color: '#60A5FA' },
                  ].map(({ name, desc, color }) => (
                    <div key={name} style={{ ...glass, padding: '1.25rem', borderLeft: '2px solid ' + color + '45' }}>
                      <h3 style={{ fontWeight: 700, color, marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.02em' }}>{name}</h3>
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ROI */}
            <section ref={el => { sectionsRef.current[4] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
              <div style={{ maxWidth: 820, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: '#FBBF24', fontWeight: 700, marginBottom: '0.875rem' }}>THE MATH</div>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                    The numbers<br /><span style={{ color: '#FBBF24' }}>do not lie.</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.1rem' }}>
                  {[
                    { industry: 'Roofing', annual: 780000, cost: 11964, roi: '163x', color: '#FBBF24' },
                    { industry: 'Landscaping', annual: 124800, cost: 11964, roi: '26x', color: '#34D399' },
                    { industry: 'Construction', annual: 1560000, cost: 29964, roi: '52x', color: '#60A5FA' },
                  ].map(({ industry, annual, cost, roi, color }) => (
                    <div key={industry} style={{ ...glass, padding: '1.75rem', border: '1px solid ' + color + '18' }}>
                      <div style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.18)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{industry}</div>
                      <div style={{ fontSize: '3.2rem', fontWeight: 900, color, lineHeight: 0.95, marginBottom: '1.25rem', textShadow: '0 0 30px ' + color + '40' }}>{roi}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.5rem 0.65rem', background: 'rgba(248,113,113,0.06)', borderRadius: 6, border: '1px solid rgba(248,113,113,0.1)' }}>
                          <span style={{ color: 'rgba(248,113,113,0.55)' }}>Revenue lost per year</span>
                          <span style={{ color: '#FCA5A5', fontWeight: 700 }}>${annual.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.5rem 0.65rem', background: 'rgba(109,40,217,0.06)', borderRadius: 6, border: '1px solid rgba(109,40,217,0.12)' }}>
                          <span style={{ color: 'rgba(167,139,250,0.55)' }}>Thrive annual cost</span>
                          <span style={{ color: '#A78BFA', fontWeight: 700 }}>${cost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PRICING */}
            <section ref={el => { sectionsRef.current[5] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
              <div style={{ maxWidth: 820, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: '#A78BFA', fontWeight: 700, marginBottom: '0.875rem' }}>INVESTMENT</div>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                    One closed job.<br /><span style={{ color: '#A78BFA' }}>Pays for everything.</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                  {[
                    { name: 'SMB', setup: '$4,997', monthly: '$997/mo', desc: 'Roofing, landscaping, service businesses under 20 people.', color: '#60A5FA', highlighted: false },
                    { name: 'MID-MARKET', setup: '$2,997', monthly: '$797/mo', desc: 'Construction, insurance, growing service companies.', color: '#A78BFA', highlighted: true },
                    { name: 'COMMERCIAL', setup: '$14,997', monthly: '$2,497/mo', desc: 'Large commercial, multi-location, enterprise-ready.', color: '#FBBF24', highlighted: false },
                  ].map(({ name, setup, monthly, desc, color, highlighted }) => (
                    <div key={name} style={{ ...glass, padding: '1.75rem', border: highlighted ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(255,255,255,0.03)', boxShadow: highlighted ? '0 0 40px rgba(109,40,217,0.15)' : 'none', transform: highlighted ? 'scale(1.02)' : 'none' }}>
                      <div style={{ fontSize: '0.56rem', letterSpacing: '0.22em', color, fontWeight: 700, marginBottom: '0.75rem' }}>{name}</div>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color, lineHeight: 0.95, marginBottom: '0.2rem', textShadow: '0 0 18px ' + color + '30' }}>{setup}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginBottom: '1.1rem' }}>setup + {monthly}</div>
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{desc}</p>
                      <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', textAlign: 'center', padding: '0.7rem', borderRadius: 7, textDecoration: 'none', fontWeight: 700, fontSize: '0.7rem', background: highlighted ? 'linear-gradient(135deg, #3B0F8C, #5B21B6)' : 'transparent', color: highlighted ? 'white' : color, border: highlighted ? 'none' : '1px solid ' + color + '30', letterSpacing: '0.1em' }}>
                        BOOK A CALL
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* LAUNCH */}
            <section ref={el => { sectionsRef.current[6] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center' }}>
              <div style={{ maxWidth: 580 }}>
                <div style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: '#34D399', fontWeight: 700, marginBottom: '1.75rem' }}>READY TO LAUNCH</div>
                <h2 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)', fontWeight: 900, lineHeight: 0.97, letterSpacing: '-0.04em', marginBottom: '1.25rem' }}>
                  Stop managing.<br />
                  <span style={{ background: 'linear-gradient(135deg, #34D399, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Start commanding.
                  </span>
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.85, marginBottom: '2.5rem' }}>
                  Free 20-minute strategy call. We map your highest-impact automation opportunities. No obligation. Just the plan.
                </p>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', background: 'linear-gradient(135deg, #34D399, #3B0F8C)', color: 'white', padding: '1rem 2.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: '0.82rem', boxShadow: '0 0 50px rgba(52,211,153,0.25)', letterSpacing: '0.1em' }}>
                  BOOK YOUR FREE STRATEGY CALL
                </a>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.1)', marginTop: '1.25rem', letterSpacing: '0.05em' }}>
                  casey.gallagher@thriveautomation.agency
                </p>
              </div>
            </section>

          </div>

          {/* Replay intro button */}
          <button onClick={replayIntro}
            style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 50, background: 'rgba(1,0,8,0.6)', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 6, padding: '0.35rem 0.7rem', color: 'rgba(255,255,255,0.15)', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            REPLAY INTRO
          </button>
        </>
      )}

      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #010006; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #010006; }
        ::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.2); border-radius: 1px; }
      \`}</style>
    </div>
  )
}
`

fs.writeFileSync('app/page.tsx', page, 'utf8')
console.log('Cinematic experience built')
