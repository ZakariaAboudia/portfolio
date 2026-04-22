'use client'

import { useState } from 'react'
import RoughCard from '@/components/shared/RoughCard'
import RoughDots from './RoughDots'
import type { SkillGroup } from '@/lib/skills-data'

interface SkillsGridProps {
  groups: SkillGroup[]
  ariaLabel: string
}

export default function SkillsGrid({ groups, ariaLabel }: SkillsGridProps) {
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null)

  const allSkills = groups.flatMap(g => g.skills.map(s => ({ ...s, category: g.category })))

  return (
    <>
      <div
        role="region"
        aria-label={ariaLabel}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {groups.map((group, gi) => (
          <RoughCard
            key={group.category}
            padding="p-5"
            seed={gi + 1}
            roughness={0.9}
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">
              {group.category}
            </h2>
            <ul className="flex flex-col gap-3">
              {group.skills.map(skill => {
                const isHovered = hoveredSkillId !== null
                const isActive = hoveredSkillId === skill.id
                return (
                  <li
                    key={skill.id}
                    className="flex items-center justify-between gap-3 transition-opacity duration-150"
                    style={{ opacity: isHovered ? (isActive ? 1 : 0.4) : 1 }}
                    onMouseEnter={() => setHoveredSkillId(skill.id)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                  >
                    <span className="text-sm text-text-primary font-medium leading-none">
                      {skill.name}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <RoughDots level={skill.level} />
                      <span className="sr-only">{skill.level} / 5</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </RoughCard>
        ))}
      </div>

      {/* Screen reader table */}
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr><th>Skill</th><th>Category</th><th>Level</th></tr>
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
    </>
  )
}
