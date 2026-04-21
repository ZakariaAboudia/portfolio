import { getLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import ProjectCard from '@/components/portfolio/ProjectCard'
import EmptyState from '@/components/shared/EmptyState'
import PageHeading from '@/components/shared/PageHeading'

export default async function ProjectsPage() {
  const [locale, t, projects] = await Promise.all([
    getLocale(),
    getTranslations('projects'),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <main className="p-6 flex flex-col gap-6">
      <PageHeading>{t('title')}</PageHeading>
      {projects.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} locale={locale} />
          ))}
        </div>
      )}
    </main>
  )
}
