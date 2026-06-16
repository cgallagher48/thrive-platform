const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// Fix flicker
content = content.replace(
  'const flickerVal = Math.sin(state.clock.getElapsedTime() * 3 + phase) > 0.7\n      const flicker = flickerVal ? 0.3 : 0.05',
  'const flicker = Math.sin(state.clock.getElapsedTime() * 3 + phase) > 0.7 ? 0.3 : 0.05'
)

// Fix ALL material opacity - use type assertion differently
content = content.replace(/\(\((\w+)\.current\.material as any\) \|\| \{\}\)\.opacity =/g, '($1.current.material as THREE.Material & {opacity:number}).opacity =')

// Fix the ref.current.material pattern too
content = content.replace('((ref.current.material as any) || {}).opacity = flicker', '(ref.current.material as THREE.Material & {opacity:number}).opacity = flicker')

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
