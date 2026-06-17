const fs = require('fs')

const page = `'use client'
import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, MeshDistortMaterial, Tube } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BlendFunction, KernelSize } from 'postprocessing'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// ATLAS CORE - Premium layered intelligence structure
// ============================================================
function AtlasCore({ atlasState }: { atlasState: number }) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const shell1 = useRef<THREE.Mesh>(null)
  const shell2 = useRef<THREE.Mesh>(null)
  const shell3 = useRef<THREE.Mesh>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const reaction = useRef(0)

  const stateScale = [0.18, 0.32, 0.52, 0.72, 0.9, 1.08, 1.3]
  const stateEmissive = [0.2, 0.6, 1.0, 1.6, 2.2, 3.0, 4.0]

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const s = Math.min(atlasState, 6)
    const scale = stateScale[s]
    const emissive = stateEmissive[s]
    const breathe = 1 + Math.sin(t * (0.6 + s * 0.2)) * (0.03 + s * 0.008)

    // ATLAS reacts to captured signals
    const captured = simEvents.filter(e => e.type === 'captured' && e.progress > 0.85)
    if (captured.length > 0) reaction.current = Math.min(reaction.current + 0.15, 1)
    else reaction.current = Math.max(reaction.current - 0.025, 0)

    const r = reaction.current

    if (core.current) {
      core.current.scale.setScalar(scale * breathe * (1 + r * 0.25))
      core.current.rotation.y = t * (0.08 + s * 0.04)
      core.current.rotation.x = Math.sin(t * 0.25) * 0.12
      const m = core.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = emissive + r * 4
    }
    if (shell1.current) {
      shell1.current.scale.setScalar(scale * 1.35 * breathe)
      shell1.current.rotation.y = -t * (0.06 + s * 0.02)
      shell1.current.rotation.z = t * 0.04
      const m = shell1.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.12 + s * 0.04 + r * 0.1
    }
    if (shell2.current) {
      shell2.current.scale.setScalar(scale * 1.7 * breathe)
      shell2.current.rotation.x = t * 0.03
      shell2.current.rotation.z = -t * 0.025
      const m = shell2.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.07 + s * 0.025 + r * 0.06
    }
    if (shell3.current) {
      shell3.current.scale.setScalar(scale * 2.2)
      shell3.current.rotation.y = t * 0.015
      const m = shell3.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.04 + s * 0.015 + r * 0.04
    }
    if (ring1.current) {
      ring1.current.scale.setScalar(scale * 1.8)
      ring1.current.rotation.z = t * (0.18 + s * 0.05)
      ring1.current.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.1) * 0.05
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(scale * 2.4)
      ring2.current.rotation.z = -t * (0.12 + s * 0.03)
      ring2.current.rotation.x = Math.PI / 3.5
      ring2.current.rotation.y = t * 0.06
    }
    if (ring3.current) {
      ring3.current.scale.setScalar(scale * 3.0)
      ring3.current.rotation.z = t * 0.08
      ring3.current.rotation.x = Math.PI / 4.5
      ring3.current.rotation.y = -t * 0.04
    }
    if (pulse.current) {
      const p = (Math.sin(t * 1.5) * 0.5 + 0.5)
      pulse.current.scale.setScalar(scale * (1.6 + p * 0.8 + r * 0.6))
      const m = pulse.current.material as THREE.MeshBasicMaterial
      m.opacity = (0.03 + r * 0.04) * (1 - p * 0.6)
    }
  })

  const stateColor = ['#1a0535', '#2D0A6B', '#4C1D95', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'][Math.min(atlasState, 6)]
  const ringColor = ['#1a0535', '#3B0F8C', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#C4B5FD'][Math.min(atlasState, 6)]

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Outer pulse glow */}
      <mesh ref={pulse}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={stateColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Shell 3 - outermost wireframe */}
      <mesh ref={shell3}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#4C1D95" transparent opacity={0.04} wireframe />
      </mesh>

      {/* Shell 2 - mid energy field */}
      <mesh ref={shell2}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#5B21B6"
          emissive="#3B0F8C"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* Shell 1 - inner structure */}
      <mesh ref={shell1}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#5B21B6"
          emissiveIntensity={0.8}
          wireframe={false}
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Rotating data rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[1, 0.025, 16, 180]} />
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={2.5} metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1, 0.016, 12, 180]} />
        <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={2.0} metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[1, 0.01, 8, 180]} />
        <meshStandardMaterial color="#C4B5FD" emissive="#8B5CF6" emissiveIntensity={1.5} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Core - distorted energy sphere */}
      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={stateColor}
          emissive={stateColor}
          emissiveIntensity={stateEmissive[Math.min(atlasState, 6)]}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Bright center star */}
      <mesh scale={stateScale[Math.min(atlasState, 6)] * 0.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Energy particle streams on rings */}
      <RingParticles radius={stateScale[Math.min(atlasState, 6)] * 1.8} speed={1.2} color="#A78BFA" count={200} />
      <RingParticles radius={stateScale[Math.min(atlasState, 6)] * 2.4} speed={-0.8} color="#60A5FA" count={150} />

      {/* Lighting */}
      <pointLight color="#A78BFA" intensity={6 + atlasState * 2} distance={25} />
      <pointLight color="#ffffff" intensity={3 + atlasState} distance={8} />
      <pointLight color="#3B82F6" intensity={2} distance={15} position={[3, 2, 2]} />
    </group>
  )
}

function RingParticles({ radius, speed, color, count }: { radius: number; speed: number; color: string; count: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      pos[i*3] = Math.cos(a) * radius
      pos[i*3+1] = (Math.random() - 0.5) * 0.08
      pos[i*3+2] = Math.sin(a) * radius
    }
    return pos
  }, [count, radius])

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.getElapsedTime() * speed * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color={color} size={0.01} transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// ============================================================
// SIMULATION ENGINE
// ============================================================
interface SimEvent {
  id: number
  type: 'missed' | 'captured' | 'data'
  fromNode: number
  toNode: number
  progress: number
  speed: number
  alive: boolean
  hitTime: number
}

let simEvents: SimEvent[] = []
let nextId = 0
let lastSpawn = 0

const NODE_POSITIONS: [number,number,number][] = [
  [0, 0, 0],         // 0: ATLAS center
  [-4.5, 1.8, -2],   // 1: SALES
  [4.5, 1.2, -3],    // 2: MARKETING
  [-3.5, -2.2, -1],  // 3: OPERATIONS
  [3.8, -1.8, -2],   // 4: FINANCE
  [0, -3.5, -2],     // 5: SCHEDULING
  [-5.5, 0.2, -4],   // 6: CRM
  [5.8, -0.3, -3],   // 7: EMAIL
  [-2.2, 3.2, -3],   // 8: LEADS
  [2.5, 3.0, -4],    // 9: JOBS
  [0.5, -4.8, -3],   // 10: INVOICING
  // Extended
  [-7, 2.5, -6],     // 11
  [7.5, 2, -7],      // 12
  [-6.5, -3.5, -5],  // 13
  [6.5, -3, -6],     // 14
  [0, 5.5, -5],      // 15
]

function spawnSimEvent(scene: number) {
  const now = Date.now()
  if (now - lastSpawn < 1200) return
  lastSpawn = now

  if (scene === 0) {
    // Missed calls - go toward edge nodes that die
    const edgeNodes = [1, 2, 3, 4, 5]
    simEvents.push({
      id: nextId++, type: 'missed',
      fromNode: 8 + Math.floor(Math.random() * 4), // incoming from outside
      toNode: edgeNodes[Math.floor(Math.random() * edgeNodes.length)],
      progress: 0, speed: 0.006, alive: true, hitTime: -1
    })
  } else if (scene === 1) {
    // ATLAS intercepts - captured
    simEvents.push({
      id: nextId++, type: 'captured',
      fromNode: 8 + Math.floor(Math.random() * 4),
      toNode: 0, // goes TO atlas
      progress: 0, speed: 0.009, alive: true, hitTime: -1
    })
  } else if (scene >= 2) {
    // Data flowing through network
    const pairs = [[0,1],[0,2],[0,3],[0,4],[0,5],[1,6],[2,7],[3,10],[4,10],[5,9],[1,8],[0,6],[0,7]]
    const pair = pairs[Math.floor(Math.random() * pairs.length)]
    simEvents.push({
      id: nextId++, type: 'data',
      fromNode: pair[0], toNode: pair[1],
      progress: 0, speed: 0.012, alive: true, hitTime: -1
    })
  }

  // Cleanup
  simEvents = simEvents.filter(e => e.alive).slice(-15)
}

// ============================================================
// ENERGY TUBE CONNECTIONS - Premium data conduits
// ============================================================
function EnergyConduits({ atlasState, scene }: { atlasState: number; scene: number }) {
  const connections = [
    [0,1],[0,2],[0,3],[0,4],[0,5],
    [1,6],[1,8],[2,7],[2,9],[3,6],[3,10],[4,7],[4,10],[5,9],[5,10],
    [6,11],[7,12],[8,11],[9,12],[10,13],[11,15],[12,15],
  ]

  return (
    <group>
      {connections.map(([a, b], i) => (
        <EnergyTube
          key={i}
          from={NODE_POSITIONS[a] || [0,0,0]}
          to={NODE_POSITIONS[b] || [0,0,0]}
          active={atlasState > i * 0.3}
          index={i}
          scene={scene}
          connectionIndex={i}
        />
      ))}
    </group>
  )
}

function EnergyTube({ from, to, active, index, scene, connectionIndex }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const flowRef = useRef<THREE.Points>(null)
  const flowPositions = useRef<Float32Array | null>(null)
  const flowCount = 8

  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2 + (Math.random() - 0.5) * 1.5,
        (from[1] + to[1]) / 2 + (Math.random() - 0.5) * 1.5,
        (from[2] + to[2]) / 2 - 0.5
      ),
      new THREE.Vector3(...to)
    )
    return curve.getPoints(20)
  }, [from, to])

  const tubeGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 20, 0.018, 6, false)
  }, [points])

  useMemo(() => {
    const pos = new Float32Array(flowCount * 3)
    flowPositions.current = pos
    return pos
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Check if any signal is traveling this connection
    const activeSignal = simEvents.find(e =>
      e.alive &&
      ((e.fromNode === connectionIndex && e.toNode === connectionIndex + 1) ||
      e.type === 'data')
    )

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      const isActive = active && atlasState > 0
      const hasSignal = activeSignal !== undefined

      mat.emissiveIntensity = isActive ? (0.4 + Math.sin(t * 2 + index * 0.5) * 0.1 + (hasSignal ? 1.5 : 0)) : 0.05
      mat.opacity = isActive ? 0.6 + (hasSignal ? 0.3 : 0) : 0.12
    }

    // Animate flow particles along tube
    if (flowRef.current && flowPositions.current && active) {
      for (let i = 0; i < flowCount; i++) {
        const p = ((t * 0.3 + i / flowCount) % 1)
        const idx = Math.floor(p * (points.length - 1))
        const pt = points[Math.min(idx, points.length - 1)]
        flowPositions.current[i*3] = pt.x
        flowPositions.current[i*3+1] = pt.y
        flowPositions.current[i*3+2] = pt.z
      }
      flowRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const color = active ? '#6D28D9' : '#1a0535'
  const emissive = active ? '#4C1D95' : '#0a0020'

  return (
    <group>
      <mesh geometry={tubeGeom} ref={meshRef}>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={active ? 0.5 : 0.1}
        />
      </mesh>
      {active && flowPositions.current && (
        <points ref={flowRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[flowPositions.current, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#A78BFA" size={0.05} transparent opacity={0.9} sizeAttenuation />
        </points>
      )}
    </group>
  )
}

// ============================================================
// NETWORK NODES - Premium system hubs
// ============================================================
const NODE_DATA = [
  { label: 'ATLAS', color: '#A78BFA', tier: 0, size: 0.32 },
  { label: 'SALES', color: '#10b981', tier: 1, size: 0.2 },
  { label: 'MARKETING', color: '#60A5FA', tier: 1, size: 0.2 },
  { label: 'OPERATIONS', color: '#A78BFA', tier: 1, size: 0.2 },
  { label: 'FINANCE', color: '#FBBF24', tier: 1, size: 0.2 },
  { label: 'SCHEDULING', color: '#F87171', tier: 1, size: 0.2 },
  { label: 'CRM', color: '#34D399', tier: 2, size: 0.14 },
  { label: 'EMAIL', color: '#818CF8', tier: 2, size: 0.14 },
  { label: 'LEADS', color: '#F472B6', tier: 2, size: 0.14 },
  { label: 'JOBS', color: '#FB923C', tier: 2, size: 0.14 },
  { label: 'INVOICING', color: '#22D3EE', tier: 2, size: 0.14 },
  { label: '', color: '#4C1D95', tier: 3, size: 0.08 },
  { label: '', color: '#1E3A5F', tier: 3, size: 0.08 },
  { label: '', color: '#065F46', tier: 3, size: 0.08 },
  { label: '', color: '#78350F', tier: 3, size: 0.08 },
  { label: '', color: '#4C1D95', tier: 3, size: 0.08 },
]

function SystemNode({ nodeIndex, atlasState }: { nodeIndex: number; atlasState: number }) {
  const data = NODE_DATA[nodeIndex]
  const position = NODE_POSITIONS[nodeIndex]
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const hitIntensity = useRef(0)
  const missIntensity = useRef(0)

  if (!data || !position) return null

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const active = atlasState >= data.tier

    // Check for signals hitting this node
    simEvents.forEach(e => {
      if (!e.alive || e.hitTime > 0) return
      const toPos = NODE_POSITIONS[e.toNode]
      if (!toPos) return
      const dist = Math.sqrt(
        (toPos[0]-position[0])**2 +
        (toPos[1]-position[1])**2 +
        (toPos[2]-position[2])**2
      )
      if (dist < 0.3 && e.progress > 0.9) {
        e.hitTime = t
        e.alive = false
        if (e.type === 'captured' || e.type === 'data') {
          hitIntensity.current = 1
        } else {
          missIntensity.current = 1
        }
      }
    })

    hitIntensity.current = Math.max(0, hitIntensity.current - 0.03)
    missIntensity.current = Math.max(0, missIntensity.current - 0.025)

    const hit = hitIntensity.current
    const miss = missIntensity.current

    if (meshRef.current) {
      meshRef.current.rotation.y = t * (0.3 + data.tier * 0.1) + nodeIndex
      meshRef.current.rotation.x = Math.sin(t * 0.4 + nodeIndex) * 0.15
      const s = active ? (1 + Math.sin(t * 1.5 + nodeIndex * 0.8) * 0.08 + hit * 0.4) : 0.4
      meshRef.current.scale.setScalar(data.size * s)
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = active ? (1.5 + hit * 4) : 0.15
      if (miss > 0) mat.emissive = new THREE.Color('#ef4444')
      else mat.emissive = new THREE.Color(data.color)
    }

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = active ? (0.08 + hit * 0.25 + miss * 0.2 + Math.sin(t * 2 + nodeIndex) * 0.02) : 0.02
      if (miss > 0) mat.color = new THREE.Color('#ef4444')
      else mat.color = new THREE.Color(data.color)
    }

    if (outerRef.current) {
      outerRef.current.rotation.y = -t * 0.2
      outerRef.current.scale.setScalar(data.size * 1.8 * (1 + hit * 0.3))
      const mat = outerRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = active ? (0.06 + hit * 0.1) : 0.01
    }
  })

  return (
    <group position={position}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[data.size * 3.5, 12, 12]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.06} />
      </mesh>
      {/* Rotating outer shell */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.3} wireframe transparent opacity={0.06} />
      </mesh>
      {/* Core node */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={1.5}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      {atlasState >= data.tier && data.tier < 3 && (
        <pointLight color={data.color} intensity={1.2} distance={4} />
      )}
    </group>
  )
}

// ============================================================
// SIGNAL PARTICLES - Traveling events
// ============================================================
function SignalParticles({ scene }: { scene: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const trailRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const MAX = 30

  useFrame((state) => {
    if (!ref.current) return
    spawnSimEvent(scene)

    // Update
    simEvents = simEvents.map(e => ({ ...e, progress: e.progress + e.speed }))
    simEvents = simEvents.filter(e => e.progress < 1.0 && e.alive)

    for (let i = 0; i < MAX; i++) {
      const e = simEvents[i]
      if (!e) {
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        ref.current!.setMatrixAt(i, dummy.matrix)
        continue
      }

      const from = NODE_POSITIONS[Math.min(e.fromNode, NODE_POSITIONS.length-1)] || [0,0,0]
      const to = NODE_POSITIONS[Math.min(e.toNode, NODE_POSITIONS.length-1)] || [0,0,0]
      const ease = e.progress < 0.5 ? 2*e.progress*e.progress : -1+(4-2*e.progress)*e.progress
      const mx = from[0] + (to[0]-from[0]) * ease
      const my = from[1] + (to[1]-from[1]) * ease
      const mz = from[2] + (to[2]-from[2]) * ease

      dummy.position.set(mx, my, mz)
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 10 + i) * 0.3
      dummy.scale.setScalar(0.07 * pulse)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)

      const color = e.type === 'missed' ? new THREE.Color('#ef4444') :
                    e.type === 'captured' ? new THREE.Color('#10b981') :
                    new THREE.Color('#A78BFA')
      ref.current!.setColorAt(i, color)
    }

    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  )
}

// ============================================================
// LEAD JOURNEY - Following the protagonist
// ============================================================
function LeadJourney({ scene }: { scene: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const progress = useRef(0)
  const stageRef = useRef(0)

  const path = [0, 8, 0, 1, 5, 4, 10, 0] // ATLAS → LEADS → ATLAS → SALES → SCHEDULING → FINANCE → INVOICING → ATLAS

  useFrame((state) => {
    if (!ref.current || scene !== 3) {
      if (ref.current) ref.current.scale.setScalar(0)
      return
    }

    progress.current += 0.004
    if (progress.current >= 1) {
      progress.current = 0
      stageRef.current = (stageRef.current + 1) % (path.length - 1)
    }

    const fromIdx = path[stageRef.current]
    const toIdx = path[stageRef.current + 1]
    const from = NODE_POSITIONS[fromIdx] || [0,0,0]
    const to = NODE_POSITIONS[toIdx] || [0,0,0]
    const t = progress.current
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t

    ref.current.position.set(
      from[0] + (to[0]-from[0]) * ease,
      from[1] + (to[1]-from[1]) * ease,
      from[2] + (to[2]-from[2]) * ease
    )

    const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 12) * 0.4
    ref.current.scale.setScalar(0.14 * pulse)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

// ============================================================
// CAMERA RIG
// ============================================================
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const cur = useRef({ x: 0, y: 1.5, z: 18 })

  const keys = [
    { x: 0, y: 2, z: 20, lx: 0, ly: 0 },
    { x: -3, y: 0.5, z: 15, lx: 0, ly: 0 },
    { x: 4, y: 2, z: 11, lx: -1, ly: 0.5 },
    { x: -6, y: -1, z: 8, lx: -2, ly: -0.5 },
    { x: 2, y: 3, z: 6, lx: 0, ly: 0 },
    { x: 0, y: 0, z: 3.5, lx: 0, ly: 0 },
    { x: 0, y: 10, z: 26, lx: 0, ly: 0 },
    { x: 0, y: 0.5, z: 13, lx: 0, ly: 0 },
  ]

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouse.current.x = (e.clientX/window.innerWidth - 0.5) * 0.3
      mouse.current.y = -(e.clientY/window.innerHeight - 0.5) * 0.2
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  useFrame((state) => {
    const total = keys.length - 1
    const sf = scrollProgress * total
    const idx = Math.min(Math.floor(sf), total - 1)
    const t = sf - idx
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
    const a = keys[idx]
    const b = keys[Math.min(idx+1, total)]

    const drift = state.clock.getElapsedTime()
    const dx = Math.sin(drift * 0.07) * 0.12
    const dy = Math.cos(drift * 0.05) * 0.08

    const tx = a.x+(b.x-a.x)*ease + mouse.current.x + dx
    const ty = a.y+(b.y-a.y)*ease + mouse.current.y + dy
    const tz = a.z+(b.z-a.z)*ease

    cur.current.x += (tx - cur.current.x) * 0.032
    cur.current.y += (ty - cur.current.y) * 0.032
    cur.current.z += (tz - cur.current.z) * 0.032

    camera.position.set(cur.current.x, cur.current.y, cur.current.z)
    camera.lookAt(a.lx+(b.lx-a.lx)*ease, a.ly+(b.ly-a.ly)*ease, 0)
  })

  return null
}

// ============================================================
// MAIN SCENE
// ============================================================
function Scene({ scroll, atlas, scene }: { scroll: number; atlas: number; scene: number }) {
  return (
    <>
      <CameraRig scrollProgress={scroll} />
      <Stars radius={350} depth={120} count={14000} factor={7} saturation={0.12} fade speed={0.12} />
      <Stars radius={100} depth={50} count={4000} factor={3} saturation={0.25} fade speed={0.05} />
      <EnergyConduits atlasState={atlas} scene={scene} />
      {NODE_POSITIONS.map((_, i) => (
        i !== 0 ? <SystemNode key={i} nodeIndex={i} atlasState={atlas} /> : null
      ))}
      <AtlasCore atlasState={atlas} />
      <SignalParticles scene={scene} />
      <LeadJourney scene={scene} />
      <ambientLight intensity={0.04} color="#040010" />
      <directionalLight position={[12, 10, 6]} intensity={0.18} color="#C4B5FD" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.06} luminanceSmoothing={0.92} intensity={3.2} radius={0.95} kernelSize={KernelSize.HUGE} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0004, 0.0004)} />
        <Vignette eskil={false} offset={0.22} darkness={0.94} />
      </EffectComposer>
    </>
  )
}

// ============================================================
// SCENE COPY - Minimal supporting text
// ============================================================
const SCENES = [
  { label: 'THE PROBLEM', h: 'Every missed call is money that never existed.', s: '' },
  { label: 'THE SIGNAL', h: 'ATLAS wakes up.', s: 'Nothing gets missed again.' },
  { label: 'THE NETWORK', h: 'Every system. Connected.', s: 'Sales. Operations. Finance. Scheduling.' },
  { label: 'AUTOMATION', h: 'Watch what happens.', s: 'Lead in. Revenue out. No human required.' },
  { label: 'INTELLIGENCE', h: 'This is orchestration.', s: 'Not software. Not automation. Intelligence.' },
  { label: 'COMMAND', h: 'Your entire business.', s: 'One screen. Every signal. Live.' },
  { label: 'LAUNCH', h: 'Stop managing.', s: 'Start commanding.' },
]

// ============================================================
// LIVE EVENT TICKER
// ============================================================
function EventTicker({ scene }: { scene: number }) {
  const [events, setEvents] = useState<Array<{id:number,text:string,color:string,value:string}>>([])

  useEffect(() => {
    const pools: Record<number, Array<{text:string,color:string,value:string}>> = {
      0: [
        { text: 'Incoming call — no answer', color: '#ef4444', value: '-$4,200' },
        { text: 'Lead — no response — lost', color: '#ef4444', value: '-$6,800' },
        { text: 'Follow-up missed', color: '#ef4444', value: '-$2,100' },
      ],
      1: [
        { text: 'ATLAS intercepted — lead captured', color: '#10b981', value: '+$4,200' },
        { text: 'Incoming call — responded in 4 min', color: '#10b981', value: 'Lead secured' },
        { text: 'After-hours lead — ATLAS responded', color: '#10b981', value: 'Appointment booked' },
      ],
      2: [{ text: 'Network online — all systems active', color: '#A78BFA', value: '6 systems' }],
      3: [
        { text: 'Lead entered system', color: '#A78BFA', value: '0:00' },
        { text: 'AI responded', color: '#10b981', value: '0:04' },
        { text: 'Follow-up sent automatically', color: '#60A5FA', value: '0:30' },
        { text: 'Appointment booked', color: '#FBBF24', value: '2:15' },
        { text: 'Job confirmed', color: '#10b981', value: '24:00' },
        { text: 'Invoice sent', color: '#A78BFA', value: '24:01' },
        { text: 'Revenue received', color: '#10b981', value: '+$5,400' },
      ],
    }

    const pool = pools[scene] || []
    if (!pool.length) { setEvents([]); return }

    let idx = 0
    const interval = setInterval(() => {
      setEvents(prev => [...prev.slice(-3), { id: Date.now(), ...pool[idx % pool.length] }])
      idx++
    }, scene === 3 ? 1800 : 2200)

    return () => clearInterval(interval)
  }, [scene])

  if (!events.length) return null

  return (
    <div style={{ position: 'fixed', bottom: '2rem', left: '3rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {events.map((e, i) => (
        <div key={e.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.55rem',
          background: 'rgba(1,0,8,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid ' + e.color + '25',
          borderLeft: '2px solid ' + e.color,
          borderRadius: 7, padding: '0.38rem 0.75rem',
          opacity: 0.4 + (i / events.length) * 0.6,
          fontSize: '0.7rem', transition: 'opacity 0.4s',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: e.color, boxShadow: '0 0 5px ' + e.color, flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>{e.text}</span>
          {e.value && <span style={{ color: e.color, fontWeight: 700, marginLeft: 'auto', paddingLeft: '0.75rem', whiteSpace: 'nowrap' }}>{e.value}</span>}
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
    const t = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 4600),
      setTimeout(() => setStep(4), 6200),
      setTimeout(() => setStep(5), 7800),
      setTimeout(() => setStep(6), 9200),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: step >= 6 ? 'all' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#010006', opacity: step >= 3 ? 0 : 1, transition: 'opacity 2.8s ease', pointerEvents: 'none' }} />
      {step >= 1 && (
        <div style={{ position: 'absolute', width: step >= 2 ? 220 : 3, height: step >= 2 ? 220 : 3, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #A78BFA 30%, transparent 70%)', opacity: step >= 3 ? 0 : 1, transition: 'all 2.8s cubic-bezier(0.16,1,0.3,1), opacity 1.5s ease 2.2s', boxShadow: '0 0 100px rgba(167,139,250,0.9), 0 0 200px rgba(109,40,217,0.5)', pointerEvents: 'none' }} />
      )}
      {step >= 4 && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.8rem)', fontWeight: 900, letterSpacing: '0.7em', color: 'rgba(255,255,255,0.94)', textShadow: '0 0 60px rgba(167,139,250,0.7)', marginBottom: '0.5rem', paddingLeft: '0.7em' }}>THRIVE</div>
          {step >= 5 && <div style={{ fontSize: '0.56rem', letterSpacing: '0.28em', color: 'rgba(196,181,253,0.4)', fontWeight: 600, marginBottom: '2.5rem', paddingLeft: '0.28em' }}>INTELLIGENT OPERATIONS AUTOMATIONS</div>}
          {step >= 6 && (
            <button onClick={onDone} style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: 'rgba(196,181,253,0.7)', padding: '0.75rem 2rem', borderRadius: 7, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', cursor: 'pointer', transition: 'all 0.3s' }}>
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
  const [scroll, setScroll] = useState(0)
  const [scene, setScene] = useState(0)
  const [atlas, setAtlas] = useState(0)
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
      const p = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1)
      setScroll(p)
      const s = Math.min(Math.floor(p * 7), 6)
      setScene(s)
      setAtlas(s)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const sd = SCENES[scene]

  return (
    <div style={{ background: '#010006', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {mounted && (
          <Canvas camera={{ position: [0,1.5,18], fov: 55, near: 0.1, far: 700 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, powerPreference: 'high-performance', alpha: true }}
            style={{ background: 'transparent' }} dpr={[1,1.5]}>
            <Suspense fallback={null}>
              <Scene scroll={scroll} atlas={atlas} scene={scene} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(1,0,8,0.08) 0%, rgba(1,0,8,0.78) 100%)', pointerEvents: 'none' }} />

      {showIntro && <Intro onDone={doneIntro} />}

      {!showIntro && (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.7rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(1,0,6,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(109,40,217,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #DDD6FE, #4C1D95)', boxShadow: '0 0 10px rgba(109,40,217,0.9)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.22em' }}>THRIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.22em', fontWeight: 600 }}>{sd.label}</span>
            <div style={{ display: 'flex', gap: '0.18rem' }}>
              {SCENES.map((_, i) => (
                <div key={i} onClick={() => window.scrollTo({ top: (i/6)*(document.body.scrollHeight-window.innerHeight), behavior: 'smooth' })}
                  style={{ width: i===scene?12:3, height: 3, borderRadius: 2, background: i===scene?'#A78BFA':'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.4s' }} />
              ))}
            </div>
          </div>
          <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
            style={{ background: 'rgba(76,29,149,0.35)', border: '1px solid rgba(109,40,217,0.3)', color: 'rgba(196,181,253,0.8)', padding: '0.38rem 0.8rem', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em' }}>
            LAUNCH CALL
          </a>
        </nav>
      )}

      <div style={{ height: '700vh', position: 'relative' }}>
        {!showIntro && (
          <div style={{ position: 'fixed', top: '50%', left: '3rem', transform: 'translateY(-50%)', zIndex: 10, maxWidth: 360, pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.44rem', letterSpacing: '0.3em', color: 'rgba(167,139,250,0.35)', fontWeight: 700, marginBottom: '0.6rem' }}>{sd.label}</div>
            <h2 style={{ fontSize: 'clamp(1.3rem,2.8vw,2.4rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: '0.5rem', textShadow: '0 0 30px rgba(109,40,217,0.2)' }}>{sd.h}</h2>
            {sd.s && <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.18)', lineHeight: 1.7 }}>{sd.s}</p>}
            {scene === 6 && (
              <div style={{ marginTop: '1.8rem', pointerEvents: 'all' }}>
                <a href="https://calendly.com/thriveautomation" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', background: 'linear-gradient(135deg,#10b981,#3B0F8C)', color: '#fff', padding: '0.85rem 2rem', borderRadius: 9, textDecoration: 'none', fontWeight: 800, fontSize: '0.75rem', boxShadow: '0 0 35px rgba(16,185,129,0.22)', letterSpacing: '0.1em' }}>
                  BOOK YOUR FREE STRATEGY CALL
                </a>
                <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.08)', marginTop: '0.65rem' }}>casey.gallagher@thriveautomation.agency</p>
              </div>
            )}
          </div>
        )}

        {!showIntro && <EventTicker scene={scene} />}

        {!showIntro && (
          <div style={{ position: 'fixed', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {SCENES.map((_, i) => (
              <div key={i} onClick={() => window.scrollTo({ top: (i/6)*(document.body.scrollHeight-window.innerHeight), behavior: 'smooth' })}
                style={{ width: 2, height: i===scene?18:5, borderRadius: 1, background: i===scene?'#A78BFA':'rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
      </div>

      {!showIntro && (
        <button onClick={() => { localStorage.removeItem('thriveIntroSeen'); setShowIntro(true) }}
          style={{ position: 'fixed', bottom: '0.8rem', right: '0.8rem', zIndex: 50, background: 'rgba(1,0,8,0.5)', border: '1px solid rgba(109,40,217,0.08)', borderRadius: 4, padding: '0.22rem 0.45rem', color: 'rgba(255,255,255,0.08)', fontSize: '0.4rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          REPLAY INTRO
        </button>
      )}

      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
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
console.log('PREMIUM SIMULATION BUILT')
