const fs = require('fs')

const textureGen = `'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function generatePlanetTexture(
  type: 'rocky' | 'gas' | 'ice' | 'lava' | 'ocean' | 'desert',
  seed: number = 0
): THREE.CanvasTexture {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const rng = (n: number) => {
    const x = Math.sin(n + seed) * 43758.5453
    return x - Math.floor(x)
  }

  if (type === 'rocky') {
    // Deep space rocky planet
    const base = ctx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#2A1810')
    base.addColorStop(0.3, '#3D2418')
    base.addColorStop(0.6, '#4A2E1A')
    base.addColorStop(1, '#1E1008')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)

    // Surface detail noise
    for (let i = 0; i < 8000; i++) {
      const x = rng(i * 3) * size
      const y = rng(i * 3 + 1) * size
      const r = rng(i * 3 + 2) * 12 + 2
      const alpha = rng(i * 5) * 0.15
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      const dark = rng(i * 7) > 0.5
      grad.addColorStop(0, dark ? 'rgba(10,5,2,'+alpha+')' : 'rgba(80,50,30,'+alpha+')')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Craters
    for (let i = 0; i < 25; i++) {
      const x = rng(i * 11) * size
      const y = rng(i * 11 + 1) * size
      const r = rng(i * 11 + 2) * 40 + 8
      ctx.strokeStyle = 'rgba(20,10,5,0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      const inner = ctx.createRadialGradient(x, y, 0, x, y, r * 0.8)
      inner.addColorStop(0, 'rgba(5,3,1,0.3)')
      inner.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = inner
      ctx.beginPath()
      ctx.arc(x, y, r * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (type === 'gas') {
    // Jupiter-like bands
    const colors = ['#C88040', '#A05020', '#D4A060', '#8B4010', '#E0B870', '#6B3008']
    let y = 0
    for (let band = 0; band < 24; band++) {
      const h = (size / 24) * (0.6 + rng(band * 7) * 0.8)
      const colorIdx = Math.floor(rng(band * 3) * colors.length)
      ctx.fillStyle = colors[colorIdx]
      ctx.fillRect(0, y, size, h + 2)

      // Turbulence on bands
      for (let i = 0; i < 30; i++) {
        const wx = rng(band * 100 + i) * size
        const wy = y + rng(band * 100 + i + 1) * h
        const wr = rng(band * 100 + i + 2) * 30 + 5
        ctx.fillStyle = 'rgba(' + (rng(band*7+1) > 0.5 ? '255,200,100' : '80,40,10') + ',0.15)'
        ctx.beginPath()
        ctx.ellipse(wx, wy, wr * 2, wr * 0.4, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      y += h
    }

    // Great spot
    const spotX = size * 0.65
    const spotY = size * 0.55
    const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 60)
    spotGrad.addColorStop(0, 'rgba(220,80,20,0.8)')
    spotGrad.addColorStop(0.5, 'rgba(180,60,10,0.5)')
    spotGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = spotGrad
    ctx.beginPath()
    ctx.ellipse(spotX, spotY, 70, 45, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  if (type === 'ice') {
    // Ice blue planet
    const base = ctx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#0a2a4a')
    base.addColorStop(0.5, '#1a4a7a')
    base.addColorStop(1, '#0a1a3a')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)

    for (let i = 0; i < 3000; i++) {
      const x = rng(i * 4) * size
      const y = rng(i * 4 + 1) * size
      const r = rng(i * 4 + 2) * 20 + 3
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(150,220,255,0.12)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Ice caps
    const capGrad = ctx.createRadialGradient(size/2, 0, 0, size/2, 0, size * 0.35)
    capGrad.addColorStop(0, 'rgba(200,240,255,0.7)')
    capGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = capGrad
    ctx.fillRect(0, 0, size, size)
  }

  if (type === 'lava') {
    ctx.fillStyle = '#0A0000'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 200; i++) {
      const x = rng(i * 6) * size
      const y = rng(i * 6 + 1) * size
      const r = rng(i * 6 + 2) * 60 + 10
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255,120,0,0.6)')
      grad.addColorStop(0.4, 'rgba(200,50,0,0.3)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (type === 'desert') {
    const base = ctx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#8B4513')
    base.addColorStop(0.5, '#A0522D')
    base.addColorStop(1, '#6B3410')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 5000; i++) {
      const x = rng(i * 3) * size
      const y = rng(i * 3 + 1) * size
      const r = rng(i * 3 + 2) * 8 + 1
      ctx.fillStyle = 'rgba(' + (rng(i*7) > 0.5 ? '180,100,40' : '60,30,10') + ',0.1)'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (type === 'ocean') {
    const base = ctx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#001428')
    base.addColorStop(0.5, '#002040')
    base.addColorStop(1, '#000c1e')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 2000; i++) {
      const x = rng(i * 5) * size
      const y = rng(i * 5 + 1) * size
      const r = rng(i * 5 + 2) * 25 + 3
      ctx.fillStyle = 'rgba(0,100,200,0.08)'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Continents
    for (let i = 0; i < 8; i++) {
      const x = rng(i * 13) * size
      const y = rng(i * 13 + 1) * size
      const r = rng(i * 13 + 2) * 100 + 30
      ctx.fillStyle = 'rgba(20,80,20,0.5)'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Atmospheric rim light on all planets
  const rimGrad = ctx.createRadialGradient(size*0.35, size*0.35, size*0.3, size/2, size/2, size*0.5)
  rimGrad.addColorStop(0, 'rgba(255,255,255,0.03)')
  rimGrad.addColorStop(0.7, 'rgba(255,255,255,0)')
  rimGrad.addColorStop(1, 'rgba(255,255,255,0.06)')
  ctx.fillStyle = rimGrad
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
  ctx.fill()

  return new THREE.CanvasTexture(canvas)
}

export function generateNebulaTexture(color1: string, color2: string, seed: number): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, size, size)

  const rng = (n: number) => { const x = Math.sin(n + seed) * 43758.5453; return x - Math.floor(x) }

  for (let i = 0; i < 80; i++) {
    const x = rng(i * 3) * size
    const y = rng(i * 3 + 1) * size
    const r = rng(i * 3 + 2) * 120 + 20
    const alpha = rng(i * 7) * 0.08 + 0.02
    const useColor1 = rng(i * 11) > 0.5
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, (useColor1 ? color1 : color2).replace(')', ',' + alpha + ')').replace('rgb', 'rgba'))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return new THREE.CanvasTexture(canvas)
}
`

fs.writeFileSync('lib/textureGen.ts', textureGen, 'utf8')
console.log('Texture generator created')
