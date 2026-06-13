const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// Fix the broken Scene function signature
content = content.replace(
  'function Scene({ section, hyperspace, : { section: number; hyperspace: boolean; ) {',
  'function Scene({ section, hyperspace }: { section: number; hyperspace: boolean }) {'
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
