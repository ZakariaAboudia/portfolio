import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

function src(p: string) { return fs.readFileSync(path.join(root, p), 'utf-8') }
function exists(p: string) { return fs.existsSync(path.join(root, p)) }

describe('Sentry configuration', () => {
  it('sentry.client.config.ts exists', () => expect(exists('sentry.client.config.ts')).toBe(true))
  it('sentry.server.config.ts exists', () => expect(exists('sentry.server.config.ts')).toBe(true))
  it('sentry.edge.config.ts exists', () => expect(exists('sentry.edge.config.ts')).toBe(true))

  it('client config initializes Sentry with DSN env var', () => {
    const s = src('sentry.client.config.ts')
    expect(s).toContain('Sentry.init')
    expect(s).toContain('NEXT_PUBLIC_SENTRY_DSN')
  })

  it('server config initializes Sentry', () => {
    const s = src('sentry.server.config.ts')
    expect(s).toContain('Sentry.init')
  })
})

describe('Error boundary (src/app/error.tsx)', () => {
  it('exists', () => expect(exists('src/app/error.tsx')).toBe(true))
  it('captures exception with Sentry', () => expect(src('src/app/error.tsx')).toContain('Sentry.captureException'))
  it('uses use client directive', () => expect(src('src/app/error.tsx')).toContain("'use client'"))
  it('renders try-again button', () => expect(src('src/app/error.tsx')).toContain('reset'))
  it('uses portfolio design tokens (not default Next.js error)', () => expect(src('src/app/error.tsx')).toContain('text-text-primary'))
})

describe('Vercel Analytics & Speed Insights (layout.tsx)', () => {
  const layoutSrc = src('src/app/layout.tsx')

  it('imports Analytics', () => expect(layoutSrc).toContain('@vercel/analytics'))
  it('imports SpeedInsights', () => expect(layoutSrc).toContain('@vercel/speed-insights'))
  it('renders Analytics component', () => expect(layoutSrc).toContain('<Analytics'))
  it('renders SpeedInsights component', () => expect(layoutSrc).toContain('<SpeedInsights'))
})

describe('GitHub repo link (AdminNavSidebar)', () => {
  const sidebarSrc = src('src/components/shared/AdminNavSidebar.tsx')

  it('references NEXT_PUBLIC_GITHUB_URL', () => expect(sidebarSrc).toContain('NEXT_PUBLIC_GITHUB_URL'))
  it('has GitHub link in sidebar', () => expect(sidebarSrc).toContain('github'))
})

describe('robots.txt — admin excluded', () => {
  it('robots.txt exists in public folder', () => expect(exists('public/robots.txt')).toBe(true))
  it('disallows /admin/', () => {
    const s = src('public/robots.txt')
    expect(s).toContain('/admin')
    expect(s.toLowerCase()).toContain('disallow')
  })
})
