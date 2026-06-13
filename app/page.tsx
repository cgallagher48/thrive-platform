'use client'
import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Stars, useTexture, MeshDistortMaterial, Float } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, GodRays, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { BlendFunction, KernelSize } from 'postprocessing'
import { generatePlanetTexture, generateNebulaTexture } from '@/lib/textureGen'

// ATLAS - Orbital Command Station
function ATLASMegastructure() {
  const coreRef = useRef<THREE.Mesh>(null)
  const innerShellRef = useRef<THREE.Mesh>(null)
  const outerShellRef = useRef<THREE.Mesh>(null)
  const disc1Ref = useRef<THREE.Mesh>(null)
  const disc2Ref = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) groupRef.current.rotation.y = t * 0.018
    if (innerShellRef.current) {
      innerShellRef.current.rotation.y = -t * 0.025
      innerShellRef.current.rotation.x = t * 0.012
    }
    if (outerShellRef.current) {
      outerShellRef.current.rotation.z = t * 0.008
      outerShellRef.current.rotation.x = -t * 0.006
    }
    if (disc1Ref.current) disc1Ref.current.rotation.z = t * 0.06
    if (disc2Ref.current) disc2Ref.current.rotation.z = -t * 0.04
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04)
  })

  return (
    <group ref={groupRef} position={[2, -0.3, 0]}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshBasicMaterial color="#C4B5FD" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh ref={innerShellRef}>
        <icosahedronGeometry args={[1.1, 4]} />
        <meshStandardMaterial color="#1a0a3a" emissive="#4C1D95" emissiveIntensity={0.6} metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh ref={outerShellRef}>
        <icosahedronGeometry args={[1.15, 4]} />
        <meshStandardMaterial color="#7C3AED" emissive="#5B21B6" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} wireframe transparent opacity={0.18} />
      </mesh>
      <mesh ref={disc1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.09, 8, 128]} />
        <meshStandardMaterial color="#0a0520" emissive="#6D28D9" emissiveIntensity={2.0} metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh ref={disc2Ref} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[1.95, 0.05, 8, 128]} />
        <meshStandardMaterial color="#050215" emissive="#3B82F6" emissiveIntensity={1.6} metalness={0.98} roughness={0.02} />
      </mesh>
      {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3]}>
          <boxGeometry args={[0.05, 0.05, 0.45]} />
          <meshStandardMaterial color="#1a0a3a" emissive="#7C3AED" emissiveIntensity={0.8} metalness={0.99} roughness={0.01} />
        </mesh>
      ))}
      {[0,1,2,3,4,5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.1, Math.sin(i * 0.8) * 0.6, Math.sin(a) * 1.1]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#A78BFA" />
          </mesh>
        )
      })}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.07, 8]} />
        <meshStandardMaterial color="#0d0526" emissive="#4C1D95" emissiveIntensity={0.5} metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.07, 8]} />
        <meshStandardMaterial color="#0d0526" emissive="#4C1D95" emissiveIntensity={0.5} metalness={0.95} roughness={0.15} />
      </mesh>
      <EnergyStream radius={1.52} count={500} color="#A78BFA" speed={0.9} tilt={Math.PI/2} />
      <EnergyStream radius={1.97} count={350} color="#60A5FA" speed={-0.6} tilt={Math.PI/2.4} />
      <pointLight color="#A78BFA" intensity={12} distance={20} />
      <pointLight color="#ffffff" intensity={5} distance={8} />
      <pointLight color="#3B82F6" intensity={2} distance={15} position={[3, 2, 1]} />
      <pointLight color="#6D28D9" intensity={3} distance={12} position={[-2, -1, 2]} />
    </group>
  )
}

function EnergyStream({ radius, count, color, speed, tilt = 0 }: { radius: number; count: number; color: string; speed: number; tilt?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const jitter = (Math.random() - 0.5) * 0.06
      pos[i * 3] = Math.cos(angle) * (radius + jitter)
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.08
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter)
    }
    return pos
  }, [count, radius])

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.getElapsedTime() * speed * 0.15
      ref.current.rotation.x = tilt
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.008} transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}
function SpaceDust() {
  const ref = useRef<THREE.Points>(null)
  const count = 3000
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20
    }
    return pos
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.003
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.001) * 0.01
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a899cc" size={0.03} transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}

// Hyperspace travel effect
function HyperspaceTravel({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const count = 800
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = -(Math.random() * 100)
    }
    return pos
  }, [])

  useFrame(() => {
    if (!ref.current || !active) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] += 4
      if (pos[i * 3 + 2] > 15) pos[i * 3 + 2] = -100
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.04} transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

// Cinematic camera
function CinematicCamera({ section, hyperspace }: { section: number; hyperspace: boolean }) {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0, z: 14 })
  const mouse = useRef({ x: 0, y: 0 })
  const drift = useRef({ x: 0, y: 0 })

  const positions = [
    { x: 0, y: 0.5, z: 14 },
    { x: -4, y: 1, z: 18 },
    { x: 5, y: -1.5, z: 16 },
    { x: -2, y: 2, z: 12 },
    { x: 4, y: -2, z: 15 },
    { x: 0, y: 1, z: 13 },
    { x: 0, y: 0, z: 10 },
  ]

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5)
      mouse.current.y = (e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useEffect(() => {
    const pos = positions[section] || positions[0]
    gsap.to(target.current, { ...pos, duration: 2.8, ease: 'power3.inOut' })
  }, [section])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Slow cinematic drift
    drift.current.x = Math.sin(t * 0.08) * 0.4
    drift.current.y = Math.cos(t * 0.06) * 0.25

    const parallaxX = mouse.current.x * 0.6
    const parallaxY = -mouse.current.y * 0.4

    camera.position.x += (target.current.x + parallaxX + drift.current.x - camera.position.x) * 0.03
    camera.position.y += (target.current.y + parallaxY + drift.current.y - camera.position.y) * 0.03
    camera.position.z += (target.current.z - camera.position.z) * 0.03
    camera.lookAt(0, 0, 0)
  })

  return null
}

// Distant galaxy
function DistantGalaxy({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null)
  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null
    return generateNebulaTexture('rgb(60,20,100)', 'rgb(20,10,60)', 99)
  }, [])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.getElapsedTime() * 0.005
  })

  return (
    <group ref={ref} position={position} rotation={[0.8, 0.3, 0]}>
      <mesh>
        <torusGeometry args={[12, 4, 8, 128]} />
        <meshBasicMaterial
          map={texture || undefined}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial
          map={texture || undefined}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// Main scene
function Scene({ section, hyperspace }: { section: number; hyperspace: boolean }) {
  return (
    <>
      <CinematicCamera section={section} hyperspace={hyperspace} />

      {/* Multi-layer deep space starfield */}
      <Stars radius={300} depth={100} count={15000} factor={8} saturation={0.15} fade speed={0.3} />
      <Stars radius={120} depth={60} count={5000} factor={4} saturation={0.4} fade speed={0.1} />
      <Stars radius={50} depth={25} count={2000} factor={2} saturation={0.7} fade speed={0.05} />

      {/* Space dust */}
      <SpaceDust />



      {/* ATLAS Dyson Megastructure */}
      <ATLASMegastructure />



      {/* Solar system - photorealistic planets */}
      {/* <Planet
        position={[-12, 2, -4]}
        type="rocky"
        size={0.55}
        rotSpeed={0.15}
        tilt={0.3}
        atmosphereColor="#ff6644"
        atmosphereOpacity={0.05}
      />
      <Planet
        position={[14, -2, -3]}
        type="ocean"
        size={0.65}
        rotSpeed={0.12}
        atmosphereColor="#4488ff"
        atmosphereOpacity={0.12}
      />
      <Planet
        position={[-18, 3, -10]}
        type="gas"
        size={1.3}
        rotSpeed={0.25}
        hasRings
        ringColor="#c4903a"
        atmosphereColor="#c47820"
        atmosphereOpacity={0.06}
      />
      <Planet
        position={[20, -4, -8]}
        type="ice"
        size={0.7}
        rotSpeed={0.18}
        atmosphereColor="#80d0ff"
        atmosphereOpacity={0.15}
      />
      <Planet
        position={[8, 6, -15]}
        type="desert"
        size={0.4}
        rotSpeed={0.22}
        atmosphereColor="#ff8844"
        atmosphereOpacity={0.04}
      />
      <Planet
        position={[-10, -5, -12]}
        type="lava"
        size={0.48}
        rotSpeed={0.3}
        atmosphereColor="#ff4400"
        atmosphereOpacity={0.15}
      />
      <Planet
        position={[25, 5, -15]}
        type="rocky"
        size={0.35}
        rotSpeed={0.4}
        tilt={0.6}
        atmosphereColor="#888888"
        atmosphereOpacity={0.03}
      />

      {/* Distant galaxies */}
      {/* <DistantGalaxy position={[60, 20, -150]} />
      <DistantGalaxy position={[-80, -15, -180]} />

      {/* Hyperspace effect */}
      <HyperspaceTravel active={hyperspace} />

      {/* Scene lighting */}
      <ambientLight intensity={0.08} color="#080320" />
      <directionalLight position={[20, 15, 10]} intensity={0.6} color="#ffffff" castShadow />
      <pointLight position={[-30, 15, -15]} color="#3B0F8C" intensity={2} distance={80} />
      <pointLight position={[35, -10, -10]} color="#0a1a4a" intensity={1.5} distance={60} />
    </>
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

export default function UniversePage() {
  const [activeSection, setActiveSection] = useState(0)
  const [hyperspace, setHyperspace] = useState(false)
  const [phase, setPhase] = useState('loading')
  const [mounted, setMounted] = useState(false)
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

  const navigateTo = (index: number) => {
    setHyperspace(true)
    setTimeout(() => setHyperspace(false), 900)
    setTimeout(() => sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' }), 150)
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
  }, [])

  const glass: React.CSSProperties = {
    background: 'rgba(2,0,10,0.82)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: '1px solid rgba(123,63,228,0.12)',
    borderRadius: 16,
  }

  return (
    <div style={{ background: '#010006', color: 'white', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
            {/* Webb deep field background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: "url('/textures/webb-deep-field.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.28) saturate(1.6)',
        transform: 'scale(1.06)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, rgba(1,0,8,0.15) 0%, rgba(1,0,8,0.6) 100%)' }} />

      {/* Fixed cinematic 3D canvas */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {mounted && (
          <Canvas
            shadows
            camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 1000 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
              powerPreference: 'high-performance',
            }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <Scene section={activeSection} hyperspace={hyperspace}  />
              <EffectComposer>
                <Bloom
                  luminanceThreshold={0.15}
                  luminanceSmoothing={0.85}
                  intensity={2.2}
                  radius={0.85}
                  kernelSize={KernelSize.LARGE}
                />
                <ChromaticAberration
                  blendFunction={BlendFunction.NORMAL}
                  offset={new THREE.Vector2(0.0008, 0.0008)}
                />
                <Noise opacity={0.025} />
                <Vignette eskil={false} offset={0.35} darkness={0.75} />
              </EffectComposer>
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(1,0,6,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(123,63,228,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigateTo(0)}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #C090FF, #5B21B6)', boxShadow: '0 0 14px rgba(123,63,228,0.8)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.18em' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '0.15rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => navigateTo(i)}
              style={{ background: activeSection === i ? 'rgba(123,63,228,0.18)' : 'none', border: activeSection === i ? '1px solid rgba(123,63,228,0.35)' : '1px solid transparent', borderRadius: 20, padding: '0.25rem 0.6rem', color: activeSection === i ? '#C4B5FD' : 'rgba(255,255,255,0.25)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap' }}>
              {s.label}
            </button>
          ))}
        </div>
        <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
          style={{ background: 'linear-gradient(135deg, #4C1D95, #6D28D9)', color: 'white', padding: '0.5rem 1.1rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.72rem', boxShadow: '0 0 18px rgba(91,33,182,0.45)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          LAUNCH CALL
        </a>
      </nav>

      {/* SCROLLABLE CONTENT */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <section ref={el => { sectionsRef.current[0] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9rem 2rem 5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 740 }}>
            <div style={{ display: 'inline-block', background: 'rgba(91,33,182,0.12)', border: '1px solid rgba(123,63,228,0.2)', borderRadius: 100, padding: '0.32rem 1rem', marginBottom: '2.2rem', fontSize: '0.62rem', letterSpacing: '0.28em', color: 'rgba(196,181,253,0.75)', fontWeight: 700 }}>
              INTELLIGENT OPERATIONS AUTOMATIONS
            </div>
            <h1 style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.04em', marginBottom: '1.5rem', textShadow: '0 0 100px rgba(123,63,228,0.35)' }}>
              Your business.<br />
              <span style={{ background: 'linear-gradient(135deg, #C4B5FD 0%, #818CF8 40%, #A78BFA 70%, #C4B5FD 100%)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>
                Fully automated.
              </span>
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.85, marginBottom: '3rem', maxWidth: 500, margin: '0 auto 3rem' }}>
              Custom intelligent systems that eliminate manual work, capture every lead, and run your operations on autopilot. For any business.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '5rem' }}>
              <button onClick={() => navigateTo(6)}
                style={{ background: 'linear-gradient(135deg, #4C1D95, #6D28D9)', border: 'none', color: 'white', padding: '0.95rem 2.4rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 50px rgba(91,33,182,0.55)', letterSpacing: '0.1em', transition: 'all 0.2s' }}>
                ENTER THE COMMAND CENTER
              </button>
              <button onClick={() => navigateTo(1)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', padding: '0.95rem 1.8rem', borderRadius: 10, fontSize: '0.82rem', cursor: 'pointer' }}>
                SEE THE PROBLEM
              </button>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['163x', 'ROI on recovered leads'], ['40hrs', 'Saved per month'], ['4 min', 'Lead response time'], ['48hrs', 'To deployment']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#A78BFA', letterSpacing: '-0.04em', textShadow: '0 0 25px rgba(167,139,250,0.5)' }}>{num}</div>
                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section ref={el => { sectionsRef.current[1] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 860, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: '#F87171', fontWeight: 700, marginBottom: '0.875rem' }}>THE PROBLEM</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                Your team is doing work<br /><span style={{ color: 'rgba(255,255,255,0.18)' }}>that machines should handle.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.875rem' }}>
              {[
                { icon: '⏳', title: 'Missed Leads', desc: 'Leads calling after hours get no response. By morning they hired your competitor. Every missed call is lost revenue.' },
                { icon: '📋', title: 'Manual Follow-Up', desc: 'Your team manually chasing estimates, invoices, and callbacks every single day. This does not scale.' },
                { icon: '⚙️', title: 'Ops Chaos', desc: 'Six different tools, no single source of truth, and you as the bottleneck between every system and person.' },
                { icon: '💸', title: 'Revenue Leakage', desc: 'Roofing companies lose $780K/year average to missed and slow-responded leads. This is completely fixable.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ ...glass, padding: '1.6rem' }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '0.7rem' }}>{icon}</div>
                  <h3 style={{ fontWeight: 800, marginBottom: '0.55rem', color: '#F87171', fontSize: '0.9rem', letterSpacing: '0.02em' }}>{title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section ref={el => { sectionsRef.current[2] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 860, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: '#34D399', fontWeight: 700, marginBottom: '0.875rem' }}>THE SOLUTION</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.4rem' }}>
              One intelligent system.<br /><span style={{ color: '#34D399' }}>Running everything.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.85, maxWidth: 520, margin: '0 auto 3rem' }}>
              Thrive builds custom automation systems for your exact business. Every lead captured. Every follow-up sent. Every invoice tracked. All automatic.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
              {[['01', 'Discovery', 'We map every manual process costing you time and money. Surgical diagnosis.'], ['02', 'Build', 'Custom systems designed for your exact workflow. 2 to 4 weeks.'], ['03', 'Deploy', 'Live fast. Tracked against hard ROI metrics from day one.']].map(([num, title, desc]) => (
                <div key={title} style={{ ...glass, padding: '1.75rem 1.4rem' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'rgba(52,211,153,0.12)', marginBottom: '0.4rem', letterSpacing: '-0.06em' }}>{num}</div>
                  <h3 style={{ fontWeight: 700, color: '#34D399', marginBottom: '0.45rem', fontSize: '0.88rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SYSTEMS */}
        <section ref={el => { sectionsRef.current[3] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 860, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: '#60A5FA', fontWeight: 700, marginBottom: '0.875rem' }}>THE SYSTEMS</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                Built once.<br /><span style={{ color: '#60A5FA' }}>Deployed infinitely.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.875rem' }}>
              {[
                { name: 'Lead Capture Engine', desc: 'Every inbound lead captured and responded to in under 4 minutes. 24 hours a day, 7 days a week.', color: '#60A5FA' },
                { name: 'Follow-Up Automation', desc: 'Estimates, invoices, and callbacks handled automatically on your exact schedule. Zero manual work.', color: '#A78BFA' },
                { name: 'Ops Command Center', desc: 'One screen. Your entire business in real time. No more tool-switching or manual status reports.', color: '#34D399' },
                { name: 'Invoice Collection', desc: 'Automatic payment reminders at day 3, 7, and 14. Cash flow runs completely on autopilot.', color: '#FBBF24' },
                { name: 'Client Updates', desc: 'Automated job status updates to clients at every milestone. Zero calls asking what the status is.', color: '#F87171' },
                { name: 'AI Document Scanner', desc: 'Phone camera to searchable database. Find any document in plain English in under 3 seconds.', color: '#60A5FA' },
              ].map(({ name, desc, color }) => (
                <div key={name} style={{ ...glass, padding: '1.5rem', borderLeft: '2px solid ' + color + '50' }}>
                  <h3 style={{ fontWeight: 700, color, marginBottom: '0.45rem', fontSize: '0.85rem', letterSpacing: '0.02em' }}>{name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI */}
        <section ref={el => { sectionsRef.current[4] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 860, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: '#FBBF24', fontWeight: 700, marginBottom: '0.875rem' }}>THE MATH</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                The numbers<br /><span style={{ color: '#FBBF24' }}>do not lie.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {[
                { industry: 'Roofing', missed: 3, value: 5000, annual: 780000, cost: 11964, roi: '163x', color: '#FBBF24' },
                { industry: 'Landscaping', missed: 4, value: 600, annual: 124800, cost: 11964, roi: '26x', color: '#34D399' },
                { industry: 'Construction', missed: 2, value: 15000, annual: 1560000, cost: 29964, roi: '52x', color: '#60A5FA' },
              ].map(({ industry, missed, value, annual, cost, roi, color }) => (
                <div key={industry} style={{ ...glass, padding: '1.875rem', border: '1px solid ' + color + '20' }}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>{industry}</div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, color, lineHeight: 0.95, marginBottom: '1.4rem', textShadow: '0 0 35px ' + color + '50' }}>{roi}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[['Missed leads per week', missed], ['Average job value', '$' + value.toLocaleString()], ['Revenue lost per year', '$' + annual.toLocaleString()], ['Thrive annual cost', '$' + cost.toLocaleString()]].map(([label, val], i) => (
                      <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: i >= 2 ? '0.55rem 0.7rem' : '0', background: i === 2 ? 'rgba(248,113,113,0.07)' : i === 3 ? 'rgba(109,40,217,0.07)' : 'transparent', borderRadius: i >= 2 ? 7 : 0, border: i === 2 ? '1px solid rgba(248,113,113,0.12)' : i === 3 ? '1px solid rgba(109,40,217,0.15)' : 'none' }}>
                        <span style={{ color: i === 2 ? 'rgba(248,113,113,0.6)' : i === 3 ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.25)' }}>{String(label)}</span>
                        <span style={{ fontWeight: 700, color: i === 2 ? '#FCA5A5' : i === 3 ? '#A78BFA' : 'rgba(255,255,255,0.8)' }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section ref={el => { sectionsRef.current[5] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 860, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: '#A78BFA', fontWeight: 700, marginBottom: '0.875rem' }}>INVESTMENT</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                One closed job.<br /><span style={{ color: '#A78BFA' }}>Pays for everything.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: '1.25rem' }}>
              {[
                { name: 'SMB', setup: '$4,997', monthly: '$997/mo', desc: 'Roofing, landscaping, and service businesses under 20 people.', color: '#60A5FA', highlighted: false },
                { name: 'MID-MARKET', setup: '$2,997', monthly: '$797/mo', desc: 'Construction, insurance, and growing service companies.', color: '#A78BFA', highlighted: true },
                { name: 'COMMERCIAL', setup: '$14,997', monthly: '$2,497/mo', desc: 'Large commercial operations, multi-location, enterprise-ready.', color: '#FBBF24', highlighted: false },
              ].map(({ name, setup, monthly, desc, color, highlighted }) => (
                <div key={name} style={{ ...glass, padding: '1.875rem', border: highlighted ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.04)', boxShadow: highlighted ? '0 0 50px rgba(109,40,217,0.18)' : 'none', transform: highlighted ? 'scale(1.025)' : 'none' }}>
                  <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', color, fontWeight: 700, marginBottom: '0.875rem' }}>{name}</div>
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, color, lineHeight: 0.95, marginBottom: '0.2rem', textShadow: '0 0 20px ' + color + '35' }}>{setup}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', marginBottom: '1.25rem' }}>setup + {monthly}</div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, marginBottom: '1.4rem' }}>{desc}</p>
                  <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem', background: highlighted ? 'linear-gradient(135deg, #4C1D95, #6D28D9)' : 'transparent', color: highlighted ? 'white' : color, border: highlighted ? 'none' : '1px solid ' + color + '35', letterSpacing: '0.1em' }}>
                    BOOK A CALL
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LAUNCH */}
        <section ref={el => { sectionsRef.current[6] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: '#34D399', fontWeight: 700, marginBottom: '2rem' }}>READY TO LAUNCH</div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.8rem)', fontWeight: 900, lineHeight: 0.97, letterSpacing: '-0.04em', marginBottom: '1.4rem' }}>
              Stop managing.<br />
              <span style={{ background: 'linear-gradient(135deg, #34D399, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Start commanding.
              </span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.85, marginBottom: '3rem' }}>
              Free 20-minute strategy call. We map your highest-impact automation opportunities. No obligation. No pitch. Just the plan.
            </p>
            <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'linear-gradient(135deg, #34D399, #4C1D95)', color: 'white', padding: '1.15rem 3rem', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 0 60px rgba(52,211,153,0.3)', letterSpacing: '0.1em' }}>
              BOOK YOUR FREE STRATEGY CALL
            </a>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.12)', marginTop: '1.4rem', letterSpacing: '0.05em' }}>
              casey.gallagher@thriveautomation.agency
            </p>
          </div>
        </section>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #010006; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #010006; }
        ::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.3); border-radius: 2px; }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}
