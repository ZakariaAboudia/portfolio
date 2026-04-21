import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

function src(p: string) { return fs.readFileSync(path.join(root, p), 'utf-8') }
function exists(p: string) { return fs.existsSync(path.join(root, p)) }

describe('api/admin/projects/route.ts', () => {
  it('exists', () => expect(exists('src/app/api/admin/projects/route.ts')).toBe(true))
  it('has GET handler', () => expect(src('src/app/api/admin/projects/route.ts')).toContain('export async function GET'))
  it('has POST handler', () => expect(src('src/app/api/admin/projects/route.ts')).toContain('export async function POST'))
  it('rate-limits with strict limiter on POST', () => expect(src('src/app/api/admin/projects/route.ts')).toContain('ratelimitStrict'))
  it('checks admin session on POST', () => expect(src('src/app/api/admin/projects/route.ts')).toContain('getAdminSession'))
  it('calls revalidatePath', () => expect(src('src/app/api/admin/projects/route.ts')).toContain('revalidatePath'))
  it('returns 201 on create', () => expect(src('src/app/api/admin/projects/route.ts')).toContain('status: 201'))
})

describe('api/admin/projects/[id]/route.ts', () => {
  it('exists', () => expect(exists('src/app/api/admin/projects/[id]/route.ts')).toBe(true))
  it('has PATCH handler', () => expect(src('src/app/api/admin/projects/[id]/route.ts')).toContain('export async function PATCH'))
  it('has DELETE handler', () => expect(src('src/app/api/admin/projects/[id]/route.ts')).toContain('export async function DELETE'))
  it('calls revalidatePath', () => expect(src('src/app/api/admin/projects/[id]/route.ts')).toContain('revalidatePath'))
})

describe('admin/projects/page.tsx', () => {
  it('exists', () => expect(exists('src/app/admin/projects/page.tsx')).toBe(true))
  it('fetches projects from prisma', () => expect(src('src/app/admin/projects/page.tsx')).toContain('prisma.project.findMany'))
  it('uses FilterBar', () => expect(src('src/app/admin/projects/page.tsx')).toContain('FilterBar'))
  it('shows no-results message', () => expect(src('src/app/admin/projects/page.tsx')).toContain('No projects match'))
})

describe('components/admin/ProjectForm.tsx', () => {
  it('exists', () => expect(exists('src/components/admin/ProjectForm.tsx')).toBe(true))
  it('uses LocaleTabPanel', () => expect(src('src/components/admin/ProjectForm.tsx')).toContain('LocaleTabPanel'))
  it('uses TagInput', () => expect(src('src/components/admin/ProjectForm.tsx')).toContain('TagInput'))
  it('has inline validation', () => expect(src('src/components/admin/ProjectForm.tsx')).toContain('onBlur'))
  it('disables save when invalid', () => expect(src('src/components/admin/ProjectForm.tsx')).toContain('disabled={!isValid'))
  it('has aria-busy on save button', () => expect(src('src/components/admin/ProjectForm.tsx')).toContain('aria-busy'))
})

describe('components/admin/LocaleTabPanel.tsx', () => {
  it('exists', () => expect(exists('src/components/admin/LocaleTabPanel.tsx')).toBe(true))
  it('uses Radix Tabs', () => expect(src('src/components/admin/LocaleTabPanel.tsx')).toContain('@radix-ui/react-tabs'))
  it('has EN and FR tabs', () => {
    const s = src('src/components/admin/LocaleTabPanel.tsx')
    expect(s).toContain('"en"')
    expect(s).toContain('"fr"')
  })
})

describe('components/admin/TagInput.tsx', () => {
  it('exists', () => expect(exists('src/components/admin/TagInput.tsx')).toBe(true))
  it('handles Enter key to add tag', () => expect(src('src/components/admin/TagInput.tsx')).toContain("'Enter'"))
  it('has remove button per tag', () => expect(src('src/components/admin/TagInput.tsx')).toContain('removeTag'))
})

describe('components/admin/FilterBar.tsx', () => {
  it('exists', () => expect(exists('src/components/admin/FilterBar.tsx')).toBe(true))
  it('uses URL query params', () => expect(src('src/components/admin/FilterBar.tsx')).toContain('useSearchParams'))
  it('has debounce on search', () => expect(src('src/components/admin/FilterBar.tsx')).toContain('setTimeout'))
  it('shows active filter pills', () => expect(src('src/components/admin/FilterBar.tsx')).toContain('Clear all'))
})

describe('api/admin/images/route.ts', () => {
  it('exists', () => expect(exists('src/app/api/admin/images/route.ts')).toBe(true))
  it('uses @vercel/blob put', () => expect(src('src/app/api/admin/images/route.ts')).toContain('@vercel/blob'))
  it('checks admin session', () => expect(src('src/app/api/admin/images/route.ts')).toContain('getAdminSession'))
})
