'use client'

import { useRef, useEffect, useState } from 'react'

const COLOR_MAP = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  muted: 'var(--text-muted)',
}

const PIN_PATH = 'M12,2 C6.5,2 2,6.5 2,12 C2,20 12,34 12,34 C12,34 22,20 22,12 C22,6.5 17.5,2 12,2 Z'

interface RoughPinProps {
  colorTier: 'accent' | 'success' | 'muted'
  seed: number
  reducedMotion: boolean
}

export default function RoughPin({ colorTier, seed, reducedMotion: _reducedMotion }: RoughPinProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [roughFailed, setRoughFailed] = useState(false)
  const color = COLOR_MAP[colorTier]

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    let cancelled = false

    import('roughjs').then(roughModule => {
      if (cancelled || roughFailed) return
      try {
        const rough = (roughModule.default ?? roughModule) as unknown as typeof import('roughjs').default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rc = rough.svg(svg) as any
        svg.innerHTML = ''
        const node = rc.path(PIN_PATH, {
          fill: color,
          fillStyle: 'solid',
          stroke: color,
          roughness: 0.8,
          bowing: 0.5,
          seed,
        })
        svg.appendChild(node as unknown as Node)
      } catch {
        setRoughFailed(true)
      }
    }).catch(() => {
      if (!cancelled) setRoughFailed(true)
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, seed])

  if (roughFailed) {
    return (
      <svg width="24" height="36" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill={color} />
      </svg>
    )
  }

  return (
    <svg
      ref={svgRef}
      width="24"
      height="36"
      aria-hidden="true"
    />
  )
}
