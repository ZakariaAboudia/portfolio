'use client'

import { useRef, useEffect, useCallback } from 'react'

interface RoughTopbarProps {
  children: React.ReactNode
}

export default function RoughTopbar({ children }: RoughTopbarProps) {
  const containerRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const draw = useCallback(async () => {
    const el = containerRef.current
    const svg = svgRef.current
    if (!el || !svg) return
    const { width } = el.getBoundingClientRect()
    if (!width) return

    svg.setAttribute('width', String(width))
    svg.setAttribute('height', '2')

    try {
      const m = await import('roughjs')
      const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
      const rc = rough.svg(svg)
      svg.innerHTML = ''
      const node = rc.line(0, 1, width, 1, {
        roughness: 0.8,
        bowing: 0.5,
        stroke: 'var(--border-subtle)',
        strokeWidth: 1.2,
        seed: 77,
      })
      svg.appendChild(node as unknown as Node)
    } catch {
      svg.innerHTML = `<line x1="0" y1="1" x2="${width}" y2="1" stroke="var(--border-subtle)" stroke-width="1"/>`
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
    <header
      ref={containerRef}
      className="h-14 flex items-center justify-end gap-3 px-4 shrink-0 relative"
    >
      {children}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      />
    </header>
  )
}
