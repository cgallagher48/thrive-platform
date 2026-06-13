const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

content = content.replace(
  `  const seen = localStorage.getItem('thriveIntroSeen')
    if (seen) {
      setPhase('site')
    } else {
      setPhase('intro')
    }
  }, [])`,
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

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
