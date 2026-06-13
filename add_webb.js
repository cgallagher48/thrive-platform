const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// 1. Add useState, useEffect imports if needed
if (!content.includes("'loading' | 'intro' | 'site'")) {

  // Add phase state and mounted state to the main component
  content = content.replace(
    "  const [mounted, setMounted] = useState(false)",
    "  const [phase, setPhase] = useState('loading')\n  const [mounted, setMounted] = useState(false)"
  )

  // Update the mounted useEffect to check localStorage
  content = content.replace(
    "  useEffect(() => { setMounted(true) }, [])",
    `  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem('thriveIntroSeen')
    if (seen) {
      setPhase('site')
    } else {
      setPhase('intro')
    }
  }, [])`
  )
}

// 2. Add Webb background div before the 3D canvas
content = content.replace(
  "      {/* Fixed 3D Canvas - ATLAS only */}",
  `      {/* Webb telescope background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: "url('/textures/webb-deep-field.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.3) saturate(1.5)',
        transform: 'scale(1.05)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, rgba(1,0,8,0.2) 0%, rgba(1,0,8,0.65) 100%)' }} />

      {/* Fixed 3D Canvas - ATLAS only */}`
)

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Webb background added')
console.log('Has webb:', content.includes('webb-deep-field'))
