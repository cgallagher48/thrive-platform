const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

const newATLAS = `// ATLAS - Orbital Command Station
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
}`

const start = content.indexOf('// ATLAS Dyson Megastructure\nfunction DysonStructure')
const end = content.indexOf('\nfunction SpaceDust', start)

if (start > -1 && end > -1) {
  content = content.slice(0, start) + newATLAS + content.slice(end)
  console.log('ATLAS rebuilt successfully')
} else {
  console.log('ERROR: Could not find section')
}

// Also fix the component call from DysonStructure to ATLASMegastructure
content = content.replace('<DysonStructure sunRef={sunRef as React.RefObject<THREE.Mesh>} />', '<ATLASMegastructure />')
content = content.replace(/sunRef[^}]*}/g, '')

fs.writeFileSync('app/page.tsx', content, 'utf8')
