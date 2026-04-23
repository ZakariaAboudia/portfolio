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

const TIER_COLORS: Record<string, string> = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  muted: 'var(--text-muted)',
}

export default function RoughWorldMap({ pins, projects = [], ariaLabel, fallbackMessage, className = '' }: RoughWorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [ready, setReady] = useState(false)
  const [roughFailed, setRoughFailed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(0)

  const totalProjects = pins.reduce((sum, p) => sum + p.projects.length, 0)

  useEffect(() => {
    if (!ready || totalProjects === 0) return
    let frame: number
    const duration = 900
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayCount(Math.round(eased * totalProjects))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready, totalProjects])

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
        {/* Stat counter */}
        {ready && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 bg-bg-elevated/80 border border-border-default/60 rounded select-none pointer-events-none z-10"
            style={{ backdropFilter: 'blur(6px)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] text-text-muted">
              <span className="text-text-primary font-semibold tabular-nums">{displayCount}</span>
              {' '}projects · {' '}
              <span className="text-text-primary font-semibold">{pins.length}</span>
              {' '}regions
            </span>
          </div>
        )}

        {ready && pins.map((pin, index) => {
          const [px, py] = project(pin.lng, pin.lat)
          const leftPct = (px / 1000) * 100
          const topPct = (py / 500) * 100
          const pinColor = TIER_COLORS[pin.colorTier]
          const count = pin.projects.length

          return (
            <div
              key={pin.region}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
              }}
            >
              {/* Sonar pulse ring */}
              {!reducedMotion && (
                <span
                  className="absolute rounded-full animate-ping pointer-events-none"
                  style={{
                    width: 14,
                    height: 14,
                    top: -30,
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    backgroundColor: pinColor,
                    opacity: 0.3,
                    animationDelay: `${index * 300}ms`,
                    animationDuration: '2.4s',
                  }}
                />
              )}

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    aria-label={`${pin.region} — ${count} project${count !== 1 ? 's' : ''}`}
                    onClick={() => setActiveRegion(pin.region)}
                    className="relative"
                    style={{
                      transform: 'translate(-50%, -100%)',
                      opacity: 1,
                      transition: `opacity 350ms ease-out ${index * 70}ms, transform 200ms ease`,
                    }}
                  >
                    <RoughPin colorTier={pin.colorTier} seed={pin.seed} reducedMotion={reducedMotion} />
                    {count > 0 && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center w-[14px] h-[14px] rounded-full border text-[8px] font-mono font-bold"
                        style={{
                          backgroundColor: 'var(--bg-base)',
                          borderColor: pinColor,
                          color: pinColor,
                          lineHeight: 1,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-bg-elevated border border-border-default text-text-primary text-xs px-2 py-1 rounded z-50"
                    sideOffset={4}
                  >
                    <span className="font-semibold">{pin.region}</span>
                    <span className="text-text-muted ml-1">· {count} project{count !== 1 ? 's' : ''}</span>
                    <Tooltip.Arrow className="fill-border-default" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          )
        })}
      </div>

      <ul className="sr-only" aria-label="Project locations list">
        {pins.map(p => <li key={p.region}>{p.region}</li>)}
      </ul>

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
