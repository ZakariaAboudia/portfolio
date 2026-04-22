'use client'

import { useRef, useEffect, useState } from 'react'

interface SkillChipProps {
  name: string
  level: number // 1–5
}

// Deterministic hash from string → number
function nameHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const LEVEL_CONFIG = [
  { fontSize: '0.7rem',  roughness: 0.3, strokeWidth: 0.7, px: '8px',  py: '4px',  maxRot: 1.2 },
  { fontSize: '0.85rem', roughness: 0.9, strokeWidth: 1.1, px: '10px', py: '5px',  maxRot: 2.0 },
  { fontSize: '1rem',    roughness: 1.5, strokeWidth: 1.4, px: '12px', py: '6px',  maxRot: 2.5 },
  { fontSize: '1.2rem',  roughness: 2.1, strokeWidth: 1.9, px: '14px', py: '7px',  maxRot: 3.2 },
  { fontSize: '1.45rem', roughness: 2.9, strokeWidth: 2.4, px: '16px', py: '8px',  maxRot: 4.0 },
]

export default function SkillChip({ name, level }: SkillChipProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [ready, setReady] = useState(false)

  const cfg = LEVEL_CONFIG[Math.max(0, Math.min(4, level - 1))]
  const hash = nameHash(name)
  // Deterministic rotation: ±maxRot degrees
  const rotation = ((hash % 200) / 100 - 1) * cfg.maxRot
  const seed = hash % 9999

  useEffect(() => {
    const el = containerRef.current
    const svg = svgRef.current
    if (!el || !svg) return

    const draw = async () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return

      svg.setAttribute('width', String(width))
      svg.setAttribute('height', String(height))

      try {
        const m = await import('roughjs')
        const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
        const rc = rough.svg(svg)
        svg.innerHTML = ''
        const node = rc.rectangle(1, 1, width - 2, height - 2, {
          roughness: cfg.roughness,
          bowing: 0.5,
          stroke: 'var(--accent)',
          strokeWidth: cfg.strokeWidth,
          fill: 'none',
          seed,
        })
        svg.appendChild(node as unknown as Node)
        setReady(true)
      } catch {
        svg.innerHTML = `<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="3" fill="none" stroke="var(--accent)" stroke-width="${cfg.strokeWidth}"/>`
        setReady(true)
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cfg.roughness, cfg.strokeWidth, seed])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      style={{
        padding: `${cfg.py} ${cfg.px}`,
        transform: `rotate(${rotation}deg)`,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
      title={`${name} — level ${level}/5`}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-visible"
        style={{ pointerEvents: 'none' }}
      />
      <span
        className="relative z-10 font-mono text-text-primary select-none leading-none"
        style={{ fontSize: cfg.fontSize }}
      >
        {name}
      </span>
    </div>
  )
}
