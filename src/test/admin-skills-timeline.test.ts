import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

function src(p: string) { return fs.readFileSync(path.join(root, p), 'utf-8') }
function exists(p: string) { return fs.existsSync(path.join(root, p)) }

describe('api/admin/skills routes', () => {
  it('route.ts exists', () => expect(exists('src/app/api/admin/skills/route.ts')).toBe(true))
  it('has GET and POST', () => {
    const s = src('src/app/api/admin/skills/route.ts')
    expect(s).toContain('export async function GET')
    expect(s).toContain('export async function POST')
  })
  it('calls revalidatePath /skills', () => expect(src('src/app/api/admin/skills/route.ts')).toContain("revalidatePath('/skills')"))
  it('[id]/route.ts exists', () => expect(exists('src/app/api/admin/skills/[id]/route.ts')).toBe(true))
  it('has PATCH and DELETE', () => {
    const s = src('src/app/api/admin/skills/[id]/route.ts')
    expect(s).toContain('export async function PATCH')
    expect(s).toContain('export async function DELETE')
  })
})

describe('api/admin/timeline routes', () => {
  it('route.ts exists', () => expect(exists('src/app/api/admin/timeline/route.ts')).toBe(true))
  it('has GET and POST', () => {
    const s = src('src/app/api/admin/timeline/route.ts')
    expect(s).toContain('export async function GET')
    expect(s).toContain('export async function POST')
  })
  it('calls revalidatePath /experience', () => expect(src('src/app/api/admin/timeline/route.ts')).toContain("revalidatePath('/experience')"))
  it('[id]/route.ts exists', () => expect(exists('src/app/api/admin/timeline/[id]/route.ts')).toBe(true))
})

describe('admin/skills page', () => {
  it('exists', () => expect(exists('src/app/admin/skills/page.tsx')).toBe(true))
  it('fetches from prisma', () => expect(src('src/app/admin/skills/page.tsx')).toContain('prisma.skill.findMany'))
  it('uses FilterBar', () => expect(src('src/app/admin/skills/page.tsx')).toContain('FilterBar'))
})

describe('admin/timeline page', () => {
  it('exists', () => expect(exists('src/app/admin/timeline/page.tsx')).toBe(true))
  it('fetches from prisma', () => expect(src('src/app/admin/timeline/page.tsx')).toContain('prisma.timelineEntry.findMany'))
})

describe('components/admin/SkillForm.tsx', () => {
  it('exists', () => expect(exists('src/components/admin/SkillForm.tsx')).toBe(true))
  it('has level range input', () => expect(src('src/components/admin/SkillForm.tsx')).toContain('type="range"'))
  it('has inline validation on blur', () => expect(src('src/components/admin/SkillForm.tsx')).toContain('onBlur'))
  it('disables save when invalid', () => expect(src('src/components/admin/SkillForm.tsx')).toContain('disabled={!isValid'))
})

describe('components/admin/TimelineForm.tsx', () => {
  it('exists', () => expect(exists('src/components/admin/TimelineForm.tsx')).toBe(true))
  it('uses LocaleTabPanel', () => expect(src('src/components/admin/TimelineForm.tsx')).toContain('LocaleTabPanel'))
  it('has date inputs', () => {
    const s = src('src/components/admin/TimelineForm.tsx')
    expect(s).toContain('startDate')
    expect(s).toContain('endDate')
  })
  it('has type select', () => expect(src('src/components/admin/TimelineForm.tsx')).toContain('work'))
})

describe('api/admin/contact-messages/route.ts', () => {
  it('exists', () => expect(exists('src/app/api/admin/contact-messages/route.ts')).toBe(true))
  it('checks admin session', () => expect(src('src/app/api/admin/contact-messages/route.ts')).toContain('getAdminSession'))
  it('fetches contact messages', () => expect(src('src/app/api/admin/contact-messages/route.ts')).toContain('prisma.contactMessage.findMany'))
})
