const fs = require('fs')
const content = fs.readFileSync('app/page.tsx', 'utf8')

// Check if webb background exists
if (content.includes('webb-deep-field')) {
  console.log('Already has Webb background')
} else {
  console.log('Missing Webb background - need to rebuild')
  console.log('Current file has:', content.includes('DysonStructure') ? 'DysonStructure' : 'NO Dyson')
  console.log('Current file has:', content.includes('IntroSequence') ? 'IntroSequence' : 'NO Intro')
}
