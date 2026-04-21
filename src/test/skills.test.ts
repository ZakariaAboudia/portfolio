import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { groupSkills } from '@/lib/skills-data'

const root = path.resolve(__dirname, '../..')

const skillsDataSource = fs.readFileSync(
  path.join(root, 'src/lib/skills-data.ts'),
  'utf-8'
)
const sketchyChartSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/SketchyChart.tsx'),
  'utf-8'
)
const sketchyChartDynamicSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/SketchyChartDynamic.tsx'),
  'utf-8'
)
const skillsPageSource = fs.readFileSync(
  path.join(root, 'src/app/skills/page.tsx'),
  'utf-8'
)
const enMessages = JSON.parse(
  fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8')
)

// ── skills-data.ts ─────────────────────────────────────────────────────────

describe('skills-data.ts — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/skills-data.ts'))).toBe(true)
  })

  it('exports getSkillsByCategory', () => {
    expect(skillsDataSource).toContain('getSkillsByCategory')
  })

  it('contains category field', () => {
    expect(skillsDataSource).toContain('category')
  })

  it('queries prisma.skill.findMany', () => {
    expect(skillsDataSource).toContain('prisma.skill.findMany')
  })
})

// ── SketchyChart.tsx ───────────────────────────────────────────────────────

describe('SketchyChart.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/SketchyChart.tsx'))).toBe(true)
  })

  it('dynamically imports roughjs', () => {
    expect(sketchyChartSource).toContain("import('roughjs')")
  })

  it('has role="img"', () => {
    expect(sketchyChartSource).toContain('role="img"')
  })

  it('has sr-only table', () => {
    expect(sketchyChartSource).toContain('sr-only')
  })

  it('uses Tooltip', () => {
    expect(sketchyChartSource).toContain('Tooltip')
  })

  it('uses prefers-reduced-motion', () => {
    expect(sketchyChartSource).toContain('prefers-reduced-motion')
  })

  it('uses scaleY animation', () => {
    expect(sketchyChartSource).toContain('scaleY')
  })

  it('uses var(--accent)', () => {
    expect(sketchyChartSource).toContain('var(--accent)')
  })
})

// ── SketchyChartDynamic.tsx ────────────────────────────────────────────────

describe('SketchyChartDynamic.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/SketchyChartDynamic.tsx'))).toBe(true)
  })

  it('has use client directive', () => {
    expect(sketchyChartDynamicSource).toContain("'use client'")
  })

  it('has ssr: false', () => {
    expect(sketchyChartDynamicSource).toContain('ssr: false')
  })
})

// ── skills/page.tsx ────────────────────────────────────────────────────────

describe('skills/page.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/skills/page.tsx'))).toBe(true)
  })

  it('calls getSkillsByCategory', () => {
    expect(skillsPageSource).toContain('getSkillsByCategory')
  })

  it('uses EmptyState', () => {
    expect(skillsPageSource).toContain('EmptyState')
  })
})

// ── en.json skills namespace ───────────────────────────────────────────────

describe('en.json — skills namespace', () => {
  it('has skills namespace', () => {
    expect(enMessages).toHaveProperty('skills')
  })

  it('has skills.ariaLabel', () => {
    expect(enMessages.skills).toHaveProperty('ariaLabel')
  })

  it('has skills.empty', () => {
    expect(enMessages.skills).toHaveProperty('empty')
  })
})

// ── groupSkills — unit tests ───────────────────────────────────────────────

describe('groupSkills', () => {
  it('returns empty array for empty input', () => {
    expect(groupSkills([])).toEqual([])
  })

  it('groups skills by category', () => {
    const input = [
      { id: '1', name: 'TypeScript', category: 'Languages', level: 5 },
      { id: '2', name: 'Python', category: 'Languages', level: 3 },
      { id: '3', name: 'React', category: 'Frontend', level: 4 },
    ]
    const result = groupSkills(input)
    expect(result).toHaveLength(2)
    const langs = result.find(g => g.category === 'Languages')
    expect(langs).toBeDefined()
    expect(langs!.skills).toHaveLength(2)
    const frontend = result.find(g => g.category === 'Frontend')
    expect(frontend).toBeDefined()
    expect(frontend!.skills).toHaveLength(1)
  })

  it('preserves skill fields', () => {
    const input = [{ id: 'abc', name: 'Go', category: 'Languages', level: 4 }]
    const result = groupSkills(input)
    expect(result[0].skills[0]).toEqual({ id: 'abc', name: 'Go', level: 4 })
  })

  it('maintains insertion order within category', () => {
    const input = [
      { id: '1', name: 'A', category: 'Cat', level: 5 },
      { id: '2', name: 'B', category: 'Cat', level: 3 },
      { id: '3', name: 'C', category: 'Cat', level: 4 },
    ]
    const result = groupSkills(input)
    expect(result[0].skills.map(s => s.name)).toEqual(['A', 'B', 'C'])
  })

  it('handles single skill per category', () => {
    const input = [
      { id: '1', name: 'Docker', category: 'DevOps', level: 3 },
      { id: '2', name: 'React', category: 'Frontend', level: 5 },
    ]
    const result = groupSkills(input)
    expect(result).toHaveLength(2)
    result.forEach(g => expect(g.skills).toHaveLength(1))
  })
})
