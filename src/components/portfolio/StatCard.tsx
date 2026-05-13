'use client'

import { useRef, useEffect } from 'react'

interface StatCardProps {
  label: string
  value: number | string
  ariaLabel: string
  subLabel?: string
}

function RoughLeaderLine() {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    import('roughjs').then(m => {
      const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
      const rc = rough.svg(svg)
      svg.innerHTML = ''
      const node = rc.line(0, 10, 40, 10, {
        roughness: 1.4, bowing: 0,
        stroke: 'var(--accent)', strokeWidth: 2, seed: 3,
      })
      svg.appendChild(node as unknown as Node)
    }).catch(() => { })
  }, [])
  return <svg ref={ref} aria-hidden="true" width="40" height="20" style={{ overflow: 'visible' }} className="my-1" />
}

export default function StatCard({ label, value, ariaLabel, subLabel }: StatCardProps) {
  return (
    <div role="figure" aria-label={ariaLabel} className="flex flex-col">
      {/* Number — large, reads like a specimen measurement */}
      <p className="font-mono text-5xl font-bold text-text-primary leading-none tracking-tight">
        {value}
      </p>
      {/* Amber leader line connecting number to label */}
      <RoughLeaderLine />
      {/* Label — annotation style */}
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted leading-none">
        {label}
      </p>
      {subLabel && (
        <p className="font-mono text-xs text-text-muted mt-1 opacity-60">{subLabel}</p>
      )}
    </div>
  )
}
