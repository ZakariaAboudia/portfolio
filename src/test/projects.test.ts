import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

const projectCardSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/ProjectCard.tsx'),
  'utf-8'
)
const projectsPageSource = fs.readFileSync(
  path.join(root, 'src/app/projects/page.tsx'),
  'utf-8'
)
const projectDetailSource = fs.readFileSync(
  path.join(root, 'src/app/projects/[slug]/page.tsx'),
  'utf-8'
)
const apiListSource = fs.readFileSync(
  path.join(root, 'src/app/api/projects/route.ts'),
  'utf-8'
)
const apiDetailSource = fs.readFileSync(
  path.join(root, 'src/app/api/projects/[id]/route.ts'),
  'utf-8'
)
const enMessages = JSON.parse(
  fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8')
)

// ── ProjectCard ────────────────────────────────────────────────────────────

describe('ProjectCard — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/ProjectCard.tsx'))).toBe(true)
  })

  it('uses RoughCard', () => {
    expect(projectCardSource).toContain('RoughCard')
  })

  it('uses t() for translatable fields', () => {
    expect(projectCardSource).toContain('t(')
    expect(projectCardSource).toContain('TranslatableField')
  })

  it('has line-clamp-3 on description', () => {
    expect(projectCardSource).toContain('line-clamp-3')
  })

  it('renders techStack tags', () => {
    expect(projectCardSource).toContain('techStack')
  })

  it('renders clientRegion', () => {
    expect(projectCardSource).toContain('clientRegion')
  })

  it('has group-hover:text-accent on title', () => {
    expect(projectCardSource).toContain('group-hover:text-accent')
  })

  it('links to /projects/[slug]', () => {
    expect(projectCardSource).toContain('/projects/')
  })

  it('limits visible tags to 5 with overflow badge', () => {
    expect(projectCardSource).toContain('MAX_TAGS')
    expect(projectCardSource).toContain('more')
  })
})

// ── Projects list page ─────────────────────────────────────────────────────

describe('projects/page.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/projects/page.tsx'))).toBe(true)
  })

  it('uses getLocale', () => {
    expect(projectsPageSource).toContain('getLocale')
  })

  it('filters published: true', () => {
    expect(projectsPageSource).toContain('published: true')
  })

  it('uses EmptyState', () => {
    expect(projectsPageSource).toContain('EmptyState')
  })

  it('uses 2-col grid', () => {
    expect(projectsPageSource).toContain('md:grid-cols-2')
  })

  it('renders ProjectCard', () => {
    expect(projectsPageSource).toContain('ProjectCard')
  })
})

// ── Project detail page ────────────────────────────────────────────────────

describe('projects/[slug]/page.tsx — source checks', () => {
  it('exists', () => {
    expect(
      fs.existsSync(path.join(root, 'src/app/projects/[slug]/page.tsx'))
    ).toBe(true)
  })

  it('calls notFound()', () => {
    expect(projectDetailSource).toContain('notFound()')
  })

  it('checks published before rendering', () => {
    expect(projectDetailSource).toContain('published')
  })

  it('has generateMetadata', () => {
    expect(projectDetailSource).toContain('generateMetadata')
  })

  it('has back link to /projects', () => {
    expect(projectDetailSource).toContain('href="/projects"')
  })

  it('handles nullable body field', () => {
    expect(projectDetailSource).toContain('project.body')
  })
})

// ── API list route ─────────────────────────────────────────────────────────

describe('api/projects/route.ts — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/projects/route.ts'))).toBe(true)
  })

  it('uses ratelimitStandard', () => {
    expect(apiListSource).toContain('ratelimitStandard')
  })

  it('calls rateLimitedResponse on failure', () => {
    expect(apiListSource).toContain('rateLimitedResponse')
  })

  it('filters published: true', () => {
    expect(apiListSource).toContain('published: true')
  })

  it('returns direct Response.json (no wrapper)', () => {
    expect(apiListSource).toContain('Response.json(projects)')
  })
})

// ── API detail route ───────────────────────────────────────────────────────

describe('api/projects/[id]/route.ts — source checks', () => {
  it('exists', () => {
    expect(
      fs.existsSync(path.join(root, 'src/app/api/projects/[id]/route.ts'))
    ).toBe(true)
  })

  it('uses ratelimitStandard', () => {
    expect(apiDetailSource).toContain('ratelimitStandard')
  })

  it('returns PROJECT_NOT_FOUND on miss', () => {
    expect(apiDetailSource).toContain('PROJECT_NOT_FOUND')
  })

  it('returns 404 status for missing project', () => {
    expect(apiDetailSource).toContain('status: 404')
  })

  it('checks published before returning', () => {
    expect(apiDetailSource).toContain('published')
  })
})

// ── en.json projects namespace ─────────────────────────────────────────────

describe('en.json — projects namespace', () => {
  it('has projects namespace', () => {
    expect(enMessages).toHaveProperty('projects')
  })

  it('has projects.title', () => {
    expect(enMessages.projects).toHaveProperty('title', 'Projects')
  })

  it('has projects.empty', () => {
    expect(enMessages.projects).toHaveProperty('empty')
    expect(enMessages.projects.empty).toBe('No projects yet — check back soon.')
  })
})
