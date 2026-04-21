'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { SkillGroup } from '@/lib/skills-data'

const MAX_BAR_HEIGHT = 120
const BAR_WIDTH = 32

function skillSeed(name: string): number {
  return name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

interface SketchyChartProps {
  groups: SkillGroup[]
  ariaLabel: string
}

interface BarRef {
  svgEl: SVGSVGElement
  level: number
  name: string
}

export default function SketchyChart({ groups, ariaLabel }: SketchyChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [roughFailed, setRoughFailed] = useState(false)
  const barRefs = useRef<Map<string, BarRef>>(new Map())

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  const drawBars = useCallback(async () => {
    try {
      const roughModule = await import('roughjs')
      const rough = (roughModule.default ?? roughModule) as unknown as typeof import('roughjs').default

      barRefs.current.forEach(({ svgEl, level, name }) => {
        const barHeight = Math.round((level / 5) * MAX_BAR_HEIGHT)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rc = rough.svg(svgEl) as any
        svgEl.innerHTML = ''
        const node = rc.rectangle(0, MAX_BAR_HEIGHT - barHeight, BAR_WIDTH, barHeight, {
          fill: 'var(--accent)',
          fillStyle: 'solid',
          fillWeight: 2,
          stroke: 'var(--accent)',
          roughness: 1.0,
          bowing: 0.4,
          seed: skillSeed(name),
        })
        svgEl.appendChild(node as unknown as Node)
      })
    } catch {
      setRoughFailed(true)
    }
  }, [])

  useEffect(() => {
    drawBars()
  }, [drawBars, groups])

  const allSkills = groups.flatMap(g => g.skills.map(s => ({ ...s, category: g.category })))

  return (
    <Tooltip.Provider delayDuration={200}>
      <div role="img" aria-label={ariaLabel} className="overflow-x-auto">
        <div className="flex flex-wrap gap-8 min-w-0 pb-4">
          {groups.map(group => (
            <div key={group.category} className="flex flex-col items-start gap-2">
              <div className="flex items-end gap-2">
                {group.skills.map(skill => {
                  const barHeight = Math.round((skill.level / 5) * MAX_BAR_HEIGHT)
                  const isHovered = hoveredId !== null
                  const isActive = hoveredId === skill.id

                  return (
                    <Tooltip.Root key={skill.id}>
                      <Tooltip.Trigger asChild>
                        <button
                          aria-label={`${skill.name} — Level ${skill.level} / 5`}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                          onMouseEnter={() => setHoveredId(skill.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(skill.id)}
                          onBlur={() => setHoveredId(null)}
                          style={{
                            opacity: isHovered ? (isActive ? 1 : 0.4) : 1,
                            transition: 'opacity 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              transform: mounted && !reducedMotion ? 'scaleY(1)' : reducedMotion ? 'scaleY(1)' : 'scaleY(0)',
                              transformOrigin: 'bottom',
                              transition: reducedMotion ? 'none' : 'transform 0.4s ease-out',
                              height: `${MAX_BAR_HEIGHT}px`,
                              width: `${BAR_WIDTH}px`,
                            }}
                          >
                            {roughFailed ? (
                              <div
                                className="bg-accent w-full"
                                style={{
                                  height: `${barHeight}px`,
                                  marginTop: `${MAX_BAR_HEIGHT - barHeight}px`,
                                  opacity: 0.85,
                                }}
                              />
                            ) : (
                              <svg
                                ref={el => {
                                  if (el) {
                                    barRefs.current.set(skill.id, { svgEl: el, level: skill.level, name: skill.name })
                                  } else {
                                    barRefs.current.delete(skill.id)
                                  }
                                }}
                                width={BAR_WIDTH}
                                height={MAX_BAR_HEIGHT}
                                aria-hidden="true"
                                style={{ opacity: 0.85 }}
                              />
                            )}
                          </div>
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-bg-elevated border border-border-default text-text-primary text-xs px-2 py-1 rounded z-50"
                          sideOffset={4}
                        >
                          {skill.name} — Level {skill.level} / 5
                          <Tooltip.Arrow className="fill-border-default" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  )
                })}
              </div>
              <p className="text-xs font-mono text-text-muted capitalize">{group.category}</p>
            </div>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>Skills data table</caption>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Category</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {allSkills.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.category}</td>
              <td>{s.level} / 5</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Tooltip.Provider>
  )
}
