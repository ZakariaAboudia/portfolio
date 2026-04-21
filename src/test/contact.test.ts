import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

function src(p: string) { return fs.readFileSync(path.join(root, p), 'utf-8') }
function exists(p: string) { return fs.existsSync(path.join(root, p)) }

describe('api/contact/route.ts', () => {
  it('exists', () => expect(exists('src/app/api/contact/route.ts')).toBe(true))
  it('has POST handler', () => expect(src('src/app/api/contact/route.ts')).toContain('export async function POST'))
  it('uses strict rate limiter', () => expect(src('src/app/api/contact/route.ts')).toContain('ratelimitStrict'))
  it('checks honeypot silently', () => {
    const s = src('src/app/api/contact/route.ts')
    expect(s).toContain('honeypot')
    expect(s).toContain('success: true') // silent discard
  })
  it('verifies Turnstile token', () => expect(src('src/app/api/contact/route.ts')).toContain('verifyTurnstile'))
  it('saves to Prisma before sending email', () => {
    const s = src('src/app/api/contact/route.ts')
    const prismaPos = s.indexOf('prisma.contactMessage.create')
    const emailPos = s.indexOf('await sendContactEmail')
    expect(prismaPos).toBeGreaterThan(-1)
    expect(emailPos).toBeGreaterThan(-1)
    expect(prismaPos).toBeLessThan(emailPos) // Prisma first
  })
  it('returns error when email fails without losing submission', () => expect(src('src/app/api/contact/route.ts')).toContain('EMAIL_ERROR'))
})

describe('lib/email.ts', () => {
  it('exists', () => expect(exists('src/lib/email.ts')).toBe(true))
  it('exports sendContactEmail', () => expect(src('src/lib/email.ts')).toContain('sendContactEmail'))
  it('exports verifyTurnstile', () => expect(src('src/lib/email.ts')).toContain('verifyTurnstile'))
  it('uses Resend dynamically', () => expect(src('src/lib/email.ts')).toContain("import('resend')"))
  it('verifies turnstile via cloudflare endpoint', () => expect(src('src/lib/email.ts')).toContain('challenges.cloudflare.com'))
  it('degrades gracefully without RESEND_API_KEY', () => expect(src('src/lib/email.ts')).toContain('RESEND_API_KEY'))
  it('degrades gracefully without turnstile secret', () => expect(src('src/lib/email.ts')).toContain('CLOUDFLARE_TURNSTILE_SECRET'))
})

describe('components/contact/ContactForm.tsx', () => {
  it('exists', () => expect(exists('src/components/contact/ContactForm.tsx')).toBe(true))
  it('has honeypot field off-screen', () => {
    const s = src('src/components/contact/ContactForm.tsx')
    expect(s).toContain('-9999px')
  })
  it('loads Turnstile in invisible mode', () => {
    const s = src('src/components/contact/ContactForm.tsx')
    expect(s).toContain('invisible')
  })
  it('has inline validation on blur', () => expect(src('src/components/contact/ContactForm.tsx')).toContain('onBlur'))
  it('disables submit until valid', () => expect(src('src/components/contact/ContactForm.tsx')).toContain('disabled={!isValid'))
  it('has aria-busy on submit', () => expect(src('src/components/contact/ContactForm.tsx')).toContain('aria-busy'))
  it('shows success message after submit', () => expect(src('src/components/contact/ContactForm.tsx')).toContain('Message sent'))
  it('has Name, Email, Message fields', () => {
    const s = src('src/components/contact/ContactForm.tsx')
    expect(s).toContain('cf-name')
    expect(s).toContain('cf-email')
    expect(s).toContain('cf-message')
  })
  it('uses Radix Label', () => expect(src('src/components/contact/ContactForm.tsx')).toContain('@radix-ui/react-label'))
  it('has no CV download link', () => expect(src('src/components/contact/ContactForm.tsx')).not.toContain('download'))
})

describe('app/contact/page.tsx', () => {
  it('exists', () => expect(exists('src/app/contact/page.tsx')).toBe(true))
  it('renders ContactForm', () => expect(src('src/app/contact/page.tsx')).toContain('ContactForm'))
})

describe('en.json — contact namespace', () => {
  const enMessages = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8'))
  it('has contact namespace', () => expect(enMessages).toHaveProperty('contact'))
  it('has contact.title', () => expect(enMessages.contact).toHaveProperty('title'))
  it('has contact.success', () => expect(enMessages.contact).toHaveProperty('success'))
})
