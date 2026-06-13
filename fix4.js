const fs = require('fs')
let content = fs.readFileSync('app/page.tsx', 'utf8')

// Fix DysonStructure call to ATLASMegastructure
content = content.replace('<DysonStructure  />', '<ATLASMegastructure />')

// Remove VolumetricNebula call
content = content.replace(`      {/* Volumetric nebula clouds */}
      <VolumetricNebula />`, '')

fs.writeFileSync('app/page.tsx', content, 'utf8')
console.log('Fixed')
