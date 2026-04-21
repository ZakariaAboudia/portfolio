import { prisma } from '@/lib/prisma'
import SkillList from './_components/SkillList'
import FilterBar from '@/components/admin/FilterBar'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminSkillsPage({ searchParams }: PageProps) {
  const { q } = await searchParams

  const allSkills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { level: 'desc' }],
  })

  const filtered = q
    ? allSkills.filter(s =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.category.toLowerCase().includes(q.toLowerCase())
      )
    : allSkills

  const noResults = !!q && filtered.length === 0

  return (
    <main className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-mono text-text-primary">Skills</h1>
      <FilterBar placeholder="Search skills..." />
      {noResults ? (
        <p className="text-sm text-text-muted text-center py-8">
          No skills match your filters.{' '}
          <a href="/admin/skills" className="text-accent underline">Clear filters</a>
        </p>
      ) : (
        <SkillList skills={filtered} />
      )}
    </main>
  )
}
