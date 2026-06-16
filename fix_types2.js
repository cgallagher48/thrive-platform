const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

content = content.replace(
  '(outerRef.current.material as THREE.MeshStandardMaterial).opacity = 0.1 + s * 0.04',
  'if (outerRef.current.material && !Array.isArray(outerRef.current.material)) { (outerRef.current.material as any).opacity = 0.1 + s * 0.04 }'
)

content = content.replace(
  '(pulseRef.current.material as THREE.MeshBasicMaterial).opacity = (0.04 + s * 0.02) * (1 - pulse * 0.5)',
  'if (pulseRef.current.material && !Array.isArray(pulseRef.current.material)) { (pulseRef.current.material as any).opacity = (0.04 + s * 0.02) * (1 - pulse * 0.5) }'
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
