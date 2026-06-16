const fs = require('fs')

const page = `'use client'
import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BlendFunction, KernelSize } from 'postprocessing'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// ATLAS CORE - Living intelligence nucleus
// ============================================================
function AtlasCore({ atlasState }: { atlasState: number }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const stateColors = ['#1a0a2e', '#3B0F8C', '#5B21B6', '#7C3AED', '#A78BFA']
  const stateIntensities = [0.3, 0.8, 1.4, 2.2, 3.5]
  const stateSizes = [0.4, 0.6, 0.85, 1.1, 1.4]

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const s = atlasState

    if (coreRef.current) {
      coreRef.current.rotation.y = t * (0.05 + s * 0.04)
      coreRef.current.rotation.x = Math.sin(t * 0.3) * 0.1
      const breathe = 1 + Math.sin(t * (1 + s * 0.5)) * (0.03 + s * 0.02)
      const targetSize = stateSizes[Math.min(s, 4)]
      coreRef.current.scale.setScalar(breathe * targetSize)
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * (0.08 + s * 0.03)
      innerRef.current.rotation.z = t * 0.05
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.03
      outerRef.current.rotation.z = -t * 0.04
      outerRef.current.material.opacity = 0.1 + s * 0.04
    }
    if (pulseRef.current) {
      const pulse = Math.sin(t * 2) * 0.5 + 0.5
      pulseRef.current.scale.setScalar(1.2 + pulse * (0.3 + s * 0.2))
      pulseRef.current.material.opacity = (0.04 + s * 0.02) * (1 - pulse * 0.5)
    }
  })

  const color = stateColors[Math.min(atlasState, 4)]
  const intensity = stateIntensities[Math.min(atlasState, 4)]

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.9, 3]} />
        <meshStandardMaterial color="#7C3AED" emissive="#5B21B6" emissiveIntensity={0.4} wireframe transparent opacity={0.15} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.65, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 0.5} metalness={0.9} roughness={0.1} wireframe={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight color="#A78BFA" intensity={intensity * 3} distance={15} />
      <pointLight color="#ffffff" intensity={intensity} distance={5} />
    </group>
  )
}

// ============================================================
// NEURAL NETWORK - Connected intelligence nodes
// ============================================================
function NeuralNetwork({ atlasState }: { atlasState: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  const nodes = useMemo(() => [
    { pos: [-4, 1.5, -2] as [number,number,number], label: 'SALES', color: '#10b981', connections: [1, 2, 5] },
    { pos: [4, 1, -3] as [number,number,number], label: 'MARKETING', color: '#60A5FA', connections: [0, 3, 5] },
    { pos: [-3, -2, -1] as [number,number,number], label: 'OPERATIONS', color: '#A78BFA', connections: [0, 4, 5] },
    { pos: [3.5, -1.5, -2] as [number,number,number], label: 'FINANCE', color: '#FBBF24', connections: [1, 4, 5] },
    { pos: [0, -3, -2] as [number,number,number], label: 'SCHEDULING', color: '#F87171', connections: [2, 3, 5] },
    { pos: [0, 0, 0] as [number,number,number], label: 'ATLAS', color: '#A78BFA', connections: [] },
  ], [])

  const linePositions = useMemo(() => {
    const positions: number[] = []
    nodes.forEach((node, i) => {
      node.connections.forEach(j => {
        if (j > i) {
          positions.push(...node.pos, ...nodes[j].pos)
        }
      })
    })
    return new Float32Array(positions)
  }, [nodes])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.2
    }
    if (linesRef.current) {
      linesRef.current.material.opacity = 0.1 + atlasState * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#7C3AED" transparent opacity={0.2} />
      </lineSegments>
      {nodes.map((node, i) => (
        <NetworkNode
          key={i}
          position={node.pos}
          color={node.color}
          label={node.label}
          active={atlasState > i * 0.8}
          index={i}
        />
      ))}
    </group>
  )
}

function NetworkNode({ position, color, label, active, index }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3 + index
      const s = active ? 1 + Math.sin(t * 2 + index) * 0.1 : 0.6
      meshRef.current.scale.setScalar(s)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = active ? 0.15 + Math.sin(t * 1.5 + index) * 0.05 : 0.03
    }
  })

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color={active ? color : '#1a0a2e'}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 1.5 : 0}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {active && <pointLight color={color} intensity={1.5} distance={4} />}
    </group>
  )
}

// ============================================================
// DATA STREAMS - Energy flowing between nodes
// ============================================================
function DataStreams({ atlasState }: { atlasState: number }) {
  const count = 80
  const ref = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 5 + 1
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = Math.sin(angle) * radius
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }
    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!ref.current || atlasState < 1) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      const dist = Math.sqrt(pos[i*3]**2 + pos[i*3+1]**2 + pos[i*3+2]**2)
      if (dist > 6) {
        pos[i * 3] *= 0.1
        pos[i * 3 + 1] *= 0.1
        pos[i * 3 + 2] *= 0.1
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#A78BFA"
        size={0.04}
        transparent
        opacity={Math.min(atlasState * 0.25, 0.8)}
        sizeAttenuation
      />
    </points>
  )
}

// ============================================================
// BUSINESS SIMULATION - The actual sale
// ============================================================
function BusinessSimulation({ scene }: { scene: number }) {
  const leadsRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const leads = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 6,
    z: (Math.random() - 0.5) * 4,
    speed: Math.random() * 0.02 + 0.005,
    phase: Math.random() * Math.PI * 2,
    alive: true,
    captured: false,
  })), [])

  useFrame((state) => {
    if (!leadsRef.current) return
    const t = state.clock.getElapsedTime()

    leads.forEach((lead, i) => {
      const captured = scene >= 2
      const tx = captured ? 0 : lead.x + Math.sin(t * lead.speed + lead.phase) * 0.5
      const ty = captured ? 0 : lead.y + Math.cos(t * lead.speed + lead.phase) * 0.3
      const tz = captured ? 0 : lead.z

      dummy.position.set(tx, ty, tz)
      dummy.scale.setScalar(captured ? Math.max(0, 1 - (t % 3) * 0.5) : 0.08)
      dummy.updateMatrix()
      leadsRef.current!.setMatrixAt(i, dummy.matrix)

      const color = captured ? new THREE.Color('#10b981') : new THREE.Color('#ef4444')
      leadsRef.current!.setColorAt(i, color)
    })

    leadsRef.current.instanceMatrix.needsUpdate = true
    if (leadsRef.current.instanceColor) leadsRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={leadsRef} args={[undefined, undefined, 12]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial emissive="#ef4444" emissiveIntensity={2} color="#ef4444" />
    </instancedMesh>
  )
}

// ============================================================
// DEAD NODES - Scene 1 visual chaos
// ============================================================
function DeadNodes() {
  const nodes = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6] as [number,number,number],
    phase: Math.random() * Math.PI * 2,
    size: Math.random() * 0.12 + 0.04,
  })), [])

  return (
    <group>
      {nodes.map((node, i) => (
        <DeadNode key={i} position={node.pos} phase={node.phase} size={node.size} />
      ))}
    </group>
  )
}

function DeadNode({ position, phase, size }: { position: [number,number,number]; phase: number; size: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      const flicker = Math.sin(state.clock.getElapsedTime() * 3 + phase) > 0.7 ? 0.3 : 0.05
      ref.current.material.opacity = flicker
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.1} />
    </mesh>
  )
}

// ============================================================
// CAMERA RIG - Scroll-driven cinematic path
// ============================================================
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 2, z: 16 })

  const keyframes = [
    { x: 0, y: 2, z: 16, lx: 0, ly: 0, lz: 0 },
    { x: -3, y: 1, z: 12, lx: 0, ly: 0, lz: 0 },
    { x: 3, y: -1, z: 10, lx: 0, ly: 0, lz: 0 },
    { x: -5, y: 2, z: 6, lx: -2, ly: 0, lz: 0 },
    { x: 2, y: -2, z: 4, lx: 0, ly: -1, lz: 0 },
    { x: 0, y: 1, z: 3, lx: 0, ly: 0, lz: 0 },
    { x: 0, y: 0, z: 8, lx: 0, ly: 0, lz: 0 },
  ]

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.3
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useFrame(() => {
    const totalScenes = keyframes.length - 1
    const sceneF = scrollProgress * totalScenes
    const sceneIdx = Math.min(Math.floor(sceneF), totalScenes - 1)
    const t = sceneF - sceneIdx

    const a = keyframes[sceneIdx]
    const b = keyframes[Math.min(sceneIdx + 1, totalScenes)]

    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    const tx = a.x + (b.x - a.x) * ease + mouse.current.x
    const ty = a.y + (b.y - a.y) * ease + mouse.current.y
    const tz = a.z + (b.z - a.z) * ease

    current.current.x += (tx - current.current.x) * 0.04
    current.current.y += (ty - current.current.y) * 0.04
    current.current.z += (tz - current.current.z) * 0.04

    camera.position.set(current.current.x, current.current.y, current.current.z)

    const tlx = a.lx + (b.lx - a.lx) * ease
    const tly = a.ly + (b.ly - a.ly) * ease
    camera.lookAt(tlx, tly, 0)
  })

  return null
}

// ============================================================
// MAIN 3D SCENE
// ============================================================
function Scene({ scrollProgress, atlasState, scene }: { scrollProgress: number; atlasState: number; scene: number }) {
  return (
    <>
      <CameraRig scrollProgress={scrollProgress} />
      <Stars radius={200} depth={80} count={8000} factor={5} saturation={0.2} fade speed={0.1} />
      {scene === 0 && <DeadNodes />}
      <NeuralNetwork atlasState={atlasState} />
      <DataStreams atlasState={atlasState} />
      <AtlasCore atlasState={atlasState} />
      <BusinessSimulation scene={scene} />
      <ambientLight intensity={0.05} color="#04010F" />
      <directionalLight position={[10, 10, 5]} intensity={0.2} color="#C4B5FD" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.5} radius={0.85} kernelSize={KernelSize.LARGE} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0005, 0.0005)} />
        <Vignette eskil={false} offset={0.3} darkness={0.9} />
      </EffectComposer>
    </>
  )
}

// ============================================================
// SCENE UI - Text overlays per scene
// ============================================================
const SCENES = [
  {
    label: 'THE PROBLEM',
    headline: 'Every day, businesses bleed revenue they never see.',
    sub: 'Missed calls. Lost leads. No follow-up. Manual everything.',
    sim: { show: true, type: 'missed', text: 'Incoming call... no answer', result: '-$4,200 lost' }
  },
  {
    label: 'THE SIGNAL',
    headline: 'There is another way.',
    sub: 'ATLAS activates. Systems begin connecting. Nothing is missed.',
    sim: { show: true, type: 'captured', text: 'Incoming call... captured', result: 'Lead secured' }
  },
  {
    label: 'THE NETWORK',
    headline: 'One intelligence. Every system. Connected.',
    sub: 'Sales. Operations. Marketing. Finance. All orchestrated.',
    sim: { show: false, type: '', text: '', result: '' }
  },
  {
    label: 'AUTOMATION',
    headline: 'Watch what happens when nothing falls through the cracks.',
    sub: '',
    sim: { show: true, type: 'flow', text: 'Lead enters system', result: 'Response: 4 min' }
  },
  {
    label: 'INTELLIGENCE LAYER',
    headline: 'This is not automation. This is orchestration.',
    sub: 'ATLAS routes, scores, decides, and executes. No human required.',
    sim: { show: false, type: '', text: '', result: '' }
  },
  {
    label: 'COMMAND CENTER',
    headline: 'Your business. One screen.',
    sub: 'Every system. Every lead. Every job. Every invoice. Live.',
    sim: { show: false, type: '', text: '', result: '' }
  },
  {
    label: 'LAUNCH',
    headline: 'Stop managing. Start commanding.',
    sub: 'Free 20-minute strategy call. No obligation. Just the plan.',
    sim: { show: false, type: '', text: '', result: '' }
  },
]

function SimulationDisplay({ sim, scene }: { sim: typeof SCENES[0]['sim']; scene: number }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100)
    return () => clearInterval(interval)
  }, [])

  if (!sim.show) return null

  const isCapture = sim.type === 'captured'
  const isMissed = sim.type === 'missed'
  const isFlow = sim.type === 'flow'

  return (
    <div style={{
      background: 'rgba(1,0,8,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(109,40,217,0.2)',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      maxWidth: 320,
      marginTop: '2rem',
    }}>
      {isFlow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Lead captured', time: '0:00', color: '#10b981' },
            { label: 'AI responds', time: '0:04', color: '#A78BFA' },
            { label: 'Follow-up sent', time: '0:30', color: '#60A5FA' },
            { label: 'Appointment booked', time: '2:15', color: '#FBBF24' },
            { label: 'Job confirmed', time: '24:00', color: '#10b981' },
          ].map(({ label, time, color }, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: tick > i * 8 ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: '0 0 6px ' + color }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{label}</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{time}</span>
            </div>
          ))}
        </div>
      )}

      {(isMissed || isCapture) && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isMissed ? '#ef4444' : '#10b981', animation: 'pulse 1s infinite', boxShadow: '0 0 8px ' + (isMissed ? '#ef4444' : '#10b981') }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
              {isMissed ? 'INCOMING CALL' : 'INCOMING CALL'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: isMissed ? '#ef4444' : '#10b981', fontWeight: 700, marginBottom: '0.4rem' }}>
            {sim.text}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isMissed ? '#FCA5A5' : '#6EE7B7' }}>
            {sim.result}
          </div>
          {isCapture && (
            <div style={{ marginTop: '0.6rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
              Response time: <span style={{ color: '#A78BFA', fontWeight: 700 }}>4 minutes</span>
              <span style={{ marginLeft: '0.5rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.2)' }}>2+ hours</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function ThrivePage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentScene, setCurrentScene] = useState(0)
  const [atlasState, setAtlasState] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [introSeen, setIntroSeen] = useState(true)
  const [showIntro, setShowIntro] = useState(false)
  const [introStep, setIntroStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem('thriveIntroSeen')
    if (!seen) {
      setShowIntro(true)
      setIntroSeen(false)
      runIntro()
    }
  }, [])

  const runIntro = () => {
    const tl = gsap.timeline()
    tl.to({}, { duration: 1.5, onComplete: () => setIntroStep(1) })
    tl.to({}, { duration: 0.8, onComplete: () => setIntroStep(2) })
    tl.to({}, { duration: 2, onComplete: () => setIntroStep(3) })
    tl.to({}, { duration: 1.5, onComplete: () => setIntroStep(4) })
    tl.to({}, { duration: 1.5, onComplete: () => setIntroStep(5) })
    tl.to({}, { duration: 1, onComplete: () => {
      setIntroStep(6)
    }})
  }

  const completeIntro = () => {
    localStorage.setItem('thriveIntroSeen', 'true')
    setShowIntro(false)
    setIntroSeen(true)
  }

  const replayIntro = () => {
    localStorage.removeItem('thriveIntroSeen')
    setShowIntro(true)
    setIntroSeen(false)
    setIntroStep(0)
    setTimeout(runIntro, 100)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const progress = Math.min(scrollTop / maxScroll, 1)
      setScrollProgress(progress)

      const scene = Math.min(Math.floor(progress * 7), 6)
      setCurrentScene(scene)

      const atlasStates = [0, 1, 2, 3, 4, 4, 4]
      setAtlasState(atlasStates[scene])
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentSceneData = SCENES[currentScene]

  const glass: React.CSSProperties = {
    background: 'rgba(1,0,8,0.78)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(109,40,217,0.1)',
    borderRadius: 14,
  }

  return (
    <div style={{ background: '#010006', color: 'white', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* FIXED 3D CANVAS */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {mounted && (
          <Canvas
            camera={{ position: [0, 2, 16], fov: 55, near: 0.1, far: 500 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, powerPreference: 'high-performance', alpha: true }}
            style={{ background: 'transparent' }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <Scene scrollProgress={scrollProgress} atlasState={atlasState} scene={currentScene} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* DARK BASE */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(1,0,8,0.2) 0%, rgba(1,0,8,0.85) 100%)', pointerEvents: 'none' }} />

      {/* INTRO SEQUENCE */}
      {showIntro && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: introStep >= 3 ? 'transparent' : 'black', transition: 'background 2s ease' }}>
          {introStep < 3 && <div style={{ position: 'absolute', inset: 0, background: 'black', opacity: introStep >= 2 ? 0 : 1, transition: 'opacity 2s ease', pointerEvents: 'none' }} />}
          {introStep >= 1 && (
            <div style={{ width: introStep >= 2 ? 200 : 3, height: introStep >= 2 ? 200 : 3, borderRadius: '50%', background: 'radial-gradient(circle, #fff, #A78BFA 40%, transparent 70%)', opacity: introStep >= 3 ? 0 : 1, transition: 'all 2s cubic-bezier(0.16,1,0.3,1), opacity 1s ease 1.5s', boxShadow: '0 0 60px rgba(167,139,250,0.8)', position: 'absolute', pointerEvents: 'none' }} />
          )}
          {introStep >= 4 && (
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 900, letterSpacing: '0.5em', color: 'rgba(255,255,255,0.9)', textShadow: '0 0 40px rgba(167,139,250,0.6)', marginBottom: '0.75rem', opacity: 1, transition: 'opacity 1s' }}>THRIVE</div>
              {introStep >= 5 && <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(196,181,253,0.5)', fontWeight: 600, marginBottom: '2.5rem' }}>INTELLIGENT OPERATIONS AUTOMATIONS</div>}
              {introStep >= 6 && (
                <button onClick={completeIntro} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(167,139,250,0.3)', color: 'rgba(196,181,253,0.8)', padding: '0.8rem 2.2rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', cursor: 'pointer' }}>
                  ENTER THE COMMAND CENTER
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* FIXED NAV */}
      {!showIntro && (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(1,0,6,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(109,40,217,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #DDD6FE, #4C1D95)', boxShadow: '0 0 10px rgba(109,40,217,0.9)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em' }}>THRIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', fontWeight: 600 }}>
              {currentSceneData.label}
            </div>
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {SCENES.map((_, i) => (
                <div key={i} style={{ width: i === currentScene ? 16 : 4, height: 4, borderRadius: 2, background: i === currentScene ? '#A78BFA' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(76,29,149,0.5)', border: '1px solid rgba(109,40,217,0.4)', color: 'rgba(196,181,253,0.9)', padding: '0.42rem 0.9rem', borderRadius: 7, textDecoration: 'none', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em' }}>
            LAUNCH CALL
          </a>
        </nav>
      )}

      {/* SCROLLABLE CONTENT - 700vh */}
      <div ref={containerRef} style={{ height: '700vh', position: 'relative' }}>

        {/* FIXED SCENE UI */}
        {!showIntro && (
          <div style={{ position: 'fixed', top: '50%', left: '3rem', transform: 'translateY(-50%)', zIndex: 10, maxWidth: 480, pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.3em', color: 'rgba(167,139,250,0.5)', fontWeight: 700, marginBottom: '0.875rem', transition: 'all 0.5s' }}>
              {currentSceneData.label}
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1rem', transition: 'all 0.5s', textShadow: '0 0 60px rgba(109,40,217,0.3)' }}>
              {currentSceneData.headline}
            </h2>
            {currentSceneData.sub && (
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, marginBottom: '1rem', maxWidth: 400, transition: 'all 0.5s' }}>
                {currentSceneData.sub}
              </p>
            )}
            <div style={{ pointerEvents: 'all' }}>
              <SimulationDisplay sim={currentSceneData.sim} scene={currentScene} />
            </div>
            {currentScene === 6 && (
              <div style={{ marginTop: '2rem', pointerEvents: 'all' }}>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #3B0F8C)', color: 'white', padding: '1rem 2.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 0 40px rgba(16,185,129,0.3)', letterSpacing: '0.1em' }}>
                  BOOK YOUR FREE STRATEGY CALL
                </a>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.12)', marginTop: '0.875rem', letterSpacing: '0.05em' }}>
                  casey.gallagher@thriveautomation.agency
                </p>
              </div>
            )}
          </div>
        )}

        {/* SCROLL PROGRESS BAR */}
        {!showIntro && (
          <div style={{ position: 'fixed', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {SCENES.map((s, i) => (
              <div key={i} onClick={() => {
                const target = (i / 6) * (document.body.scrollHeight - window.innerHeight)
                window.scrollTo({ top: target, behavior: 'smooth' })
              }}
                style={{ width: 3, height: i === currentScene ? 24 : 8, borderRadius: 2, background: i === currentScene ? '#A78BFA' : 'rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}

      </div>

      {/* REPLAY INTRO */}
      {!showIntro && (
        <button onClick={replayIntro} style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 50, background: 'rgba(1,0,8,0.6)', border: '1px solid rgba(109,40,217,0.12)', borderRadius: 6, padding: '0.3rem 0.6rem', color: 'rgba(255,255,255,0.12)', fontSize: '0.45rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          REPLAY INTRO
        </button>
      )}

      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #010006; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #010006; }
        ::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.2); border-radius: 1px; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
      \`}</style>
    </div>
  )
}
`

fs.writeFileSync('app/page.tsx', page, 'utf8')
console.log('BUILT')
