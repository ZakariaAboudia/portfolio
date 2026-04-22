'use client'

import { useRef, useEffect } from 'react'
import SkillChip from './SkillChip'
import type { SkillGroup } from '@/lib/skills-data'

interface CategorySectionProps {
  group: SkillGroup
  index: number
}

function RoughCategoryLabel({ label, index }: { label: string; index: number }) {
  const textRef = useRef<HTMLSpanElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = textRef.current
    const svg = svgRef.current
    if (!el || !svg) return

    const draw = async () => {
      const { width } = el.getBoundingClientRect()
      if (!width) return
      svg.setAttribute('width', String(Math.round(width + 16)))
      svg.setAttribute('height', '6')

      try {
        const m = await import('roughjs')
        const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
        const rc = rough.svg(svg) as any
        svg.innerHTML = ''
        // Underline stroke under category name
        const node = rc.line(0, 3, width + 16, 3, {
          roughness: 1.6,
          bowing: 1.2,
          stroke: 'var(--accent)',
          strokeWidth: 1.5,
          seed: index * 37 + label.charCodeAt(0),
        })
        svg.appendChild(node as unknown as Node)
      } catch {
        svg.innerHTML = `<line x1="0" y1="3" x2="${Math.round(el.getBoundingClientRect().width + 16)}" y2="3" stroke="var(--accent)" stroke-width="1.5"/>`
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [label, index])

  return (
    <div className="flex flex-col items-start gap-0">
      <span
        ref={textRef}
        className="text-xs font-mono uppercase tracking-widest text-text-muted"
      >
        {label}
      </span>
      <svg ref={svgRef} aria-hidden="true" height="6" style={{ overflow: 'visible' }} />
    </div>
  )
}

function CategorySection({ group, index }: CategorySectionProps) {
  // Sort by level desc so large chips naturally lead
  const sorted = [...group.skills].sort((a, b) => b.level - a.level)

  return (
    <div className="flex flex-col gap-4">
      <RoughCategoryLabel label={group.category} index={index} />
      <div className="flex flex-wrap gap-x-4 gap-y-5 items-end">
        {sorted.map(skill => (
          <SkillChip key={skill.id} name={skill.name} level={skill.level} />
        ))}
      </div>
    </div>
  )
}

interface SkillsSketchboardProps {
  groups: SkillGroup[]
  ariaLabel: string
}

export default function SkillsSketchboard({ groups, ariaLabel }: SkillsSketchboardProps) {
  const allSkills = groups.flatMap(g => g.skills.map(s => ({ ...s, category: g.category })))

  return (
    <>
      <div
        role="region"
        aria-label={ariaLabel}
        className="flex flex-col gap-10"
      >
        {groups.map((group, i) => (
          <CategorySection key={group.category} group={group} index={i} />
        ))}
      </div>

      {/* Screen reader table */}
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead><tr><th>Skill</th><th>Category</th><th>Level</th></tr></thead>
        <tbody>
          {allSkills.map(s => (
            <tr key={s.id}><td>{s.name}</td><td>{s.category}</td><td>{s.level} / 5</td></tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
