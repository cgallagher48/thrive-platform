const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

content = content.replace(
  'const flicker = Math.sin(state.clock.getElapsedTime() * 3 + phase) > 0.7 ? 0.3 : 0.05',
  'const flicker: number = Math.sin(state.clock.getElapsedTime() * 3 + phase) > 0.7 ? 0.3 : 0.05'
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
