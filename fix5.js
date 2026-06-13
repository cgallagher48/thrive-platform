const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// Remove all missing component calls
content = content.replace(`      {/* Asteroid belt around ATLAS */}
      <AsteroidBelt radius={8} width={3} count={500} ySpread={1.2} />

      {/* Outer asteroid belt */}
      <AsteroidBelt radius={18} width={4} count={300} ySpread={2} />`, '')

content = content.replace('<Planet', '{/* <Planet')
content = content.replace(/\s*\/>(\s*\n\s*<\/Planet>)?/g, (m, p1) => p1 ? '' : m)
content = content.replace('<DistantGalaxy', '{/* <DistantGalaxy')

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
