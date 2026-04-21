'use client'

import { useRef, useEffect } from 'react'
import { t } from '@/lib/i18n'
import { formatDateRange } from '@/lib/format-date'
import type { TranslatableField } from '@/types/prisma'

interface TimelineEntry {
  id: string
  title: unknown
  description: unknown
  organization: string
  startDate: Date
  endDate: Date | null
  type: string
}

interface TimelineEntryCardProps {
  entry: TimelineEntry
  locale: string
  presentLabel: string
}

function formatStamp(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}

function RoughTick({ seed }: { seed: number }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    import('roughjs').then(m => {
      const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
      const rc = rough.svg(svg)
      svg.innerHTML = ''
      // Horizontal tick on the ruler
      const tick = rc.line(0, 6, 10, 6, {
        roughness: 1.2, stroke: 'var(--accent)', strokeWidth: 1.5, seed,
      })
      svg.appendChild(tick as unknown as Node)
    }).catch(() => {})
  }, [seed])
  return <svg ref={ref} aria-hidden="true" width="10" height="12" style={{ overflow: 'visible', display: 'inline-block' }} />
}

function RoughVerticalRule({ id }: { id: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = containerRef.current
    const svg = svgRef.current
    if (!el || !svg) return
    const draw = () => {
      const h = el.getBoundingClientRect().height
      if (!h) return
      svg.setAttribute('height', String(h))
      import('roughjs').then(m => {
        const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
        const rc = rough.svg(svg)
        svg.innerHTML = ''
        const line = rc.line(4, 0, 4, h, {
          roughness: 1.2, bowing: 1.5,
          stroke: 'var(--border-default)', strokeWidth: 1, seed: id.charCodeAt(0) % 40,
        })
        svg.appendChild(line as unknown as Node)
      }).catch(() => {})
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [id])

  return (
    <div ref={containerRef} className="absolute left-[3.25rem] top-0 bottom-0 w-2">
      <svg ref={svgRef} aria-hidden="true" width="8"
        className="absolute top-0" style={{ overflow: 'visible', pointerEvents: 'none' }} />
    </div>
  )
}

export default function TimelineEntryCard({ entry, locale, presentLabel }: TimelineEntryCardProps) {
  const title = t(entry.title as unknown as TranslatableField, locale)
  const description = t(entry.description as unknown as TranslatableField, locale)
  const dateRange = formatDateRange(entry.startDate, entry.endDate, presentLabel)
  const stamp = formatStamp(entry.startDate)
  const seed = entry.id.charCodeAt(0) % 99

  return (
    <div className="relative flex gap-6">
      {/* Left: date stamp column */}
      <div className="shrink-0 w-12 pt-0.5 flex flex-col items-end gap-1">
        <RoughTick seed={seed} />
        <span className="font-mono text-xs text-accent leading-none">{stamp}</span>
      </div>

      {/* Rough vertical rule */}
      <RoughVerticalRule id={entry.id} />

      {/* Right: journal entry content */}
      <div className="flex-1 pb-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          <h2 className="text-base font-bold text-text-primary leading-tight">{title}</h2>
          <span className="sketchy font-mono text-xs text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded capitalize">
            {entry.type}
          </span>
        </div>
        <p className="font-mono text-xs text-accent mb-1 tracking-wide">@ {entry.organization}</p>
        <p className="font-mono text-xs text-text-muted mb-3">{dateRange}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
