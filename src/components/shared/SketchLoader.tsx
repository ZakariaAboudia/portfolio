'use client'

import { useRef, useEffect, useState } from 'react'

interface SketchLoaderProps {
  label?: string
  className?: string
  size?: number
  color?: string
  speed?: number // in seconds
}

export default function SketchLoader({
  label,
  className = '',
  size = 120,
  color,
  speed = 3
}: SketchLoaderProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [seed, setSeed] = useState(0)

  // Subtle "flicker" makes the hand-drawn lines feel alive
  useEffect(() => {
    const interval = setInterval(() => setSeed(s => s + 1), 1500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const draw = async () => {
      try {
        const roughModule = await import('roughjs')
        const rough = (roughModule.default ?? roughModule) as typeof import('roughjs').default
        const rc = rough.svg(svg)
        svg.innerHTML = ''

        const style = getComputedStyle(document.documentElement)
        const strokeColor = color || style.getPropertyValue('--accent').trim() || '#e8a020'
        const subtle = style.getPropertyValue('--text-muted').trim() || '#6b6257'

        const center = 100
        const s = 40 // Cube side length

        // Draw an isometric cube skeleton
        const points = [
          [center, center - s],         // Top
          [center + s, center - s/2],   // Right
          [center + s, center + s/2],   // Bottom-Right
          [center, center + s],         // Bottom
          [center - s, center + s/2],   // Bottom-Left
          [center - s, center - s/2],   // Left
        ]

        const options = {
          stroke: strokeColor,
          strokeWidth: 1.5,
          roughness: 2,
          seed: seed
        }

        // Outer Hexagon
        const hex = rc.polygon(points as any, options)
        hex.classList.add('sketch-line')
        svg.appendChild(hex)

        // Internal Y-shape (to make it look 3D)
        const innerLines = [
          rc.line(center, center, center, center + s, options),
          rc.line(center, center, center + s, center - s/2, options),
          rc.line(center, center, center - s, center - s/2, options),
        ]

        innerLines.forEach((l, i) => {
          l.classList.add('sketch-line')
          l.style.setProperty('--delay', `${i * 200}ms`)
          svg.appendChild(l)
        })

      } catch (e) {
        console.error('SketchLoader draw error:', e)
      }
    }
    draw()
  }, [seed, color])

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <style>{`
        @keyframes sketchLoop {
          0% { stroke-dashoffset: 800; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -800; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
        }
        .sketch-line path, .sketch-line line {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: sketchLoop ${speed}s ease-in-out infinite;
          animation-delay: var(--delay, 0ms);
        }
        .sketch-label {
          animation: pulse 1.5s infinite ease-in-out;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.05em;
        }
      `}</style>
      
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{ display: 'block', overflow: 'visible' }}
      />
      
      {label && (
        <div className="sketch-label text-[10px] uppercase opacity-80" style={{ color: color || 'inherit' }}>
          {label}
        </div>
      )}
    </div>
  )
}
