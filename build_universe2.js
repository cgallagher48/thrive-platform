const fs = require('fs')

const universe = `'use client'
import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Cloud, Sphere, MeshDistortMaterial, Float, Trail, PointMaterial, Points, Billboard, Text } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { BlendFunction } from 'postprocessing'

// ATLAS Core - the command star
function ATLASCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.05
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08)
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.2) * 0.05
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.15
      ring2Ref.current.rotation.y = t * 0.1
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 128, 128]} />
        <MeshDistortMaterial
          color="#5B21B6"
          emissive="#7B3FE4"
          emissiveIntensity={2.5}
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#A56EFF" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#7B3FE4" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* Rings */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.4, 0.025, 16, 200]} />
        <meshBasicMaterial color="#A56EFF" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.2, 0.015, 16, 200]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>

      {/* Energy particles orbiting */}
      <OrbitalParticles radius={2.0} count={300} color="#A56EFF" speed={0.8} />
      <OrbitalParticles radius={3.5} count={200} color="#60a5fa" speed={-0.5} />

      {/* Point light from ATLAS */}
      <pointLight color="#7B3FE4" intensity={8} distance={30} />
      <pointLight color="#A56EFF" intensity={4} distance={20} position={[2, 1, 2]} />
    </group>
  )
}

function OrbitalParticles({ radius, count, color, speed }: { radius: number; count: number; color: string; speed: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const spread = (Math.random() - 0.5) * 0.4
    positions[i * 3] = Math.cos(angle) * (radius + spread)
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3
    positions[i * 3 + 2] = Math.sin(angle) * (radius + spread)
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * speed * 0.3
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// Rocky planet with realistic surface
function RockyPlanet({ position, size, color, emissive, speed, tiltAngle = 0 }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = t * speed
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.3 + position[0]) * 0.15
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, tiltAngle]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.3}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[size * 1.08, 32, 32]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

// Gas giant with bands
function GasGiant({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = t * 0.08
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2.2
      ringRef.current.rotation.z = t * 0.05
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial
          color="#c4783c"
          emissive="#8B4513"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      {/* Saturn-like rings */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.8, 0.35, 2, 200]} />
        <meshStandardMaterial color="#d4a76a" transparent opacity={0.5} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.18, 32, 32]} />
        <meshBasicMaterial color="#f0a050" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#f0a050" intensity={0.5} distance={8} />
    </group>
  )
}

// Ice planet
function IcePlanet({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.12
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshStandardMaterial
          color="#a8d8ea"
          emissive="#4a9aba"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshBasicMaterial color="#60c8f0" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#80d8ff" intensity={1.5} distance={6} />
    </group>
  )
}

// Volumetric nebula
function Nebula() {
  const ref1 = useRef<THREE.Mesh>(null)
  const ref2 = useRef<THREE.Mesh>(null)
  const ref3 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref1.current) ref1.current.rotation.z = t * 0.01
    if (ref2.current) ref2.current.rotation.z = -t * 0.008
    if (ref3.current) ref3.current.rotation.y = t * 0.005
  })

  return (
    <group>
      <mesh ref={ref1} position={[-15, 5, -40]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#4B0082" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ref2} position={[20, -8, -50]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#1a0a4a" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ref3} position={[0, 10, -60]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#0d0533" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Asteroid belt
function AsteroidBelt({ radius, count }: { radius: number; count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = new THREE.Object3D()

  useEffect(() => {
    if (!ref.current) return
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = radius + (Math.random() - 0.5) * 2
      dummy.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 0.8,
        Math.sin(angle) * r
      )
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.scale.setScalar(Math.random() * 0.06 + 0.01)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.03
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#6b5a3e" roughness={0.9} metalness={0.1} />
    </instancedMesh>
  )
}

// Camera controller
function CameraController({ section }: { section: number }) {
  const { camera } = useThree()
  const targetRef = useRef({ x: 0, y: 0, z: 8 })
  const mouseRef = useRef({ x: 0, y: 0 })

  const sectionPositions = [
    { x: 0, y: 0, z: 8 },
    { x: -3, y: 1, z: 12 },
    { x: 4, y: -1, z: 10 },
    { x: -2, y: 2, z: 6 },
    { x: 3, y: -2, z: 9 },
    { x: 0, y: 1, z: 7 },
    { x: 0, y: 0, z: 5 },
  ]

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.5
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 0.5
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useEffect(() => {
    const pos = sectionPositions[section] || sectionPositions[0]
    gsap.to(targetRef.current, { ...pos, duration: 2.5, ease: 'power3.inOut' })
  }, [section])

  useFrame(() => {
    camera.position.x += (targetRef.current.x + mouseRef.current.x - camera.position.x) * 0.04
    camera.position.y += (targetRef.current.y - mouseRef.current.y - camera.position.y) * 0.04
    camera.position.z += (targetRef.current.z - camera.position.z) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return null
}

// Hyperspace effect
function HyperspaceLanes({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const count = 500
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = Math.random() * -50
  }

  useFrame(() => {
    if (!ref.current || !active) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] += 2
      if (pos[i * 3 + 2] > 10) pos[i * 3 + 2] = -50
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// Main 3D scene
function Scene({ section, hyperspace }: { section: number; hyperspace: boolean }) {
  return (
    <>
      <CameraController section={section} />

      {/* Deep space background stars - multiple layers for parallax */}
      <Stars radius={200} depth={80} count={12000} factor={6} saturation={0.3} fade speed={0.5} />
      <Stars radius={80} depth={40} count={4000} factor={3} saturation={0.8} fade speed={0.2} />

      {/* Nebula volumes */}
      <Nebula />

      {/* ATLAS - the command star */}
      <ATLASCore />

      {/* Asteroid belt around ATLAS */}
      <AsteroidBelt radius={5.5} count={300} />

      {/* Solar system planets */}
      <RockyPlanet position={[-9, 2, -3]} size={0.45} color="#8B6355" emissive="#6B4335" speed={0.18} tiltAngle={0.3} />
      <RockyPlanet position={[11, -1, -2]} size={0.38} color="#A09070" emissive="#706050" speed={0.22} />
      <GasGiant position={[-14, 3, -8]} />
      <IcePlanet position={[16, -3, -6]} />
      <RockyPlanet position={[6, 5, -12]} size={0.3} color="#556B7A" emissive="#2A4A5A" speed={0.28} />
      <RockyPlanet position={[-8, -4, -10]} size={0.55} color="#7A5544" emissive="#5A3524" speed={0.12} />

      {/* Distant galaxy */}
      <mesh position={[30, 10, -80]} rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[8, 2, 8, 100]} />
        <meshBasicMaterial color="#2D1B69" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Hyperspace */}
      <HyperspaceLanes active={hyperspace} />

      {/* Lighting */}
      <ambientLight intensity={0.15} color="#0a0520" />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-20, 10, -10]} color="#4B0082" intensity={3} distance={60} />
      <pointLight position={[25, -5, -5]} color="#1a3a8a" intensity={2} distance={40} />

      {/* Post processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.8}
          radius={0.8}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
        />
        <Vignette eskil={false} offset={0.4} darkness={0.7} />
      </EffectComposer>
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
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  const navigateTo = (index: number) => {
    setHyperspace(true)
    setTimeout(() => setHyperspace(false), 800)
    setTimeout(() => {
      sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  useEffect(() => {
    const observers = sectionsRef.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(i) },
        { threshold: 0.4 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  const glass = {
    background: 'rgba(4,2,12,0.8)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(123,63,228,0.15)',
    borderRadius: 16,
  } as React.CSSProperties

  return (
    <div style={{ background: '#020008', color: 'white', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Fixed 3D canvas */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <Scene section={activeSection} hyperspace={hyperspace} />
          </Suspense>
        </Canvas>
      </div>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,0,8,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(123,63,228,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigateTo(0)}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #C090FF, #5B21B6)', boxShadow: '0 0 15px rgba(123,63,228,0.7)' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.15em', color: 'white' }}>THRIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => navigateTo(i)}
              style={{ background: activeSection === i ? 'rgba(123,63,228,0.2)' : 'none', border: activeSection === i ? '1px solid rgba(123,63,228,0.4)' : '1px solid transparent', borderRadius: 20, padding: '0.28rem 0.65rem', color: activeSection === i ? '#A56EFF' : 'rgba(255,255,255,0.3)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {s.label}
            </button>
          ))}
        </div>
        <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
          style={{ background: 'linear-gradient(135deg, #5B21B6, #7B3FE4)', color: 'white', padding: '0.55rem 1.2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem', boxShadow: '0 0 20px rgba(91,33,182,0.5)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          LAUNCH CALL
        </a>
      </nav>

      {/* SECTIONS */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <section ref={el => { sectionsRef.current[0] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: 'inline-block', background: 'rgba(123,63,228,0.1)', border: '1px solid rgba(123,63,228,0.25)', borderRadius: 100, padding: '0.35rem 1.1rem', marginBottom: '2rem', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(165,110,255,0.8)', fontWeight: 700 }}>
              INTELLIGENT OPERATIONS AUTOMATIONS
            </div>
            <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', marginBottom: '1.5rem', textShadow: '0 0 80px rgba(123,63,228,0.4)' }}>
              Your business.<br />
              <span style={{ background: 'linear-gradient(135deg, #A56EFF 0%, #60a5fa 50%, #A56EFF 100%)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>
                Fully automated.
              </span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: '3rem', maxWidth: 540, margin: '0 auto 3rem' }}>
              Custom intelligent systems that eliminate manual work, capture every lead, and run your operations on autopilot. For any business.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '5rem' }}>
              <button onClick={() => navigateTo(6)} style={{ background: 'linear-gradient(135deg, #5B21B6, #7B3FE4)', border: 'none', color: 'white', padding: '1rem 2.5rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 40px rgba(91,33,182,0.6)', letterSpacing: '0.08em', transition: 'all 0.2s' }}>
                ENTER THE COMMAND CENTER
              </button>
              <button onClick={() => navigateTo(1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', padding: '1rem 2rem', borderRadius: 10, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                SEE THE PROBLEM
              </button>
            </div>
            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['163x', 'ROI on recovered leads'], ['40hrs', 'Saved per month'], ['4 min', 'Lead response time'], ['48hrs', 'To go live']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#A56EFF', letterSpacing: '-0.03em', textShadow: '0 0 20px rgba(165,110,255,0.5)' }}>{num}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section ref={el => { sectionsRef.current[1] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 900, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#ef4444', fontWeight: 700, marginBottom: '1rem' }}>THE PROBLEM</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                Your team is doing work<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>that machines should handle.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '⏳', title: 'Missed Leads', desc: 'Leads calling after hours get no response. By morning they hired your competitor. Every missed call = lost revenue.' },
                { icon: '📋', title: 'Manual Follow-Up', desc: 'Your team manually chasing estimates, invoices, and callbacks every single day. This is not scalable.' },
                { icon: '⚙️', title: 'Ops Chaos', desc: 'Six different tools, no single source of truth, and you as the bottleneck between every system.' },
                { icon: '💸', title: 'Revenue Leakage', desc: 'Roofing companies lose $780K/year on average to missed and slow-responded leads. This is fixable.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ ...glass, padding: '1.75rem' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{icon}</div>
                  <h3 style={{ fontWeight: 800, marginBottom: '0.6rem', color: '#ef4444', fontSize: '0.95rem', letterSpacing: '0.03em' }}>{title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section ref={el => { sectionsRef.current[2] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#10b981', fontWeight: 700, marginBottom: '1rem' }}>THE SOLUTION</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              One intelligent system.<br /><span style={{ color: '#10b981' }}>Running everything.</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 3rem' }}>
              Thrive builds custom automation systems tailored to your exact business. Every lead captured. Every follow-up sent. Every invoice tracked. All automatic.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[['01', 'Discovery', 'We map every manual process costing you time and money.'], ['02', 'Build', 'Custom systems designed for your exact workflow. 2-4 weeks.'], ['03', 'Deploy', 'Live in 48 hours. Tracked against hard ROI from day one.']].map(([num, title, desc]) => (
                <div key={title} style={{ ...glass, padding: '2rem 1.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(16,185,129,0.15)', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>{num}</div>
                  <h3 style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SYSTEMS */}
        <section ref={el => { sectionsRef.current[3] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 900, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#60a5fa', fontWeight: 700, marginBottom: '1rem' }}>THE SYSTEMS</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                Built once.<br /><span style={{ color: '#60a5fa' }}>Deployed infinitely.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'Lead Capture Engine', desc: 'Every inbound lead captured and responded to in under 4 minutes. 24/7. Zero missed calls.', color: '#60a5fa' },
                { name: 'Follow-Up Automation', desc: 'Estimates, invoices, and callbacks handled automatically on your exact schedule.', color: '#A56EFF' },
                { name: 'Ops Command Center', desc: 'One screen. Your entire business in real time. No more tool-switching or manual reporting.', color: '#10b981' },
                { name: 'Invoice Collection', desc: 'Automatic payment reminders at 3, 7, and 14 days. Cash flow runs itself.', color: '#f59e0b' },
                { name: 'Client Updates', desc: 'Automated job status updates to clients. Zero calls asking "whats the status."', color: '#ef4444' },
                { name: 'AI Document Scanner', desc: 'Phone camera to searchable database. Find any file in plain English instantly.', color: '#60a5fa' },
              ].map(({ name, desc, color }) => (
                <div key={name} style={{ ...glass, padding: '1.5rem', borderLeft: '3px solid ' + color + '60' }}>
                  <h3 style={{ fontWeight: 700, color, marginBottom: '0.5rem', fontSize: '0.88rem', letterSpacing: '0.03em' }}>{name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI */}
        <section ref={el => { sectionsRef.current[4] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 900, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#f59e0b', fontWeight: 700, marginBottom: '1rem' }}>THE MATH</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                The numbers<br /><span style={{ color: '#f59e0b' }}>don't lie.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[
                { industry: 'Roofing', missed: 3, value: 5000, annual: 780000, cost: 11964, roi: '163x', color: '#f59e0b' },
                { industry: 'Landscaping', missed: 4, value: 600, annual: 124800, cost: 11964, roi: '26x', color: '#10b981' },
                { industry: 'Construction', missed: 2, value: 15000, annual: 1560000, cost: 29964, roi: '52x', color: '#60a5fa' },
              ].map(({ industry, missed, value, annual, cost, roi, color }) => (
                <div key={industry} style={{ ...glass, padding: '2rem', border: '1px solid ' + color + '25' }}>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{industry}</div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '1.5rem', textShadow: '0 0 30px ' + color + '60' }}>{roi}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[['Missed leads/week', missed], ['Avg job value', '\$' + value.toLocaleString()], ['Annual loss', '\$' + annual.toLocaleString()], ['Thrive annual cost', '\$' + cost.toLocaleString()]].map(([label, val], i) => (
                      <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: i >= 2 ? '0.6rem 0.75rem' : '0', background: i === 2 ? 'rgba(239,68,68,0.08)' : i === 3 ? 'rgba(123,63,228,0.08)' : 'transparent', borderRadius: i >= 2 ? 8 : 0, border: i === 2 ? '1px solid rgba(239,68,68,0.15)' : i === 3 ? '1px solid rgba(123,63,228,0.15)' : 'none' }}>
                        <span style={{ color: i === 2 ? 'rgba(239,68,68,0.7)' : i === 3 ? 'rgba(165,110,255,0.7)' : 'rgba(255,255,255,0.3)' }}>{String(label)}</span>
                        <span style={{ fontWeight: 700, color: i === 2 ? '#fca5a5' : i === 3 ? '#A56EFF' : 'white' }}>{String(val)}</span>
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
          <div style={{ maxWidth: 900, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#A56EFF', fontWeight: 700, marginBottom: '1rem' }}>INVESTMENT</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                One closed job.<br /><span style={{ color: '#A56EFF' }}>Pays for everything.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'SMB', setup: '\$4,997', monthly: '\$997/mo', desc: 'Roofing, landscaping, and service businesses under 20 people.', color: '#60a5fa', highlighted: false },
                { name: 'MID-MARKET', setup: '\$2,997', monthly: '\$797/mo', desc: 'Construction, insurance, and growing service companies.', color: '#A56EFF', highlighted: true },
                { name: 'COMMERCIAL', setup: '\$14,997', monthly: '\$2,497/mo', desc: 'Large commercial operations, multi-location, enterprise-ready.', color: '#f59e0b', highlighted: false },
              ].map(({ name, setup, monthly, desc, color, highlighted }) => (
                <div key={name} style={{ ...glass, padding: '2rem', border: highlighted ? '1px solid rgba(165,110,255,0.35)' : '1px solid rgba(255,255,255,0.05)', boxShadow: highlighted ? '0 0 50px rgba(123,63,228,0.2)' : 'none', transform: highlighted ? 'scale(1.02)' : 'none' }}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color, fontWeight: 700, marginBottom: '1rem' }}>{name}</div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '0.25rem', textShadow: '0 0 20px ' + color + '40' }}>{setup}</div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>setup + {monthly}</div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, marginBottom: '1.5rem' }}>{desc}</p>
                  <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem', background: highlighted ? 'linear-gradient(135deg, #5B21B6, #7B3FE4)' : 'transparent', color: highlighted ? 'white' : color, border: highlighted ? 'none' : '1px solid ' + color + '40', letterSpacing: '0.08em' }}>
                    BOOK A CALL
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LAUNCH */}
        <section ref={el => { sectionsRef.current[6] = el }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#10b981', fontWeight: 700, marginBottom: '2rem' }}>READY TO LAUNCH</div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
              Stop managing.<br />
              <span style={{ background: 'linear-gradient(135deg, #10b981, #A56EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Start commanding.
              </span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, marginBottom: '3rem' }}>
              Book a free 20-minute strategy call. We map your highest-impact automation opportunities. No obligation. No fluff. Just the plan.
            </p>
            <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #5B21B6)', color: 'white', padding: '1.2rem 3rem', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 0 60px rgba(16,185,129,0.35)', letterSpacing: '0.08em' }}>
              BOOK YOUR FREE STRATEGY CALL
            </a>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', marginTop: '1.5rem' }}>
              casey.gallagher@thriveautomation.agency
            </p>
          </div>
        </section>

      </div>

      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #020008; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020008; }
        ::-webkit-scrollbar-thumb { background: rgba(123,63,228,0.3); border-radius: 2px; }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      \`}</style>
    </div>
  )
}
`

fs.writeFileSync('app/page.tsx', universe, 'utf8')
console.log('Real universe homepage created')
