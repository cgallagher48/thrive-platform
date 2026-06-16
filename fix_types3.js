const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

content = content.replace(
  'linesRef.current.material.opacity = 0.1 + atlasState * 0.12',
  'if (!Array.isArray(linesRef.current.material)) { (linesRef.current.material as any).opacity = 0.1 + atlasState * 0.12 }'
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
