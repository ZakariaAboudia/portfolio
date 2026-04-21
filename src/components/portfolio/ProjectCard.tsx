import Link from 'next/link'
import RoughCard from '@/components/shared/RoughCard'
import { t } from '@/lib/i18n'
import type { TranslatableField } from '@/types/prisma'

interface ProjectCardProject {
  id: string
  slug: string
  title: unknown
  description: unknown
  techStack: string[]
  clientRegion: string | null
  imageUrl?: string | null
}

interface ProjectCardProps {
  project: ProjectCardProject
  locale: string
}

const MAX_TAGS = 4

export default function ProjectCard({ project, locale }: ProjectCardProps) {
  const title = t(project.title as unknown as TranslatableField, locale)
  const description = t(project.description as unknown as TranslatableField, locale)
  const visibleTags = project.techStack.slice(0, MAX_TAGS)
  const extraCount = project.techStack.length - MAX_TAGS

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <RoughCard padding="p-5" className="h-full transition-colors hover:bg-bg-elevated">
        <div className="flex flex-col gap-4 h-full">

          {/* Header: region annotation + title */}
          <div className="flex flex-col gap-1">
            {project.clientRegion && (
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                {project.clientRegion} —
              </p>
            )}
            <h2 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors leading-snug">
              {title}
            </h2>
          </div>

          {/* Description — indented like a journal entry */}
          <p className="text-sm text-text-secondary leading-relaxed flex-1 pl-3 border-l border-border-subtle">
            {description}
          </p>

          {/* Tech specimen tags */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sketchy">
              {visibleTags.map((tag, i) => (
                <span
                  key={tag}
                  className="relative font-mono text-xs text-text-muted bg-bg-subtle px-2 py-0.5 rounded"
                >
                  <span className="absolute -top-1.5 -left-0.5 font-mono text-accent leading-none"
                    style={{ fontSize: '0.55rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {tag}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="font-mono text-xs text-text-muted bg-bg-subtle px-2 py-0.5 rounded">
                  +{extraCount}
                </span>
              )}
            </div>
          )}
        </div>
      </RoughCard>
    </Link>
  )
}
