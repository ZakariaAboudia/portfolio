import { prisma } from '@/lib/prisma'
import ProjectList from './_components/ProjectList'
import FilterBar from '@/components/admin/FilterBar'
import type { TranslatableField } from '@/types/prisma'

interface PageProps {
  searchParams: Promise<{ q?: string; region?: string }>
}

function matchesSearch(project: { title: unknown; slug: string; techStack: string[] }, q: string): boolean {
  const lower = q.toLowerCase()
  const title = ((project.title as TranslatableField)?.en ?? '').toLowerCase()
  return (
    title.includes(lower) ||
    project.slug.toLowerCase().includes(lower) ||
    project.techStack.some(t => t.toLowerCase().includes(lower))
  )
}

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const { q, region } = await searchParams

  const allProjects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })

  const regions = [...new Set(allProjects.map(p => p.clientRegion).filter(Boolean) as string[])]

  let filtered = allProjects
  if (q) filtered = filtered.filter(p => matchesSearch(p, q))
  if (region) filtered = filtered.filter(p => p.clientRegion === region)

  const noResults = (!!q || !!region) && filtered.length === 0

  return (
    <main className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-mono text-text-primary">Projects</h1>
      <FilterBar
        placeholder="Search projects..."
        showRegionFilter
        regionOptions={regions}
      />
      {noResults ? (
        <p className="text-sm text-text-muted text-center py-8">
          No projects match your filters.{' '}
          <a href="/admin/projects" className="text-accent underline">Clear filters</a>
        </p>
      ) : (
        <ProjectList projects={filtered} />
      )}
    </main>
  )
}
