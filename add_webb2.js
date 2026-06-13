const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

const webbBg = `      {/* Webb deep field background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: "url('/textures/webb-deep-field.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.28) saturate(1.6)',
        transform: 'scale(1.06)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, rgba(1,0,8,0.15) 0%, rgba(1,0,8,0.6) 100%)' }} />

      `

content = content.replace('{/* Fixed cinematic 3D canvas */', webbBg + '{/* Fixed cinematic 3D canvas */')

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Done. Has webb:', content.includes('webb-deep-field'))
