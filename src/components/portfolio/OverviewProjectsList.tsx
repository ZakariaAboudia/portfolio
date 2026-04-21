import Link from 'next/link'
import RoughCard from '@/components/shared/RoughCard'
import EmptyState from '@/components/shared/EmptyState'
import { t } from '@/lib/i18n'
import type { TranslatableField } from '@/types/prisma'

interface Project {
  id: string
  slug: string
  title: unknown
  clientRegion: string | null
}

interface OverviewProjectsListProps {
  projects: Project[]
  locale: string
  heading: string
  emptyMessage: string
}

export default function OverviewProjectsList({ projects, locale, heading, emptyMessage }: OverviewProjectsListProps) {
  return (
    <RoughCard padding="p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
        — {heading}
      </p>
      {projects.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="flex flex-col gap-0">
          {projects.map((project, i) => {
            const title = t(project.title as unknown as TranslatableField, locale)
            return (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex items-baseline gap-3 py-2.5 hover:bg-bg-elevated transition-colors px-1 -mx-1 rounded"
                >
                  <span className="font-mono text-xs text-accent shrink-0 w-5 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-text-primary group-hover:text-accent transition-colors flex-1 truncate">
                    {title}
                  </span>
                  {project.clientRegion && (
                    <span className="font-mono text-xs text-text-muted shrink-0">
                      {project.clientRegion}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </RoughCard>
  )
}
