import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

const sidebarSource = fs.readFileSync(
  path.join(root, 'src/components/shared/AdminNavSidebar.tsx'),
  'utf-8'
)
const themeToggleSource = fs.readFileSync(
  path.join(root, 'src/components/shared/ThemeToggle.tsx'),
  'utf-8'
)
const globalsCss = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf-8')
const layoutTsx = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf-8')
const enMessages = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8'))

function renderWithIntl(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {component}
    </NextIntlClientProvider>
  )
}

// ── Globals.css light mode ────────────────────────────────────────────────

describe('globals.css — light mode selectors', () => {
  it('uses :root.light for manual light override', () => {
    expect(globalsCss).toContain(':root.light')
  })

  it('uses @media prefers-color-scheme: light with :not(.force-dark)', () => {
    expect(globalsCss).toContain('prefers-color-scheme: light')
    expect(globalsCss).toContain(':not(.force-dark)')
  })

  it('contains page-fade-in animation', () => {
    expect(globalsCss).toContain('page-fade-in')
    expect(globalsCss).toContain('150ms')
  })
})

// ── Layout.tsx FOIT script ────────────────────────────────────────────────

describe('layout.tsx — FOIT prevention', () => {
  it('includes inline theme script', () => {
    expect(layoutTsx).toContain('themeScript')
    expect(layoutTsx).toContain('dangerouslySetInnerHTML')
  })

  it('script reads localStorage theme key', () => {
    expect(layoutTsx).toContain("localStorage.getItem('theme')")
  })

  it('script checks prefers-color-scheme', () => {
    expect(layoutTsx).toContain('prefers-color-scheme: light')
  })

  it('script adds light class for light preference', () => {
    expect(layoutTsx).toContain("classList.add('light')")
  })

  it('includes AdminNavSidebar', () => {
    expect(layoutTsx).toContain('AdminNavSidebar')
  })

  it('includes PageTransition', () => {
    expect(layoutTsx).toContain('PageTransition')
  })

  it('includes ThemeToggle', () => {
    expect(layoutTsx).toContain('ThemeToggle')
  })

  it('includes DemoBadge', () => {
    expect(layoutTsx).toContain('DemoBadge')
  })

  it('uses next-intl NextIntlClientProvider', () => {
    expect(layoutTsx).toContain('NextIntlClientProvider')
  })

  it('uses dynamic lang from getLocale', () => {
    expect(layoutTsx).toContain('getLocale')
    expect(layoutTsx).toContain('lang={locale}')
  })
})

// ── AdminNavSidebar source ────────────────────────────────────────────────

describe('AdminNavSidebar — source checks', () => {
  it('uses useTranslations from next-intl', () => {
    expect(sidebarSource).toContain("useTranslations('nav')")
  })

  it('uses t(portfolioNavigation) for aria-label', () => {
    expect(sidebarSource).toContain("t('portfolioNavigation')")
  })

  it('has aria-current for active item', () => {
    expect(sidebarSource).toContain('aria-current')
    expect(sidebarSource).toContain("'page'")
  })

  it('uses md:w-16 lg:w-60 for responsive width', () => {
    expect(sidebarSource).toContain('md:w-16')
    expect(sidebarSource).toContain('lg:w-60')
  })

  it('uses hidden md:flex to hide on mobile', () => {
    expect(sidebarSource).toContain('hidden md:flex')
  })

  it('has fixed bottom nav for mobile (flex md:hidden)', () => {
    expect(sidebarSource).toContain('flex md:hidden')
  })

  it('uses translation keys for all nav items', () => {
    expect(sidebarSource).toContain("t('overview')")
    expect(sidebarSource).toContain("t('projects')")
    expect(sidebarSource).toContain("t('experience')")
    expect(sidebarSource).toContain("t('skills')")
    expect(sidebarSource).toContain("t('map')")
    expect(sidebarSource).toContain("t('contact')")
    expect(sidebarSource).toContain("t('admin')")
  })

  it('has amber active state classes', () => {
    expect(sidebarSource).toContain('bg-accent-muted')
    expect(sidebarSource).toContain('text-accent')
  })

  it('has 2px left-edge indicator for active item', () => {
    expect(sidebarSource).toContain('w-0.5')
    expect(sidebarSource).toContain('bg-accent')
  })

  it('has hover state classes', () => {
    expect(sidebarSource).toContain('hover:text-text-primary')
    expect(sidebarSource).toContain('hover:bg-bg-elevated')
  })

  it('has 44px minimum touch targets', () => {
    expect(sidebarSource).toContain('min-h-[44px]')
  })

  it('uses title attribute for tooltip (collapsed mode accessibility)', () => {
    expect(sidebarSource).toContain('title={label}')
  })

  it('uses roughjs dynamic import for right-edge border', () => {
    expect(sidebarSource).toContain("import('roughjs')")
  })

  it('uses ResizeObserver for border redraw', () => {
    expect(sidebarSource).toContain('ResizeObserver')
  })
})

// ── ThemeToggle source ────────────────────────────────────────────────────

describe('ThemeToggle — source checks', () => {
  it('uses useTranslations from next-intl', () => {
    expect(themeToggleSource).toContain("useTranslations('theme')")
  })

  it('reads theme from localStorage', () => {
    expect(themeToggleSource).toContain("localStorage.getItem('theme')")
  })

  it('writes theme to localStorage', () => {
    expect(themeToggleSource).toContain("localStorage.setItem('theme'")
  })

  it('toggles .light class on document.documentElement', () => {
    expect(themeToggleSource).toContain("classList.add('light')")
    expect(themeToggleSource).toContain("classList.remove('light')")
  })

  it('adds .force-dark class for manual dark override', () => {
    expect(themeToggleSource).toContain("classList.add('force-dark')")
  })

  it('checks prefers-color-scheme for system default', () => {
    expect(themeToggleSource).toContain('prefers-color-scheme: light')
  })

  it('has accessible aria-label via translations', () => {
    expect(themeToggleSource).toContain('aria-label')
    expect(themeToggleSource).toContain("t('switchToLight')")
    expect(themeToggleSource).toContain("t('switchToDark')")
  })
})

// ── DemoBadge render ──────────────────────────────────────────────────────

describe('DemoBadge', () => {
  it('renders "Demo mode" text', async () => {
    const { default: DemoBadge } = await import('../components/shared/DemoBadge')
    renderWithIntl(<DemoBadge />)
    expect(screen.getByText('Demo mode')).toBeDefined()
  })

  it('has aria-live="polite"', async () => {
    const { default: DemoBadge } = await import('../components/shared/DemoBadge')
    const { container } = renderWithIntl(<DemoBadge />)
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
  })
})

// ── ThemeToggle render ────────────────────────────────────────────────────

describe('ThemeToggle — runtime', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  it('renders a toggle button', async () => {
    const { default: ThemeToggle } = await import('../components/shared/ThemeToggle')
    renderWithIntl(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDefined()
  })

  it('toggles theme on click', async () => {
    const { default: ThemeToggle } = await import('../components/shared/ThemeToggle')
    renderWithIntl(<ThemeToggle />)
    const btn = screen.getByRole('button')
    const initialLabel = btn.getAttribute('aria-label')
    fireEvent.click(btn)
    const newLabel = btn.getAttribute('aria-label')
    expect(newLabel).not.toBe(initialLabel)
  })
})

// ── AdminNavSidebar render ────────────────────────────────────────────────

class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(_cb: ResizeObserverCallback) {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('AdminNavSidebar — runtime render', () => {
  it('renders both nav elements', async () => {
    const { default: AdminNavSidebar } = await import('../components/shared/AdminNavSidebar')
    renderWithIntl(<AdminNavSidebar />)
    const navs = screen.getAllByRole('navigation')
    expect(navs.length).toBeGreaterThanOrEqual(2)
  })

  it('renders Overview as active on / path', async () => {
    const { default: AdminNavSidebar } = await import('../components/shared/AdminNavSidebar')
    renderWithIntl(<AdminNavSidebar />)
    const activeLinks = screen.getAllByRole('link', { current: 'page' as boolean | "page" | "step" | "location" | "date" | "time" | undefined })
    expect(activeLinks.length).toBeGreaterThan(0)
  })

  it('renders translated nav labels', async () => {
    const { default: AdminNavSidebar } = await import('../components/shared/AdminNavSidebar')
    renderWithIntl(<AdminNavSidebar />)
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
  })
})
