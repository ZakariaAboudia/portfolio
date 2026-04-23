'use client'

import { useEffect, useRef, useState } from 'react'

const LINE_COUNT = 18
const DASH_LEN = 2200
const EXIT_MS = 320

const LINES = Array.from({ length: LINE_COUNT }, (_, i) => ({
  id: i,
  y1: 25 + (i / (LINE_COUNT - 1)) * 550,
  // slight angle per line — not perfectly horizontal, like hand strokes
  dy: (i % 5 - 2) * 1.8,
  sw: 0.55 + (i % 4) * 0.28,
  opacity: 0.062 + (i % 5) * 0.019,
  enterDelay: i * 26,
  enterDuration: 310 + (i % 4) * 55,
}))

export function PenScratchOverlay({ open }: { open: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  const rafRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setMounted(true)
      // double RAF: let component render with dashoffset=DASH_LEN, then animate to 0
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setAnimating(true))
      })
    } else {
      cancelAnimationFrame(rafRef.current)
      setAnimating(false)
      timerRef.current = setTimeout(() => setMounted(false), EXIT_MS + 50)
    }
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [open])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[31] pointer-events-none" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
      >
        <defs>
          <filter id="pen-wave-rough" x="-2%" y="-5%" width="104%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.013 0.052"
              numOctaves="3"
              seed="12"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* dim wash behind the scratch */}
        <rect
          width="1000"
          height="600"
          fill="var(--bg-base)"
          style={{
            opacity: animating ? 0.66 : 0,
            transition: `opacity ${animating ? 220 : EXIT_MS}ms ease-out`,
          }}
        />

        {/* wobbly scratch lines — drawn in as a wave sweep left→right */}
        <g filter="url(#pen-wave-rough)">
          {LINES.map(({ id, y1, dy, sw, opacity, enterDelay, enterDuration }) => (
            <line
              key={id}
              x1="-20"
              y1={y1}
              x2="1020"
              y2={y1 + dy}
              stroke="var(--text-primary)"
              strokeWidth={sw}
              strokeLinecap="round"
              style={{
                opacity,
                strokeDasharray: DASH_LEN,
                strokeDashoffset: animating ? 0 : DASH_LEN,
                transition: animating
                  ? `stroke-dashoffset ${enterDuration}ms ease-out ${enterDelay}ms`
                  : `stroke-dashoffset ${EXIT_MS}ms ease-in`,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
