'use client'

import { useRef, useEffect, useState } from 'react'

interface RoughUnderlineProps {
  children: React.ReactNode
  className?: string
  seed?: number
}

let _seed = 100

export default function RoughUnderline({ children, className = '', seed }: RoughUnderlineProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [stableSeed] = useState(() => seed ?? ++_seed)

  useEffect(() => {
    const el = textRef.current
    const svg = svgRef.current
    if (!el || !svg) return

    const draw = async () => {
      const { width } = el.getBoundingClientRect()
      if (width === 0) return

      svg.setAttribute('width', String(width))
      svg.setAttribute('height', '6')

      try {
        const m = await import('roughjs')
        const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
        const rc = rough.svg(svg)
        svg.innerHTML = ''
        const node = rc.line(0, 3, width, 3, {
          roughness: 1.4,
          bowing: 1,
          stroke: 'var(--accent)',
          strokeWidth: 2,
          seed: stableSeed,
        })
        svg.appendChild(node as unknown as Node)
      } catch {
        svg.innerHTML = `<line x1="0" y1="3" x2="${width}" y2="3" stroke="var(--accent)" stroke-width="2"/>`
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [stableSeed])

  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <span ref={textRef}>{children}</span>
      <svg ref={svgRef} aria-hidden="true" height="6" style={{ overflow: 'visible' }} />
    </span>
  )
}
