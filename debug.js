const fs = require('fs')
const content = fs.readFileSync('app/page.tsx', 'utf8')
const lines = content.split('\n')
lines.slice(390, 415).forEach((l, i) => console.log(390+i, l))
