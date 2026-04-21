'use client'

import { useRef, useEffect } from 'react'

interface Props {
  seed: number
  techCount: number
  className?: string
}

function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

export default function ProjectIllustration({ seed, techCount, className = '' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const draw = async () => {
      try {
        const roughModule = await import('roughjs')
        const rough = (roughModule.default ?? roughModule) as typeof import('roughjs').default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rc = rough.svg(svg) as any

        svg.innerHTML = ''

        const rand = lcg(seed)
        const style = getComputedStyle(svg)
        const stroke = style.getPropertyValue('--border-default').trim() || '#3a342a'
        const accent = style.getPropertyValue('--accent').trim() || '#e8a020'
        const subtle = style.getPropertyValue('--border-subtle').trim() || '#2a2520'

        const W = 280
        const H = 300
        const cx = W / 2
        const cy = H / 2

        const base = (color: string, r: number, sw: number) => ({
          stroke: color,
          strokeWidth: sw,
          roughness: r,
          fill: 'none',
          seed: (seed + 7) >>> 0,
        })

        // Main specimen circle
        const mainR = 72 + rand() * 22
        svg.appendChild(rc.circle(cx, cy, mainR * 2, base(stroke, 1.4, 1.3)))

        // Second concentric ring
        svg.appendChild(rc.circle(cx, cy, mainR * 1.45, base(subtle, 1.0, 0.7)))

        // Inner nucleus circle
        const innerR = mainR * (0.28 + rand() * 0.12)
        svg.appendChild(rc.circle(cx, cy, innerR * 2, base(stroke, 1.1, 0.9)))

        // Radial spokes from nucleus edge to main circle
        const spokeCount = 5 + Math.floor(rand() * 4)
        const baseAngle = rand() * Math.PI * 2
        for (let i = 0; i < spokeCount; i++) {
          const angle = baseAngle + (i / spokeCount) * Math.PI * 2
          const jitter = (rand() - 0.5) * 0.25
          const a = angle + jitter
          const x1 = cx + Math.cos(a) * innerR
          const y1 = cy + Math.sin(a) * innerR
          const x2 = cx + Math.cos(a) * mainR * (0.85 + rand() * 0.12)
          const y2 = cy + Math.sin(a) * mainR * (0.85 + rand() * 0.12)
          svg.appendChild(rc.line(x1, y1, x2, y2, base(subtle, 0.6, 0.7)))
        }

        // Satellite circles — one per tech item (max 8)
        const satelliteCount = Math.min(Math.max(techCount, 1), 8)
        for (let i = 0; i < satelliteCount; i++) {
          const angle = (i / satelliteCount) * Math.PI * 2 + rand() * 0.4
          const dist = mainR + 14 + rand() * 12
          const sx = cx + Math.cos(angle) * dist
          const sy = cy + Math.sin(angle) * dist
          const sr = 6 + rand() * 8
          const isFirst = i === 0
          svg.appendChild(rc.circle(sx, sy, sr * 2, base(isFirst ? accent : stroke, 0.9, isFirst ? 1.1 : 0.8)))
        }

        // Corner brackets
        const bLen = 18
        const bPad = 12
        // top-left
        svg.appendChild(rc.line(bPad, bPad + bLen, bPad, bPad, base(subtle, 0.4, 0.8)))
        svg.appendChild(rc.line(bPad, bPad, bPad + bLen, bPad, base(subtle, 0.4, 0.8)))
        // bottom-right
        svg.appendChild(rc.line(W - bPad, H - bPad - bLen, W - bPad, H - bPad, base(subtle, 0.4, 0.8)))
        svg.appendChild(rc.line(W - bPad, H - bPad, W - bPad - bLen, H - bPad, base(subtle, 0.4, 0.8)))

        // Amber x mark — placed outside the main circle
        const xAngle = rand() * Math.PI * 2
        const xDist = mainR * 1.7 + rand() * 15
        const xc = cx + Math.cos(xAngle) * Math.min(xDist, cx - 20)
        const yc = cy + Math.sin(xAngle) * Math.min(xDist, cy - 20)
        const xSize = 5
        svg.appendChild(rc.line(xc - xSize, yc - xSize, xc + xSize, yc + xSize, base(accent, 0.5, 1.1)))
        svg.appendChild(rc.line(xc + xSize, yc - xSize, xc - xSize, yc + xSize, base(accent, 0.5, 1.1)))
      } catch {
        // roughjs unavailable — leave svg empty, ornaments show through
      }
    }

    draw()
  }, [seed, techCount])

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 280 300"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto' }}
    />
  )
}
