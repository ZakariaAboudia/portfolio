import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

const statCardSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/StatCard.tsx'),
  'utf-8'
)
const projectsListSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/OverviewProjectsList.tsx'),
  'utf-8'
)
const mapPlaceholderSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/MapPlaceholder.tsx'),
  'utf-8'
)
const pageSource = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf-8')
const overviewStatsSource = fs.readFileSync(
  path.join(root, 'src/lib/overview-stats.ts'),
  'utf-8'
)
const enMessages = JSON.parse(
  fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8')
)

// ── StatCard ───────────────────────────────────────────────────────────────

describe('StatCard — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/StatCard.tsx'))).toBe(true)
  })

  it('has role="figure"', () => {
    expect(statCardSource).toContain('role="figure"')
  })

  it('uses RoughCard', () => {
    expect(statCardSource).toContain('RoughCard')
  })

  it('has font-mono label', () => {
    expect(statCardSource).toContain('font-mono')
  })

  it('has text-2xl value', () => {
    expect(statCardSource).toContain('text-2xl')
  })

  it('has amber accent strip (bg-accent)', () => {
    expect(statCardSource).toContain('bg-accent')
  })

  it('has aria-label prop', () => {
    expect(statCardSource).toContain('ariaLabel')
  })
})

// ── OverviewProjectsList ───────────────────────────────────────────────────

describe('OverviewProjectsList — source checks', () => {
  it('exists', () => {
    expect(
      fs.existsSync(path.join(root, 'src/components/portfolio/OverviewProjectsList.tsx'))
    ).toBe(true)
  })

  it('uses EmptyState', () => {
    expect(projectsListSource).toContain('EmptyState')
  })

  it('uses t() helper for translatable title', () => {
    expect(projectsListSource).toContain("t(")
    expect(projectsListSource).toContain('TranslatableField')
  })

  it('links to /projects/[slug]', () => {
    expect(projectsListSource).toContain('/projects/')
  })
})

// ── MapPlaceholder ─────────────────────────────────────────────────────────

describe('MapPlaceholder — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/MapPlaceholder.tsx'))).toBe(
      true
    )
  })

  it('uses RoughCard', () => {
    expect(mapPlaceholderSource).toContain('RoughCard')
  })

  it('has min-h class', () => {
    expect(mapPlaceholderSource).toContain('min-h-')
  })
})

// ── overview-stats.ts ──────────────────────────────────────────────────────

describe('overview-stats — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/overview-stats.ts'))).toBe(true)
  })

  it('exports getOverviewStats', () => {
    expect(overviewStatsSource).toContain('getOverviewStats')
  })

  it('exports getRecentProjects', () => {
    expect(overviewStatsSource).toContain('getRecentProjects')
  })

  it('counts distinct countries via Set', () => {
    expect(overviewStatsSource).toContain('new Set')
    expect(overviewStatsSource).toContain('clientRegion')
  })

  it('counts distinct technologies via flatMap + Set', () => {
    expect(overviewStatsSource).toContain('flatMap')
    expect(overviewStatsSource).toContain('techStack')
  })

  it('computes yearsActive from earliest timeline entry', () => {
    expect(overviewStatsSource).toContain('startDate')
    expect(overviewStatsSource).toContain('getFullYear')
    expect(overviewStatsSource).toContain('yearsActive')
  })
})

// ── page.tsx ───────────────────────────────────────────────────────────────

describe('page.tsx — source checks', () => {
  it('uses getOverviewStats', () => {
    expect(pageSource).toContain('getOverviewStats')
  })

  it('uses getRecentProjects', () => {
    expect(pageSource).toContain('getRecentProjects')
  })

  it('has 4-col stat grid with mobile 2×2 collapse', () => {
    expect(pageSource).toContain('grid-cols-2 md:grid-cols-4')
  })

  it('has 2-col row for projects + map', () => {
    expect(pageSource).toContain('md:grid-cols-2')
  })

  it('renders StatCard', () => {
    expect(pageSource).toContain('StatCard')
  })

  it('renders OverviewProjectsList', () => {
    expect(pageSource).toContain('OverviewProjectsList')
  })

  it('renders MapWithPinsDynamic', () => {
    expect(pageSource).toContain('MapWithPinsDynamic')
  })
})

// ── en.json overview namespace ─────────────────────────────────────────────

describe('en.json — overview namespace', () => {
  it('has overview namespace', () => {
    expect(enMessages).toHaveProperty('overview')
  })

  it('has statProjects', () => {
    expect(enMessages.overview).toHaveProperty('statProjects')
  })

  it('has statCountries', () => {
    expect(enMessages.overview).toHaveProperty('statCountries')
  })

  it('has statTechnologies', () => {
    expect(enMessages.overview).toHaveProperty('statTechnologies')
  })

  it('has statYearsActive', () => {
    expect(enMessages.overview).toHaveProperty('statYearsActive')
  })

  it('has emptyProjects', () => {
    expect(enMessages.overview).toHaveProperty('emptyProjects')
    expect(enMessages.overview.emptyProjects).toBe('No projects yet — check back soon.')
  })

  it('has recentProjects', () => {
    expect(enMessages.overview).toHaveProperty('recentProjects')
  })

  it('has mapComingSoon', () => {
    expect(enMessages.overview).toHaveProperty('mapComingSoon')
  })
})
