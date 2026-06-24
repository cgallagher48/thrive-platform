const fs = require('fs')
const page = fs.readFileSync('app/page.tsx', 'utf8')
console.log(page.split('\n').length)
