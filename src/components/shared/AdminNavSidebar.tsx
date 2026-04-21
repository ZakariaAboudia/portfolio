'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRef, useEffect, useCallback, useState } from 'react'

// ── Icons ─────────────────────────────────────────────────────────────────

function IconOverview() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconProjects() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  )
}

function IconExperience() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function IconSkills() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}

function IconContact() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconAdmin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

// ── Nav types ─────────────────────────────────────────────────────────────

interface NavItemDef {
  href: string
  label: string
  Icon: () => React.ReactElement
  exactMatch?: boolean
}

// ── GitHub icon ───────────────────────────────────────────────────────────

function IconGitHub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// ── Rough border helper ───────────────────────────────────────────────────

async function drawRoughEdge(svg: SVGSVGElement, height: number, strokeColor: string) {
  try {
    const rough = ((await import('roughjs')).default ?? (await import('roughjs'))) as unknown as typeof import('roughjs').default
    const rc = rough.svg(svg) as any
    svg.innerHTML = ''
    svg.setAttribute('height', String(height))
    const line = rc.line(1, 4, 1, height - 4, {
      roughness: 1.0,
      bowing: 0.3,
      stroke: strokeColor,
      strokeWidth: 1.5,
      seed: 99,
    })
    svg.appendChild(line as unknown as Node)
  } catch {
    // CSS border fallback on the nav element handles this
  }
}

// ── Rough separator ───────────────────────────────────────────────────────

function RoughSeparator() {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    import('roughjs').then(m => {
      const rough = (m.default ?? m) as unknown as typeof import('roughjs').default
      const rc = rough.svg(svg) as any
      svg.innerHTML = ''
      const node = rc.line(8, 4, 180, 4, {
        roughness: 1.2, bowing: 0.8,
        stroke: 'var(--border-subtle)', strokeWidth: 1, seed: 55,
      })
      svg.appendChild(node as unknown as Node)
    }).catch(() => {})
  }, [])
  return (
    <svg ref={ref} aria-hidden="true" width="100%" height="8" className="my-1 px-2" style={{ overflow: 'visible' }} />
  )
}

// ── NavItem ───────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  Icon,
  isActive,
}: NavItemDef & { isActive: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={isActive ? 'page' : undefined}
      className={`
        flex items-center justify-center lg:justify-start gap-3
        px-3 py-2.5 mx-2 rounded
        text-sm font-medium
        transition-colors select-none
        min-h-[44px]
        ${isActive
          ? 'text-accent'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
        }
      `}
    >
      <span className="shrink-0"><Icon /></span>
      <span className="hidden lg:block truncate">{isActive ? `— ${label}` : label}</span>
    </Link>
  )
}

// ── Mobile bottom nav item ────────────────────────────────────────────────

function MobileNavItem({
  href,
  label,
  Icon,
  isActive,
}: NavItemDef & { isActive: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        flex flex-col items-center justify-center gap-0.5
        flex-1 min-h-[44px] py-1
        text-xs font-medium
        transition-colors
        ${isActive ? 'text-accent' : 'text-text-secondary'}
      `}
    >
      <Icon />
      <span className="leading-none">{label}</span>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function AdminNavSidebar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Nav arrays defined inside component — labels come from translations
  const PRIMARY_NAV: NavItemDef[] = [
    { href: '/',           label: t('overview'),   Icon: IconOverview,   exactMatch: true },
    { href: '/projects',   label: t('projects'),   Icon: IconProjects },
    { href: '/experience', label: t('experience'), Icon: IconExperience },
    { href: '/skills',     label: t('skills'),     Icon: IconSkills },
    { href: '/map',        label: t('map'),         Icon: IconMap },
    { href: '/contact',    label: t('contact'),    Icon: IconContact },
  ]

  const ADMIN_NAV: NavItemDef = { href: '/admin', label: t('admin'), Icon: IconAdmin, exactMatch: true }

  const ADMIN_SUB_NAV: NavItemDef[] = [
    { href: '/admin/projects', label: t('adminProjects'), Icon: IconProjects },
    { href: '/admin/skills', label: t('adminSkills'), Icon: IconSkills },
    { href: '/admin/timeline', label: t('adminTimeline'), Icon: IconExperience },
  ]

  const isOnAdminSection = pathname.startsWith('/admin')

  function isActive(item: NavItemDef) {
    if (item.exactMatch) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const drawBorder = useCallback(async () => {
    const el = sidebarRef.current
    const svg = svgRef.current
    if (!el || !svg) return
    const height = el.getBoundingClientRect().height
    if (height === 0) return
    const strokeColor =
      getComputedStyle(el).getPropertyValue('--border-default').trim() || '#3a342a'
    await drawRoughEdge(svg, height, strokeColor)
  }, [])

  const debouncedDraw = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(drawBorder, 100)
  }, [drawBorder])

  useEffect(() => {
    drawBorder()
    const el = sidebarRef.current
    if (!el) return
    const observer = new ResizeObserver(debouncedDraw)
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [drawBorder, debouncedDraw])

  const adminActive = isActive(ADMIN_NAV)

  return (
    <>
      {/* ── Desktop / Tablet sidebar ──────────────────────────────────── */}
      <nav
        ref={sidebarRef}
        aria-label={t('portfolioNavigation')}
        className="
          hidden md:flex flex-col
          md:w-16 lg:w-60
          shrink-0 sticky top-0 h-screen
          bg-transparent
          overflow-hidden
        "
        style={{}}
      >
        {/* SVG defs: hand-drawn filter applied to nav contents */}
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <defs>
            <filter id="sketchy-nav" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>


        {/* All nav content runs through the sketchy filter */}
        <div style={{ filter: 'url(#sketchy-nav)' }} className="flex flex-col flex-1 overflow-hidden">
          {/* Logo / wordmark area */}
          <div className="h-14 flex items-center px-4 shrink-0">
            <span className="font-mono text-sm font-semibold text-text-primary hidden lg:block tracking-widest uppercase">
              {t('portfolio')}
            </span>
            <span className="font-mono text-sm font-semibold text-text-primary lg:hidden">{t('portfolioInitial')}</span>
          </div>

          {/* Primary nav */}
          <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-0.5 justify-center">
            {PRIMARY_NAV.map(item => (
              <NavItem key={item.href} {...item} isActive={isActive(item)} />
            ))}

            {/* Admin */}
            <NavItem {...ADMIN_NAV} isActive={adminActive} />
            {isOnAdminSection && (
              <div className="ml-3 opacity-70 flex flex-col gap-0.5">
                {ADMIN_SUB_NAV.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    aria-current={isActive(item) ? 'page' : undefined}
                    className={`
                      flex items-center justify-center lg:justify-start gap-2.5
                      px-2 py-1.5 mx-2 rounded
                      text-xs font-medium
                      transition-colors select-none
                      min-h-[36px]
                      ${isActive(item)
                        ? 'text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                      }
                    `}
                  >
                    <span className="shrink-0 scale-90"><item.Icon /></span>
                    <span className="hidden lg:block truncate">{isActive(item) ? `— ${item.label}` : item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* GitHub link — bottom of sidebar, only if env var set */}
          {process.env.NEXT_PUBLIC_GITHUB_URL && (
            <div className="shrink-0 px-2 py-3">
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('githubAriaLabel')}
                title={t('githubAriaLabel')}
                className="
                  flex items-center gap-3
                  px-3 py-2.5 rounded
                  text-sm font-medium
                  text-text-secondary hover:text-text-primary hover:bg-bg-elevated
                  transition-colors min-h-[44px]
                "
              >
                <span className="shrink-0"><IconGitHub /></span>
                <span className="hidden lg:block truncate">{t('githubRepo')}</span>
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav
        aria-label={t('portfolioNavigation')}
        className="
          flex md:hidden
          fixed bottom-0 inset-x-0 z-20
          bg-bg-surface
          border-t border-border-subtle
          h-14
        "
      >
        {PRIMARY_NAV.slice(0, 4).map(item => (
          <MobileNavItem key={item.href} {...item} isActive={isActive(item)} />
        ))}

        {/* "More" overflow for Contact + Admin */}
        <div className="relative flex-1">
          <button
            aria-label={t('moreNavigationItems')}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(v => !v)}
            className="
              flex flex-col items-center justify-center gap-0.5
              w-full min-h-[44px] py-1
              text-xs font-medium text-text-secondary
            "
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
            <span className="leading-none">{t('more')}</span>
          </button>

          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                aria-hidden="true"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Overflow sheet */}
              <div className="absolute bottom-full right-0 mb-1 w-48 bg-bg-elevated rounded z-20 py-1 shadow-lg" style={{ border: '1px solid var(--border-default)' }}>
                {[PRIMARY_NAV[4], ADMIN_NAV].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item) ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 text-sm
                      ${isActive(item) ? 'text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'}
                    `}
                  >
                    <item.Icon />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
