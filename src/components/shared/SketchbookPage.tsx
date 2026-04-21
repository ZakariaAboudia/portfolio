'use client'

import { useRef, useEffect, useCallback } from 'react'

interface SketchbookPageProps {
  children: React.ReactNode
  annotation?: string
}

export default function SketchbookPage({ children, annotation = 'size & weight = proficiency' }: SketchbookPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const draw = useCallback(async () => {
    const el = containerRef.current
    const svg = svgRef.current
    if (!el || !svg) return
    const { width, height } = el.getBoundingClientRect()
    if (!width || !height) return

    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))

    try {
      const m = await import('roughjs')
      const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
      const rc = rough.svg(svg)
      svg.innerHTML = ''

      // Outer page border — heavy, characterful
      const border = rc.rectangle(3, 3, width - 6, height - 6, {
        roughness: 1.2,
        bowing: 0.3,
        stroke: 'var(--border-default)',
        strokeWidth: 1.8,
        fill: 'none',
        seed: 42,
      })
      svg.appendChild(border as unknown as Node)

      // Top-left corner bracket
      const tl1 = rc.line(3, 24, 3, 3, { roughness: 0.8, stroke: 'var(--accent)', strokeWidth: 1.2, seed: 1 })
      const tl2 = rc.line(3, 3, 24, 3, { roughness: 0.8, stroke: 'var(--accent)', strokeWidth: 1.2, seed: 2 })
      svg.appendChild(tl1 as unknown as Node)
      svg.appendChild(tl2 as unknown as Node)

      // Bottom-right corner bracket
      const br1 = rc.line(width - 3, height - 24, width - 3, height - 3, { roughness: 0.8, stroke: 'var(--accent)', strokeWidth: 1.2, seed: 3 })
      const br2 = rc.line(width - 3, height - 3, width - 24, height - 3, { roughness: 0.8, stroke: 'var(--accent)', strokeWidth: 1.2, seed: 4 })
      svg.appendChild(br1 as unknown as Node)
      svg.appendChild(br2 as unknown as Node)
    } catch {
      svg.innerHTML = `<rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="2" fill="none" stroke="var(--border-default)" stroke-width="1.5"/>`
    }
  }, [])

  useEffect(() => {
    draw()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} className="relative min-h-[60vh]">
      <svg ref={svgRef} aria-hidden="true" className="absolute inset-0 overflow-visible" style={{ pointerEvents: 'none' }} />

      {/* Page content */}
      <div className="relative z-10 p-8">
        {children}
      </div>

      {/* Bottom annotation note */}
      <div className="absolute bottom-4 right-6 z-10">
        <span className="text-xs font-mono text-text-muted italic opacity-60">
          ↖ {annotation}
        </span>
      </div>
    </div>
  )
}
