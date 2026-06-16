const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// Fix all .material.opacity patterns
content = content.replace(
  /(\w+)\.current\.material\.opacity\s*=/g,
  '(($1.current.material as any) || {}).opacity ='
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
