import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { formatDateRange } from '@/lib/format-date'

const root = path.resolve(__dirname, '../..')

const cardSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/TimelineEntryCard.tsx'),
  'utf-8'
)
const pageSource = fs.readFileSync(
  path.join(root, 'src/app/experience/page.tsx'),
  'utf-8'
)
const enMessages = JSON.parse(
  fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8')
)

// ── TimelineEntryCard — source checks ──────────────────────────────────────

describe('TimelineEntryCard — source checks', () => {
  it('exists', () => {
    expect(
      fs.existsSync(path.join(root, 'src/components/portfolio/TimelineEntryCard.tsx'))
    ).toBe(true)
  })

  it('has left border timeline styling', () => {
    expect(cardSource).toContain('border-l border-border-subtle')
  })

  it('has amber dot (bg-accent)', () => {
    expect(cardSource).toContain('bg-accent')
  })

  it('uses t() with TranslatableField', () => {
    expect(cardSource).toContain('t(')
    expect(cardSource).toContain('TranslatableField')
  })

  it('uses formatDateRange', () => {
    expect(cardSource).toContain('formatDateRange')
  })

  it('renders organization', () => {
    expect(cardSource).toContain('organization')
  })

  it('renders type badge', () => {
    expect(cardSource).toContain('entry.type')
  })
})

// ── experience/page.tsx — source checks ────────────────────────────────────

describe('experience/page.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/experience/page.tsx'))).toBe(true)
  })

  it('orders by startDate desc', () => {
    expect(pageSource).toContain("startDate: 'desc'")
  })

  it('uses getLocale', () => {
    expect(pageSource).toContain('getLocale')
  })

  it('uses EmptyState', () => {
    expect(pageSource).toContain('EmptyState')
  })

  it('renders TimelineEntryCard', () => {
    expect(pageSource).toContain('TimelineEntryCard')
  })
})

// ── en.json experience namespace ───────────────────────────────────────────

describe('en.json — experience namespace', () => {
  it('has experience namespace', () => {
    expect(enMessages).toHaveProperty('experience')
  })

  it('has experience.title', () => {
    expect(enMessages.experience).toHaveProperty('title', 'Experience')
  })

  it('has experience.empty', () => {
    expect(enMessages.experience).toHaveProperty('empty')
  })

  it('has experience.present', () => {
    expect(enMessages.experience).toHaveProperty('present', 'Present')
  })
})

// ── formatDateRange — unit tests ───────────────────────────────────────────

describe('formatDateRange', () => {
  it('shows Present when endDate is null', () => {
    const start = new Date('2020-01-15')
    const result = formatDateRange(start, null, 'Present')
    expect(result).toContain('Present')
    expect(result).toContain('2020')
  })

  it('formats both dates when endDate is set', () => {
    const start = new Date('2020-01-15')
    const end = new Date('2023-03-10')
    const result = formatDateRange(start, end, 'Present')
    expect(result).toContain('2020')
    expect(result).toContain('2023')
    expect(result).not.toContain('Present')
  })

  it('uses en-dash separator', () => {
    const result = formatDateRange(new Date('2021-06-01'), new Date('2022-06-01'), 'Present')
    expect(result).toContain('–')
  })

  it('uses custom presentLabel', () => {
    const result = formatDateRange(new Date('2021-01-01'), null, 'Current')
    expect(result).toContain('Current')
  })
})
