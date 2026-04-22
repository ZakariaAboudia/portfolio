import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { t } from '@/lib/i18n'
import type { TranslatableField } from '@/types/prisma'
import RoughUnderline from '@/components/shared/RoughUnderline'
import RoughCard from '@/components/shared/RoughCard'
import ProjectIllustration from '@/components/shared/ProjectIllustration'
import ProjectSchematicLoader from '@/components/shared/ProjectSchematicLoader'

interface Props {
  params: Promise<{ slug: string }>
}

function slugSeed(slug: string): number {
  let h = 5381
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h) ^ slug.charCodeAt(i)
  }
  return h >>> 0
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [locale, project] = await Promise.all([
    getLocale(),
    prisma.project.findUnique({ where: { slug }, select: { title: true, description: true, published: true } }),
  ])
  if (!project || !project.published) return {}
  return {
    title: t(project.title as unknown as TranslatableField, locale),
    description: t(project.description as unknown as TranslatableField, locale),
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const [locale, project] = await Promise.all([
    getLocale(),
    prisma.project.findUnique({ where: { slug } }),
  ])

  if (!project || !project.published) notFound()

  const title = t(project.title as unknown as TranslatableField, locale)
  const description = t(project.description as unknown as TranslatableField, locale)
  const body = project.body ? t(project.body as unknown as TranslatableField, locale) : null
  const dateLabel = new Date(project.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })
  const seed = slugSeed(slug)

  return (
    <div className="flex">
      {/* Left — notebook content */}
      <main
        className="w-full p-6 flex flex-col gap-8 md:w-[60%]"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--border-subtle) 28px)',
          backgroundAttachment: 'local',
        }}
      >
        <Link
          href="/projects"
          className="font-mono text-xs text-text-muted hover:text-accent transition-colors tracking-widest uppercase"
        >
          ← field notes / projects
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            <RoughUnderline>{title}</RoughUnderline>
          </h1>
          {project.clientRegion && (
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              {project.clientRegion}
            </p>
          )}
          <p className="text-sm text-text-secondary leading-relaxed mt-2 border-l-2 border-accent pl-3">
            {description}
          </p>
        </div>

        {body && (
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: body }} />
        )}

        {project.techStack.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
              — tech specimen
            </p>
            <div className="flex flex-wrap gap-2 sketchy">
              {project.techStack.map((tag, i) => (
                <span
                  key={tag}
                  className="relative font-mono text-xs text-text-primary bg-bg-elevated px-3 py-1.5 rounded"
                  style={{ border: '1px solid var(--border-default)' }}
                >
                  <span className="absolute -top-2 -left-1 text-accent font-mono text-xs leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Right — specimen panel (lg+) */}
      <aside className="hidden lg:flex w-[40%] sticky top-0 h-screen flex-col p-6 border-l border-border-subtle overflow-hidden">

        {/* Corner brackets */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 320 560"
          fill="none"
          strokeWidth="1"
          aria-hidden="true"
        >
          <path d="M20,52 L20,20 L52,20" stroke="var(--border-default)" opacity="0.35" />
          <path d="M268,508 L300,508 L300,476" stroke="var(--border-default)" opacity="0.35" />
          <path d="M278,58 L288,68 M288,58 L278,68" stroke="var(--accent)" opacity="0.5" />
          <path d="M28,498 L38,508 M38,498 L28,508" stroke="var(--border-default)" opacity="0.3" />
          <line x1="248" y1="28" x2="268" y2="48" stroke="var(--accent)" opacity="0.4" />
          <line x1="252" y1="25" x2="272" y2="45" stroke="var(--accent)" opacity="0.25" />
        </svg>

        {/* Illustration */}
        <div className="flex-1 flex flex-col relative z-10 min-h-0">
          {project.imageUrl ? (
            <RoughCard roughness={1.8} className="w-full">
              <div
                className="p-2 pb-9 bg-bg-elevated relative"
                style={{ transform: 'rotate(-1.5deg)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUrl}
                  alt={title}
                  className="w-full object-cover"
                  style={{ filter: 'sepia(15%) contrast(1.05)', maxHeight: '260px' }}
                />
                <p className="absolute bottom-2 left-0 right-0 text-center font-mono text-[10px] text-text-muted tracking-widest uppercase">
                  {slug} — specimen
                </p>
              </div>
            </RoughCard>
          ) : (
            <ProjectSchematicLoader
              projectId={project.id}
              seed={seed}
              className="w-full opacity-90"
            />
          )}
        </div>

        {/* Metadata annotations */}
        <div className="relative z-10 flex flex-col gap-3 font-mono text-xs text-text-muted border-t border-border-subtle pt-4">
          {/* <div>
            <p className="uppercase tracking-widest opacity-50">— field entry</p>
            <p className="mt-1 text-accent">{dateLabel}</p>
          </div> */}
          {project.clientRegion && (
            <div>
              <p className="uppercase tracking-widest opacity-50">— origin</p>
              <p className="mt-1">{project.clientRegion}</p>
            </div>
          )}
          {project.techStack.length > 0 && (
            <div>
              <p className="uppercase tracking-widest opacity-50">— specimens</p>
              <p className="mt-1">{project.techStack.length} catalogued</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
