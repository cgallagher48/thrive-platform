const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// Replace the entire DeadNode useFrame with a working version
const oldDeadNode = `  useFrame((state) => {
    if (ref.current) {
      const flicker = Math.sin(state.clock.getElapsedTime() * 3 + phase) > 0.7 ? 0.3 : 0.05
      (ref.current.material as THREE.Material & {opacity:number}).opacity = flicker
    }
  })`

const newDeadNode = `  useFrame((state) => {
    if (ref.current) {
      const sinVal = Math.sin(state.clock.getElapsedTime() * 3 + phase)
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = sinVal > 0.7 ? 0.3 : 0.05
    }
  })`

content = content.replace(oldDeadNode, newDeadNode)

// Also fix any remaining THREE.Material & patterns
content = content.replace(/\((\w+)\.current\.material as THREE\.Material & \{opacity:number\}\)\.opacity =/g, 
  '($1.current.material as THREE.MeshBasicMaterial).opacity =')

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Done')
