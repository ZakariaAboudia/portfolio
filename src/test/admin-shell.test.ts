import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

const layoutSource = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf-8')
const adminPageSource = fs.readFileSync(path.join(root, 'src/app/admin/page.tsx'), 'utf-8')
const sidebarSource = fs.readFileSync(path.join(root, 'src/components/shared/AdminNavSidebar.tsx'), 'utf-8')
const authServerSource = fs.readFileSync(path.join(root, 'src/lib/auth-server.ts'), 'utf-8')
const enMessages = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8'))

describe('auth-server.ts', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/auth-server.ts'))).toBe(true)
  })

  it('exports getAdminSessionServer', () => {
    expect(authServerSource).toContain('getAdminSessionServer')
  })

  it('exports isAdminSession', () => {
    expect(authServerSource).toContain('isAdminSession')
  })

  it('uses next/headers', () => {
    expect(authServerSource).toContain('next/headers')
  })
})

describe('layout.tsx — conditional DemoBadge', () => {
  it('imports getAdminSessionServer', () => {
    expect(layoutSource).toContain('getAdminSessionServer')
  })

  it('conditionally renders DemoBadge', () => {
    expect(layoutSource).toContain('!isAdmin')
    expect(layoutSource).toContain('DemoBadge')
  })
})

describe('admin/page.tsx', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/admin/page.tsx'))).toBe(true)
  })

  it('fetches project count', () => {
    expect(adminPageSource).toContain('prisma.project.count')
  })

  it('fetches skill count', () => {
    expect(adminPageSource).toContain('prisma.skill.count')
  })

  it('fetches timeline count', () => {
    expect(adminPageSource).toContain('prisma.timelineEntry.count')
  })

  it('links to admin sections', () => {
    expect(adminPageSource).toContain('/admin/projects')
    expect(adminPageSource).toContain('/admin/skills')
    expect(adminPageSource).toContain('/admin/timeline')
  })
})

describe('AdminNavSidebar — admin sub-nav', () => {
  it('shows admin sub-nav when on admin section', () => {
    expect(sidebarSource).toContain('isOnAdminSection')
    expect(sidebarSource).toContain('ADMIN_SUB_NAV')
  })

  it('includes projects, skills, timeline links', () => {
    expect(sidebarSource).toContain('/admin/projects')
    expect(sidebarSource).toContain('/admin/skills')
    expect(sidebarSource).toContain('/admin/timeline')
  })
})

describe('en.json — admin namespace', () => {
  it('has admin namespace', () => {
    expect(enMessages).toHaveProperty('admin')
  })

  it('has admin nav keys', () => {
    expect(enMessages.nav).toHaveProperty('adminProjects')
    expect(enMessages.nav).toHaveProperty('adminSkills')
    expect(enMessages.nav).toHaveProperty('adminTimeline')
  })

  it('has admin action keys', () => {
    expect(enMessages.admin).toHaveProperty('save')
    expect(enMessages.admin).toHaveProperty('cancel')
    expect(enMessages.admin).toHaveProperty('delete')
  })
})
