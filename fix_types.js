const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

content = content.replace(
  'outerRef.current.material.opacity = 0.1 + s * 0.04',
  '(outerRef.current.material as THREE.MeshStandardMaterial).opacity = 0.1 + s * 0.04'
)

content = content.replace(
  'pulseRef.current.material.opacity = (0.04 + s * 0.02) * (1 - pulse * 0.5)',
  '(pulseRef.current.material as THREE.MeshBasicMaterial).opacity = (0.04 + s * 0.02) * (1 - pulse * 0.5)'
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
