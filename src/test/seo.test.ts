import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

const layoutSource = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf-8')
const sidebarSource = fs.readFileSync(
  path.join(root, 'src/components/shared/AdminNavSidebar.tsx'),
  'utf-8'
)

// ── Static assets ─────────────────────────────────────────────────────────

describe('OG image', () => {
  it('public/og-image.png exists', () => {
    expect(fs.existsSync(path.join(root, 'public/og-image.png'))).toBe(true)
  })

  it('public/og-image.png is a valid PNG (correct magic bytes)', () => {
    const buf = fs.readFileSync(path.join(root, 'public/og-image.png'))
    // PNG magic: 89 50 4E 47 0D 0A 1A 0A
    expect(buf[0]).toBe(0x89)
    expect(buf[1]).toBe(0x50) // P
    expect(buf[2]).toBe(0x4e) // N
    expect(buf[3]).toBe(0x47) // G
  })
})

// ── robots.txt ────────────────────────────────────────────────────────────

describe('robots.txt', () => {
  it('disallows /admin/', () => {
    const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf-8')
    expect(robots).toContain('Disallow: /admin/')
  })
})

// ── Sitemap ───────────────────────────────────────────────────────────────

describe('sitemap.ts', () => {
  it('src/app/sitemap.ts exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/sitemap.ts'))).toBe(true)
  })

  it('exports a default function', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    expect(typeof sitemap).toBe('function')
  })

  it('returns all public pages', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = sitemap()
    const urls = entries.map((e: { url: string }) => {
      const u = new URL(e.url)
      return u.pathname
    })
    expect(urls).toContain('/')
    expect(urls).toContain('/projects')
    expect(urls).toContain('/experience')
    expect(urls).toContain('/skills')
    expect(urls).toContain('/map')
    expect(urls).toContain('/contact')
  })

  it('does not include any /admin paths', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = sitemap()
    const hasAdmin = entries.some((e: { url: string }) => e.url.includes('/admin'))
    expect(hasAdmin).toBe(false)
  })

  it('home page has priority 1.0', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = sitemap()
    const home = entries.find((e: { url: string }) => {
      const u = new URL(e.url)
      return u.pathname === '/'
    })
    expect(home?.priority).toBe(1.0)
  })
})

// ── Admin layout — noindex ────────────────────────────────────────────────

describe('admin/layout.tsx — noindex', () => {
  it('src/app/admin/layout.tsx exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/admin/layout.tsx'))).toBe(true)
  })

  it('contains robots noindex', () => {
    const source = fs.readFileSync(path.join(root, 'src/app/admin/layout.tsx'), 'utf-8')
    expect(source).toContain('robots')
    expect(source).toContain('index: false')
  })
})

// ── Root layout — OG metadata ─────────────────────────────────────────────

describe('layout.tsx — SEO metadata', () => {
  it('has metadataBase', () => {
    expect(layoutSource).toContain('metadataBase')
    expect(layoutSource).toContain('NEXT_PUBLIC_BASE_URL')
  })

  it('has openGraph with og-image.png reference', () => {
    expect(layoutSource).toContain('openGraph')
    expect(layoutSource).toContain('og-image.png')
  })

  it('has twitter card metadata', () => {
    expect(layoutSource).toContain('twitter')
    expect(layoutSource).toContain('summary_large_image')
  })

  it('has alternates canonical', () => {
    expect(layoutSource).toContain('alternates')
    expect(layoutSource).toContain('canonical')
  })
})

// ── AdminNavSidebar — GitHub link ─────────────────────────────────────────

describe('AdminNavSidebar — GitHub link', () => {
  it('references NEXT_PUBLIC_GITHUB_URL', () => {
    expect(sidebarSource).toContain('NEXT_PUBLIC_GITHUB_URL')
  })

  it('has githubAriaLabel translation key', () => {
    expect(sidebarSource).toContain("t('githubAriaLabel')")
  })

  it('has githubRepo translation key', () => {
    expect(sidebarSource).toContain("t('githubRepo')")
  })

  it('opens in new tab with noopener', () => {
    expect(sidebarSource).toContain('target="_blank"')
    expect(sidebarSource).toContain('rel="noopener noreferrer"')
  })

  it('has min-h-[44px] touch target on GitHub link', () => {
    const githubSection = sidebarSource.slice(sidebarSource.indexOf('NEXT_PUBLIC_GITHUB_URL'))
    expect(githubSection).toContain('min-h-[44px]')
  })
})

// ── en.json — GitHub translation keys ────────────────────────────────────

describe('en.json — GitHub nav keys', () => {
  it('has nav.githubRepo', () => {
    const en = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8'))
    expect(en.nav).toHaveProperty('githubRepo')
    expect(en.nav.githubRepo).toBe('GitHub')
  })

  it('has nav.githubAriaLabel', () => {
    const en = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8'))
    expect(en.nav).toHaveProperty('githubAriaLabel')
    expect(en.nav.githubAriaLabel).toBe('View source on GitHub')
  })
})
