import { prisma } from './prisma'

export async function getOverviewStats() {
  const [projectCount, allProjects, earliestEntry] = await Promise.all([
    prisma.project.count({ where: { published: true } }),
    prisma.project.findMany({
      where: { published: true },
      select: { clientRegion: true, techStack: true },
    }),
    prisma.timelineEntry.findFirst({
      orderBy: { startDate: 'asc' },
      select: { startDate: true },
    }),
  ])

  const countries = new Set(allProjects.map(p => p.clientRegion).filter(Boolean)).size
  const technologies = new Set(allProjects.flatMap(p => p.techStack)).size
  const yearsActive = earliestEntry
    ? new Date().getFullYear() - new Date(earliestEntry.startDate).getFullYear()
    : 0

  return { projects: projectCount, countries, technologies, yearsActive }
}

export async function getRecentProjects(limit = 5) {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, slug: true, title: true, clientRegion: true },
  })
}
