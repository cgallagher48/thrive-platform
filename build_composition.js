const fs = require('fs')

const page = `'use client'
import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { BlendFunction, KernelSize } from 'postprocessing'

// ============================================================
// SIMULATION STATE - global, lives outside React
// ============================================================
interface Signal {
  id: number
  type: 'missed' | 'captured'
  progress: number
  speed: number
  lane: number // which conduit lane 0-4
  alive: boolean
  hitAtlas: boolean
  revenueSpawned: boolean
}

interface RevenueParticle {
  id: number
  lane: number
  progress: number
  speed: number
  alive: boolean
}

let signals: Signal[] = []
let revenueParticles: RevenueParticle[] = []
let nextId = 0
let lastMissed = 0
let lastCaptured = 0
let atlasReaction = 0

// Left side incoming lanes (missed calls)
const LEFT_LANES: [number,number,number][][] = [
  // Lane 0: top-left incoming
  [[-12, 3.5, 0], [-6, 2.5, 0], [-1.8, 0.8, 0]],
  // Lane 1: mid-left incoming
  [[-12, 1, 0], [-6, 0.5, 0], [-1.8, 0, 0]],
  // Lane 2: bottom-left incoming
  [[-12, -2, 0], [-6, -1.5, 0], [-1.8, -0.8, 0]],
  // Lane 3: far top-left
  [[-12, 5, 0], [-6, 3.5, 0], [-1.8, 1.5, 0]],
  // Lane 4: far bottom-left
  [[-12, -4, 0], [-6, -3, 0], [-1.8, -1.5, 0]],
]

// Right side outgoing lanes (captured outcomes)
const RIGHT_LANES: [number,number,number][][] = [
  // Lane 0: Lead Captured
  [[1.8, 1.2, 0], [6, 2.5, 0], [11, 3.5, 0]],
  // Lane 1: Follow-Up Sent
  [[1.8, 0.4, 0], [6, 1.2, 0], [11, 2, 0]],
  // Lane 2: Appointment Booked
  [[1.8, -0.4, 0], [6, -0.5, 0], [11, 0, 0]],
  // Lane 3: Job Confirmed
  [[1.8, -1.0, 0], [6, -1.8, 0], [11, -2, 0]],
  // Lane 4: Revenue Secured
  [[1.8, -1.6, 0], [6, -3, 0], [11, -3.8, 0]],
]

const LEFT_LABELS = ['MISSED CALL', 'LOST LEAD', 'NO FOLLOW-UP', 'MISSED OPPORTUNITY', 'NO RESPONSE']
const LEFT_VALUES = ['-$4,200', '-$1,800', '-$3,100', '-$6,400', '-$2,900']
const RIGHT_LABELS = ['LEAD CAPTURED', 'FOLLOW-UP SENT', 'APPOINTMENT BOOKED', 'JOB CONFIRMED', 'REVENUE SECURED']
const RIGHT_VALUES = ['+$4,200', 'AI Agent Active', 'On Calendar', 'Scheduled', '+$4,200']

function lerpPath(path: [number,number,number][], t: number): [number,number,number] {
  if (path.length < 2) return path[0]
  const seg = (path.length - 1) * t
  const idx = Math.min(Math.floor(seg), path.length - 2)
  const frac = seg - idx
  const a = path[idx]
  const b = path[idx + 1]
  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ]
}

// ============================================================
// CONDUIT TUBES - Energy pipelines left and right
// ============================================================
function ConduitSystem({ scrollDepth }: { scrollDepth: number }) {
  // How many lanes are active based on scroll
  const activeLanes = Math.min(Math.floor(scrollDepth * 6) + 1, 5)

  return (
    <group>
      {/* LEFT conduits - problem side */}
      {LEFT_LANES.slice(0, activeLanes).map((lane, i) => (
        <Conduit key={'l'+i} path={lane} color="#ef4444" active={true} side="left" index={i} />
      ))}
      {/* RIGHT conduits - solution side */}
      {RIGHT_LANES.slice(0, activeLanes).map((lane, i) => (
        <Conduit key={'r'+i} path={lane} color="#10b981" active={true} side="right" index={i} />
      ))}
    </group>
  )
}

function Conduit({ path, color, active, side, index }: {
  path: [number,number,number][], color: string, active: boolean, side: string, index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const curve = useMemo(() => {
    const pts = path.map(p => new THREE.Vector3(...p))
    return new THREE.CatmullRomCurve3(pts)
  }, [path])

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 30, 0.022, 8, false), [curve])
  const glowGeo = useMemo(() => new THREE.TubeGeometry(curve, 30, 0.055, 8, false), [curve])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(t * 1.5 + index * 0.8) * 0.2 + atlasReaction * 1.5
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.04 + Math.sin(t * 1.2 + index) * 0.015 + atlasReaction * 0.06
    }
  })

  return (
    <group>
      {/* Glow tube */}
      <mesh geometry={glowGeo} ref={glowRef}>
        <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      {/* Core tube */}
      <mesh geometry={tubeGeo} ref={meshRef}>
        <meshStandardMaterial
          color={side === 'left' ? '#3a0a0a' : '#0a2a1a'}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  )
}

// ============================================================
// SIGNAL PARTICLES - traveling through conduits
// ============================================================
function SignalSystem({ scrollDepth }: { scrollDepth: number }) {
  const missedRef = useRef<THREE.InstancedMesh>(null)
  const capturedRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const MAX = 20

  useFrame((state) => {
    const now = state.clock.getElapsedTime() * 1000
    const activeLanes = Math.min(Math.floor(scrollDepth * 6) + 1, 5)

    // Spawn missed signals
    if (now - lastMissed > 1400) {
      lastMissed = now
      const lane = Math.floor(Math.random() * activeLanes)
      signals.push({
        id: nextId++, type: 'missed',
        progress: 0, speed: 0.004 + Math.random() * 0.002,
        lane, alive: true, hitAtlas: false, revenueSpawned: false
      })
    }

    // Spawn captured signals (more as scroll deepens)
    const captureRate = 800 + (1 - scrollDepth) * 800
    if (now - lastCaptured > captureRate) {
      lastCaptured = now
      const lane = Math.floor(Math.random() * activeLanes)
      signals.push({
        id: nextId++, type: 'captured',
        progress: 0, speed: 0.005 + Math.random() * 0.003,
        lane, alive: true, hitAtlas: false, revenueSpawned: false
      })
    }

    // Update signals
    signals.forEach(s => {
      s.progress += s.speed

      // Hit atlas at progress 1.0 (end of left conduit)
      if (s.type === 'missed' && s.progress >= 1.0 && !s.hitAtlas) {
        s.hitAtlas = true
        s.alive = false // missed signals die at atlas
        atlasReaction = Math.max(atlasReaction, 0.3)
      }
      if (s.type === 'captured' && s.progress >= 1.0) {
        s.alive = false
        atlasReaction = Math.min(atlasReaction + 0.4, 1)
        // Spawn revenue particles on all right lanes
        if (!s.revenueSpawned) {
          s.revenueSpawned = true
          for (let i = 0; i < 5; i++) {
            revenueParticles.push({
              id: nextId++, lane: i,
              progress: 0, speed: 0.004 + Math.random() * 0.003,
              alive: true
            })
          }
        }
      }
    })

    // Decay atlas reaction
    atlasReaction = Math.max(atlasReaction - 0.008, 0)

    // Update revenue particles
    revenueParticles.forEach(p => {
      p.progress += p.speed
      if (p.progress >= 1) p.alive = false
    })

    // Cleanup
    signals = signals.filter(s => s.alive && s.progress < 1.2).slice(-MAX)
    revenueParticles = revenueParticles.filter(p => p.alive).slice(-MAX)

    // Render missed signals (traveling left → atlas)
    if (missedRef.current) {
      const missed = signals.filter(s => s.type === 'missed')
      for (let i = 0; i < MAX; i++) {
        const s = missed[i]
        if (!s) { dummy.scale.setScalar(0); dummy.updateMatrix(); missedRef.current.setMatrixAt(i, dummy.matrix); continue }
        const lane = LEFT_LANES[Math.min(s.lane, LEFT_LANES.length-1)]
        const pos = lerpPath(lane, Math.min(s.progress, 1))
        dummy.position.set(...pos)
        const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 12 + i) * 0.3
        dummy.scale.setScalar(0.08 * pulse)
        dummy.updateMatrix()
        missedRef.current.setMatrixAt(i, dummy.matrix)
      }
      missedRef.current.instanceMatrix.needsUpdate = true
    }

    // Render captured signals + revenue (going right)
    if (capturedRef.current) {
      const all = [
        ...signals.filter(s => s.type === 'captured'),
        ...revenueParticles.map(p => ({ ...p, type: 'revenue' as const }))
      ]
      for (let i = 0; i < MAX; i++) {
        const s = all[i]
        if (!s) { dummy.scale.setScalar(0); dummy.updateMatrix(); capturedRef.current.setMatrixAt(i, dummy.matrix); continue }
        const lane = RIGHT_LANES[Math.min(s.lane, RIGHT_LANES.length-1)]
        const pos = lerpPath(lane, Math.min(s.progress, 1))
        dummy.position.set(...pos)
        const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 10 + i) * 0.25
        dummy.scale.setScalar(0.09 * pulse)
        dummy.updateMatrix()
        capturedRef.current.setMatrixAt(i, dummy.matrix)
        capturedRef.current.setColorAt(i, new THREE.Color(s.type === 'revenue' ? '#10b981' : '#60A5FA'))
      }
      capturedRef.current.instanceMatrix.needsUpdate = true
      if (capturedRef.current.instanceColor) capturedRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      <instancedMesh ref={missedRef} args={[undefined, undefined, MAX]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </instancedMesh>
      <instancedMesh ref={capturedRef} args={[undefined, undefined, MAX]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial vertexColors color="#10b981" />
      </instancedMesh>
    </group>
  )
}

// ============================================================
// ATLAS - Engineered machine, not a sphere
// ============================================================
function Atlas({ scrollDepth }: { scrollDepth: number }) {
  const group = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)
  const ring4 = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const outer = useRef<THREE.Mesh>(null)
  const hex1 = useRef<THREE.Mesh>(null)
  const hex2 = useRef<THREE.Mesh>(null)
  const light1 = useRef<THREE.PointLight>(null)
  const light2 = useRef<THREE.PointLight>(null)

  const scale = 0.6 + scrollDepth * 0.9 // grows as scroll deepens

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const r = atlasReaction
    const breathe = 1 + Math.sin(t * 0.8) * 0.025 + r * 0.12

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.08
      coreRef.current.scale.setScalar(scale * breathe)
      const m = coreRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.5 + scrollDepth * 2 + r * 5
    }
    if (ring1.current) {
      ring1.current.rotation.z = t * 0.25
      ring1.current.rotation.x = Math.PI / 2.1 + Math.sin(t * 0.12) * 0.04
      ring1.current.scale.setScalar(scale * 1.5)
      const m = ring1.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.8 + r * 3
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.18
      ring2.current.rotation.x = Math.PI / 3.2
      ring2.current.rotation.y = t * 0.06
      ring2.current.scale.setScalar(scale * 2.0)
      const m = ring2.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.5 + r * 2.5
    }
    if (ring3.current) {
      ring3.current.rotation.z = t * 0.12
      ring3.current.rotation.x = Math.PI / 4
      ring3.current.rotation.y = -t * 0.08
      ring3.current.scale.setScalar(scale * 2.6)
      const m = ring3.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.2 + r * 2
    }
    if (ring4.current) {
      ring4.current.rotation.z = -t * 0.08
      ring4.current.rotation.y = t * 0.05
      ring4.current.scale.setScalar(scale * 3.2)
      const m = ring4.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.8 + r * 1.5
    }
    if (inner.current) {
      inner.current.rotation.y = -t * 0.1
      inner.current.rotation.x = t * 0.06
      inner.current.scale.setScalar(scale * 1.1)
      const m = inner.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.15 + r * 0.1
    }
    if (outer.current) {
      outer.current.rotation.x = t * 0.04
      outer.current.rotation.z = -t * 0.03
      outer.current.scale.setScalar(scale * 1.4)
      const m = outer.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.07 + r * 0.05
    }
    if (hex1.current) {
      hex1.current.rotation.z = t * 0.15
      hex1.current.rotation.x = Math.PI * 0.3 + t * 0.04
      hex1.current.scale.setScalar(scale * 1.8)
    }
    if (hex2.current) {
      hex2.current.rotation.z = -t * 0.1
      hex2.current.rotation.y = t * 0.07
      hex2.current.scale.setScalar(scale * 2.2)
    }
    if (light1.current) {
      light1.current.intensity = 8 + scrollDepth * 12 + r * 20
    }
    if (light2.current) {
      light2.current.intensity = 3 + scrollDepth * 5 + r * 8
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Outermost sparse wireframe */}
      <mesh ref={hex2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#2D0A6B" emissive="#1a0535" emissiveIntensity={0.2} wireframe transparent opacity={0.06} />
      </mesh>

      {/* Second wireframe shell */}
      <mesh ref={hex1}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#4C1D95" emissive="#3B0F8C" emissiveIntensity={0.4} wireframe transparent opacity={0.1} />
      </mesh>

      {/* Outer energy shell */}
      <mesh ref={outer}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial color="#5B21B6" emissive="#4C1D95" emissiveIntensity={0.5} transparent opacity={0.07} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Inner shell */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color="#7C3AED" emissive="#5B21B6" emissiveIntensity={0.8} transparent opacity={0.15} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Mechanical rings - the engineered look */}
      <mesh ref={ring4}>
        <torusGeometry args={[1, 0.008, 8, 200]} />
        <meshStandardMaterial color="#C4B5FD" emissive="#8B5CF6" emissiveIntensity={0.8} metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[1, 0.012, 10, 200]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={1.2} metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1, 0.018, 12, 200]} />
        <meshStandardMaterial color="#818CF8" emissive="#4F46E5" emissiveIntensity={1.5} metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh ref={ring1}>
        <torusGeometry args={[1, 0.028, 16, 200]} />
        <meshStandardMaterial color="#C4B5FD" emissive="#7C3AED" emissiveIntensity={1.8} metalness={0.99} roughness={0.01} />
      </mesh>

      {/* Core energy sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#1a0535"
          emissive="#6D28D9"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Bright center */}
      <mesh scale={scale * 0.28}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Ring particle streams */}
      <RingStream radius={scale * 1.5} speed={1.0} color="#A78BFA" count={300} />
      <RingStream radius={scale * 2.0} speed={-0.7} color="#60A5FA" count={200} />
      <RingStream radius={scale * 2.6} speed={0.5} color="#C4B5FD" count={150} />

      {/* Lighting */}
      <pointLight ref={light1} color="#A78BFA" intensity={8} distance={30} />
      <pointLight ref={light2} color="#60A5FA" intensity={3} distance={20} position={[2, 1, 2]} />
      <pointLight color="#ffffff" intensity={4} distance={6} />
    </group>
  )
}

function RingStream({ radius, speed, color, count }: { radius: number; speed: number; color: string; count: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      pos[i*3] = Math.cos(a) * radius
      pos[i*3+1] = (Math.random() - 0.5) * 0.06
      pos[i*3+2] = Math.sin(a) * radius
    }
    return pos
  }, [count, radius])

  useFrame(s => { if (ref.current) ref.current.rotation.y = s.clock.getElapsedTime() * speed * 0.18 })

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color={color} size={0.009} transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}

// ============================================================
// LEFT NODE ICONS - Problem side
// ============================================================
function LeftNodes({ scrollDepth }: { scrollDepth: number }) {
  const activeLanes = Math.min(Math.floor(scrollDepth * 6) + 1, 5)

  return (
    <group>
      {LEFT_LANES.slice(0, activeLanes).map((lane, i) => {
        const pos = lane[0]
        return <ProblemNode key={i} position={pos} index={i} />
      })}
    </group>
  )
}

function ProblemNode({ position, index }: { position: [number,number,number]; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * 0.4 + index
      const flicker = Math.sin(t * 3 + index * 1.3) > 0.5 ? 1 : 0.3
      const m = ref.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = flicker * 1.5
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.06 + Math.sin(t * 2 + index) * 0.03
    }
  })

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.06} />
      </mesh>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#3a0a0a" emissive="#ef4444" emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
      </mesh>
      <pointLight color="#ef4444" intensity={0.8} distance={2} />
    </group>
  )
}

// ============================================================
// RIGHT NODE ICONS - Solution side
// ============================================================
function RightNodes({ scrollDepth }: { scrollDepth: number }) {
  const activeLanes = Math.min(Math.floor(scrollDepth * 6) + 1, 5)

  return (
    <group>
      {RIGHT_LANES.slice(0, activeLanes).map((lane, i) => {
        const pos = lane[lane.length - 1]
        return <OutcomeNode key={i} position={pos} index={i} />
      })}
    </group>
  )
}

function OutcomeNode({ position, index }: { position: [number,number,number]; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * 0.3 + index
      const pulse = 1 + Math.sin(t * 2 + index * 0.8) * 0.1 + atlasReaction * 0.3
      ref.current.scale.setScalar(pulse)
      const m = ref.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.5 + atlasReaction * 3
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.1 + atlasReaction * 0.15 + Math.sin(t * 1.5 + index) * 0.02
    }
  })

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
      </mesh>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#0a2a1a" emissive="#10b981" emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
      </mesh>
      <pointLight color="#10b981" intensity={1.2} distance={3} />
    </group>
  )
}

// ============================================================
// CAMERA - Fixed, cinematic, slight drift
// ============================================================
function Camera() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouse.current.x = (e.clientX/window.innerWidth - 0.5) * 0.15
      mouse.current.y = -(e.clientY/window.innerHeight - 0.5) * 0.1
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const drift = { x: Math.sin(t * 0.06) * 0.08, y: Math.cos(t * 0.04) * 0.05 }
    camera.position.x += (mouse.current.x + drift.x - camera.position.x) * 0.02
    camera.position.y += (mouse.current.y + drift.y - camera.position.y) * 0.02
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ============================================================
// MAIN 3D SCENE
// ============================================================
function Scene({ scrollDepth }: { scrollDepth: number }) {
  return (
    <>
      <Camera />
      <Atlas scrollDepth={scrollDepth} />
      <ConduitSystem scrollDepth={scrollDepth} />
      <SignalSystem scrollDepth={scrollDepth} />
      <LeftNodes scrollDepth={scrollDepth} />
      <RightNodes scrollDepth={scrollDepth} />
      <ambientLight intensity={0.03} color="#040010" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.05} luminanceSmoothing={0.92} intensity={3.5} radius={0.95} kernelSize={KernelSize.HUGE} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0003, 0.0003)} />
        <Vignette eskil={false} offset={0.2} darkness={0.95} />
      </EffectComposer>
    </>
  )
}

// ============================================================
// HTML OVERLAY - Left labels, right labels, center ATLAS text
// ============================================================
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
      <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'white', marginBottom: '0.4rem', maxWidth: 220 }}>
        Most businesses<br />leak revenue<br />every day.
      </h1>
      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, maxWidth: 200, marginBottom: '1rem' }}>
        Missed calls. Lost leads.<br />Slow follow-up. Manual work.<br />Revenue slips through the cracks.
      </p>
      {LEFT_LABELS.slice(0, activeLanes).map((label, i) => (
        <div key={i} style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderLeft: '2px solid #ef4444',
          borderRadius: 6, padding: '0.4rem 0.65rem',
          opacity: 0.5 + (i === (tick % activeLanes) ? 0.5 : 0),
          transition: 'opacity 0.5s',
        }}>
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
        <div key={i} style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRight: '2px solid #10b981',
          borderRadius: 6, padding: '0.4rem 0.65rem',
          textAlign: 'right',
          opacity: 0.5 + (i === (tick % activeLanes) ? 0.5 : 0),
          transition: 'opacity 0.5s',
        }}>
          <div style={{ fontSize: '0.58rem', color: 'rgba(16,185,129,0.7)', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</div>
          <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)' }}>
            {i === 0 ? 'AI agent active' : i === 1 ? '4 min response' : i === 2 ? 'On calendar' : i === 3 ? 'Scheduled' : 'Collected'}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#6EE7B7', marginTop: '0.1rem' }}>{RIGHT_VALUES[i]}</div>
        </div>
      ))}
      {scrollDepth > 0.7 && (
        <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
          style={{ marginTop: '1rem', display: 'inline-block', background: 'linear-gradient(135deg,#10b981,#3B0F8C)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: '0.7rem', boxShadow: '0 0 30px rgba(16,185,129,0.2)', letterSpacing: '0.1em', textAlign: 'center' }}>
          LAUNCH THRIVE →
        </a>
      )}
    </div>
  )
}

function CenterLabel({ scrollDepth }: { scrollDepth: number }) {
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
      <div style={{ fontSize: '0.42rem', letterSpacing: '0.35em', color: 'rgba(196,181,253,0.3)', fontWeight: 700, marginBottom: '0.3rem' }}>
        {scrollDepth < 0.2 ? 'DORMANT' : scrollDepth < 0.4 ? 'ACTIVATING' : scrollDepth < 0.6 ? 'AWARE' : scrollDepth < 0.8 ? 'INTELLIGENT' : 'FULL COMMAND'}
      </div>
      <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.45em', color: 'rgba(167,139,250,0.4)', textShadow: '0 0 20px rgba(167,139,250,0.3)' }}>
        ATLAS
      </div>
    </div>
  )
}

// ============================================================
// BOTTOM TICKER - Live business metrics
// ============================================================
function BottomTicker({ scrollDepth }: { scrollDepth: number }) {
  const [counts, setCounts] = useState({ calls: 2847, leads: 1246, appts: 892, jobs: 847, invoices: 801, revenue: 284600 })

  useEffect(() => {
    const id = setInterval(() => {
      setCounts(c => ({
        calls: c.calls + Math.floor(Math.random() * 3),
        leads: c.leads + (Math.random() > 0.7 ? 1 : 0),
        appts: c.appts + (Math.random() > 0.8 ? 1 : 0),
        jobs: c.jobs + (Math.random() > 0.85 ? 1 : 0),
        invoices: c.invoices + (Math.random() > 0.85 ? 1 : 0),
        revenue: c.revenue + Math.floor(Math.random() * 200),
      }))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const metrics = [
    { icon: '📞', label: 'CALLS', value: 'Captured 98%', sub: counts.calls.toLocaleString() },
    { icon: '👤', label: 'LEADS', value: 'Responded 4 min', sub: counts.leads.toLocaleString() },
    { icon: '📅', label: 'APPOINTMENTS', value: 'Booked 72%', sub: counts.appts.toLocaleString() },
    { icon: '🔨', label: 'JOBS', value: 'Completed 96%', sub: counts.jobs.toLocaleString() },
    { icon: '📄', label: 'INVOICES', value: 'Paid 94%', sub: counts.invoices.toLocaleString() },
    { icon: '💰', label: 'REVENUE', value: '+$' + counts.revenue.toLocaleString(), sub: 'This month' },
    { icon: '⚡', label: 'ATLAS', value: 'Always On', sub: '99.9% uptime' },
  ]

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(1,0,8,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(109,40,217,0.1)', padding: '0.6rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
      {metrics.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{m.icon}</div>
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

// ============================================================
// INTRO
// ============================================================
function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 4200),
      setTimeout(() => setStep(4), 5800),
      setTimeout(() => setStep(5), 7200),
      setTimeout(() => setStep(6), 8600),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: step >= 6 ? 'all' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#010006', opacity: step >= 3 ? 0 : 1, transition: 'opacity 2.8s ease', pointerEvents: 'none' }} />
      {step >= 1 && (
        <div style={{ position: 'absolute', width: step >= 2 ? 200 : 3, height: step >= 2 ? 200 : 3, borderRadius: '50%', background: 'radial-gradient(circle,#fff,#A78BFA 30%,transparent 70%)', opacity: step >= 3 ? 0 : 1, transition: 'all 2.5s cubic-bezier(0.16,1,0.3,1),opacity 1.5s ease 2s', boxShadow: '0 0 100px rgba(167,139,250,0.9)', pointerEvents: 'none' }} />
      )}
      {step >= 4 && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'clamp(1rem,3.5vw,1.8rem)', fontWeight: 900, letterSpacing: '0.65em', color: 'rgba(255,255,255,0.92)', textShadow: '0 0 60px rgba(167,139,250,0.7)', marginBottom: '0.5rem', paddingLeft: '0.65em' }}>THRIVE</div>
          {step >= 5 && <div style={{ fontSize: '0.55rem', letterSpacing: '0.28em', color: 'rgba(196,181,253,0.4)', fontWeight: 600, marginBottom: '2.5rem', paddingLeft: '0.28em' }}>INTELLIGENT OPERATIONS AUTOMATIONS</div>}
          {step >= 6 && (
            <button onClick={onDone} style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: 'rgba(196,181,253,0.7)', padding: '0.75rem 2rem', borderRadius: 7, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', cursor: 'pointer' }}>
              ENTER THE COMMAND CENTER
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================
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

      {/* 3D CANVAS - fixed fullscreen */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 16], fov: 60, near: 0.1, far: 600 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95, powerPreference: 'high-performance', alpha: true }}
            style={{ background: 'transparent' }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <Scene scrollDepth={scrollDepth} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* DARK BASE */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(1,0,8,0.05) 0%, rgba(1,0,8,0.82) 100%)', pointerEvents: 'none' }} />

      {/* INTRO */}
      {showIntro && <Intro onDone={doneIntro} />}

      {/* NAV */}
      {!showIntro && (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.65rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(1,0,6,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(109,40,217,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#DDD6FE,#4C1D95)', boxShadow: '0 0 10px rgba(109,40,217,0.9)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.22em' }}>THRIVE</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['THE PROBLEM','ATLAS','THE SOLUTION','SYSTEMS','LAUNCH'].map((s, i) => (
              <button key={i} onClick={() => window.scrollTo({ top: (i/4)*(document.body.scrollHeight-window.innerHeight), behavior: 'smooth' })}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer', padding: '0.2rem 0.4rem' }}>
                {s}
              </button>
            ))}
          </div>
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
            style={{ background: 'rgba(76,29,149,0.35)', border: '1px solid rgba(109,40,217,0.3)', color: 'rgba(196,181,253,0.8)', padding: '0.38rem 0.8rem', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em' }}>
            LAUNCH CALL
          </a>
        </nav>
      )}

      {/* SCROLLABLE HEIGHT - scroll deepens simulation */}
      <div style={{ height: '500vh' }} />

      {/* HTML OVERLAYS */}
      {!showIntro && (
        <>
          <LeftPanel scrollDepth={scrollDepth} />
          <CenterLabel scrollDepth={scrollDepth} />
          <RightPanel scrollDepth={scrollDepth} />
          <BottomTicker scrollDepth={scrollDepth} />
        </>
      )}

      {/* REPLAY */}
      {!showIntro && (
        <button onClick={() => { localStorage.removeItem('thriveIntroSeen'); setShowIntro(true) }}
          style={{ position: 'fixed', bottom: '3.5rem', right: '0.8rem', zIndex: 50, background: 'rgba(1,0,8,0.5)', border: '1px solid rgba(109,40,217,0.08)', borderRadius: 4, padding: '0.2rem 0.4rem', color: 'rgba(255,255,255,0.08)', fontSize: '0.38rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          REPLAY INTRO
        </button>
      )}

      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#010006;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        ::-webkit-scrollbar{width:2px}
        ::-webkit-scrollbar-track{background:#010006}
        ::-webkit-scrollbar-thumb{background:rgba(109,40,217,0.12);border-radius:1px}
      \`}</style>
    </div>
  )
}
`

fs.writeFileSync('app/page.tsx', page, 'utf8')
console.log('COMPOSITION BUILT')
