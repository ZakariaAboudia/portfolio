'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface RoughCardProps {
  children: React.ReactNode
  className?: string
  seed?: number
  roughness?: number
  padding?: string
}

function drawFallbackRect(
  svg: SVGSVGElement,
  width: number,
  height: number,
  strokeColor: string
) {
  svg.innerHTML = ''
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', '1')
  rect.setAttribute('y', '1')
  rect.setAttribute('width', String(width - 2))
  rect.setAttribute('height', String(height - 2))
  rect.setAttribute('rx', '4')
  rect.setAttribute('fill', 'none')
  rect.setAttribute('stroke', strokeColor)
  rect.setAttribute('stroke-width', '1.5')
  svg.appendChild(rect)
}

async function drawRoughRect(
  svg: SVGSVGElement,
  width: number,
  height: number,
  roughness: number,
  seed: number,
  strokeColor: string
) {
  try {
    const roughModule = await import('roughjs')
    const rough = (roughModule.default ?? roughModule) as unknown as typeof import('roughjs').default
    const rc = rough.svg(svg) as any
    svg.innerHTML = ''
    const node = rc.rectangle(2, 2, width - 4, height - 4, {
      roughness,
      bowing: 0.4,
      stroke: strokeColor,
      strokeWidth: 1.5,
      fill: 'none',
      seed,
    })
    svg.appendChild(node as unknown as Node)
  } catch {
    drawFallbackRect(svg, width, height, strokeColor)
  }
}

let _idCounter = 0

export default function RoughCard({
  children,
  className = '',
  seed,
  roughness,
  padding,
}: RoughCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [stableSeed] = useState<number>(() => seed ?? ++_idCounter)

  const render = useCallback(() => {
    const el = containerRef.current
    const svg = svgRef.current
    if (!el || !svg) return

    const { width, height } = el.getBoundingClientRect()
    if (width === 0 || height === 0) return

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const r = roughness ?? (isMobile ? 0.7 : 1.0)

    const strokeColor =
      getComputedStyle(el).getPropertyValue('--border-default').trim() ||
      '#3a342a'

    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))

    drawRoughRect(svg, width, height, r, stableSeed, strokeColor)
  }, [roughness, stableSeed])

  const debouncedRender = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(render, 100)
  }, [render])

  useEffect(() => {
    render()

    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(debouncedRender)
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [render, debouncedRender])

  return (
    <div ref={containerRef} className={`relative ${padding ?? ''} ${className}`}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-visible"
        style={{ pointerEvents: 'none' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
