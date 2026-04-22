'use client'

import { useEffect, useRef, useState } from 'react'

interface RoughDotsProps {
  level: number
  max?: number
  size?: number
  gap?: number
}

function skillSeed(level: number, i: number) {
  return (level * 17 + i * 31) % 999
}

export default function RoughDots({ level, max = 5, size = 8, gap = 4 }: RoughDotsProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [failed, setFailed] = useState(false)

  const totalWidth = max * size + (max - 1) * gap

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    import('roughjs').then(m => {
      const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
      const rc = rough.svg(svg) as any
      svg.innerHTML = ''
      for (let i = 0; i < max; i++) {
        const cx = i * (size + gap) + size / 2
        const cy = size / 2
        const filled = i < level
        const node = rc.circle(cx, cy, size - 1, {
          roughness: 0.9,
          bowing: 0.3,
          seed: skillSeed(level, i),
          stroke: 'var(--accent)',
          strokeWidth: 1.2,
          fill: filled ? 'var(--accent)' : 'none',
          fillStyle: 'solid',
        })
        svg.appendChild(node as unknown as Node)
      }
    }).catch(() => setFailed(true))
  }, [level, max, size, gap])

  if (failed) {
    return (
      <span className="font-mono text-accent text-xs tracking-wider" aria-hidden="true">
        {'●'.repeat(level)}{'○'.repeat(max - level)}
      </span>
    )
  }

  return (
    <svg
      ref={svgRef}
      width={totalWidth}
      height={size}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' }}
    />
  )
}
