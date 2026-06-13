const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

content = content.replace(
  'const  else {',
  'const seen = localStorage.getItem(\'thriveIntroSeen\')\n    if (seen) {\n      setPhase(\'site\')\n    } else {'
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
