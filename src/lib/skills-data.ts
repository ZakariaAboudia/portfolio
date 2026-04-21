import { prisma } from '@/lib/prisma'

export type SkillGroup = {
  category: string
  skills: Array<{ id: string; name: string; level: number }>
}

type RawSkill = { id: string; name: string; category: string; level: number }

export function groupSkills(skills: RawSkill[]): SkillGroup[] {
  const map = new Map<string, SkillGroup>()
  for (const s of skills) {
    if (!map.has(s.category)) {
      map.set(s.category, { category: s.category, skills: [] })
    }
    map.get(s.category)!.skills.push({ id: s.id, name: s.name, level: s.level })
  }
  return Array.from(map.values())
}

export async function getSkillsByCategory(): Promise<SkillGroup[]> {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { level: 'desc' }],
    select: { id: true, name: true, category: true, level: true },
  })
  return groupSkills(skills)
}
