'use client'

import { useRef, useEffect, useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import RoughPin from '@/components/portfolio/RoughPin'
import RoughCard from '@/components/shared/RoughCard'
import { WORLD_LAND_PATHS, project } from '@/lib/world-land-paths'
import type { MapPin } from '@/lib/map-pins'
import RegionProjectsDrawer from './RegionProjectsDrawer'

interface ProjectData {
  id: string
  slug: string
  titleStr: string
  clientRegion: string | null
}

interface RoughWorldMapProps {
  pins: MapPin[]
  projects?: ProjectData[]
  ariaLabel: string
  fallbackMessage: string
  className?: string
}

export default function RoughWorldMap({ pins, projects = [], ariaLabel, fallbackMessage, className = '' }: RoughWorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [ready, setReady] = useState(false)
  const [roughFailed, setRoughFailed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    let cancelled = false

    import('roughjs').then(roughModule => {
      if (cancelled) return
      try {
        const rough = (roughModule.default ?? roughModule) as unknown as typeof import('roughjs').default
        const rc = rough.svg(svg)
        const style = getComputedStyle(document.documentElement)
        const landFill = style.getPropertyValue('--bg-elevated').trim()
        const landStroke = style.getPropertyValue('--border-default').trim()

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        g.setAttribute('class', 'land-paths')

        WORLD_LAND_PATHS.forEach((d, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const node = (rc as any).path(d, {
            fill: landFill,
            fillStyle: 'solid',
            stroke: landStroke,
            strokeWidth: 0.6,
            roughness: 1.1,
            bowing: 0.4,
            seed: i + 1,
          })
          g.appendChild(node)
        })

        // Insert before any existing children (pins sit on top)
        svg.insertBefore(g, svg.firstChild)
        setReady(true)
      } catch {
        setRoughFailed(true)
      }
    }).catch(() => { if (!cancelled) setRoughFailed(true) })

    return () => { cancelled = true }
  }, [])

  if (roughFailed) {
    return (
      <RoughCard className={`flex items-center justify-center min-h-[200px] ${className}`} padding="p-6">
        <p className="text-text-muted text-sm text-center">{fallbackMessage}</p>
      </RoughCard>
    )
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div role="img" aria-label={ariaLabel} className={`relative overflow-hidden ${className}`}>
        {/* Ocean background */}
        <svg
          ref={svgRef}
          viewBox="0 0 1000 500"
          className="w-full h-full"
          style={{ display: 'block', background: 'var(--bg-surface)' }}
          aria-hidden="true"
        />

        {/* Pin overlay — absolutely positioned over SVG using same projection */}
        {ready && pins.map(pin => {
          const [px, py] = project(pin.lng, pin.lat)
          const leftPct = (px / 1000) * 100
          const topPct = (py / 500) * 100

          return (
            <Tooltip.Root key={pin.region}>
              <Tooltip.Trigger asChild>
                <button
                  aria-label={pin.region}
                  onClick={() => setActiveRegion(pin.region)}
                  className={reducedMotion ? '' : 'hover:scale-[1.2] transition-transform cursor-pointer'}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <RoughPin colorTier={pin.colorTier} seed={pin.seed} reducedMotion={reducedMotion} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-bg-elevated border border-border-default text-text-primary text-xs px-2 py-1 rounded z-50"
                  sideOffset={4}
                >
                  {pin.region}
                  <Tooltip.Arrow className="fill-border-default" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )
        })}
      </div>

      <ul className="sr-only" aria-label="Project locations list">
        {pins.map(p => <li key={p.region}>{p.region}</li>)}
      </ul>

      {/* Piece of Paper Tooltip Overlay */}
      {ready && (
        <div 
          className="absolute bottom-4 right-4 bg-bg-elevated border border-border-default px-3 py-2 z-10 pointer-events-none transform rotate-[-2deg] shadow-sm select-none"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          <div className="absolute top-[-5px] left-[50%] transform -translate-x-1/2 w-8 h-2 bg-text-muted opacity-20 rounded"></div>
          <p className="text-[11px] text-text-primary">
            📍 Click a pin to<br/>view regional projects
          </p>
        </div>
      )}

      {/* Slide-out Drawer */}
      <RegionProjectsDrawer
        region={activeRegion}
        projects={projects}
        isOpen={!!activeRegion}
        onClose={() => setActiveRegion(null)}
      />
    </Tooltip.Provider>
  )
}
