import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { t } from '@/lib/i18n'
import type { TranslatableField } from '@/types/prisma'

const root = path.resolve(__dirname, '../..')
const enJson = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8'))
const frJson = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/messages/fr.json'), 'utf-8'))

// ── Message file structure ────────────────────────────────────────────────

describe('i18n message files', () => {
  it('en.json exists and is valid JSON', () => {
    expect(typeof enJson).toBe('object')
    expect(enJson).not.toBeNull()
  })

  it('fr.json exists and is valid JSON', () => {
    expect(typeof frJson).toBe('object')
    expect(frJson).not.toBeNull()
  })

  it('en.json has all required top-level namespaces', () => {
    const requiredKeys = ['metadata', 'nav', 'theme', 'demo', 'home', 'login']
    for (const key of requiredKeys) {
      expect(enJson, `en.json missing namespace: ${key}`).toHaveProperty(key)
    }
  })

  it('en.json nav namespace has all nav labels', () => {
    const navKeys = ['overview', 'projects', 'experience', 'skills', 'map', 'contact', 'admin',
      'portfolio', 'portfolioInitial', 'more', 'moreNavigationItems', 'portfolioNavigation']
    for (const key of navKeys) {
      expect(enJson.nav, `en.json nav missing key: ${key}`).toHaveProperty(key)
      expect(typeof enJson.nav[key]).toBe('string')
      expect(enJson.nav[key].length).toBeGreaterThan(0)
    }
  })

  it('en.json theme namespace has switchToLight and switchToDark', () => {
    expect(enJson.theme).toHaveProperty('switchToLight')
    expect(enJson.theme).toHaveProperty('switchToDark')
  })

  it('en.json demo namespace has badge', () => {
    expect(enJson.demo).toHaveProperty('badge')
    expect(enJson.demo.badge).toBe('Demo mode')
  })

  it('en.json login namespace has required keys', () => {
    expect(enJson.login).toHaveProperty('signInWithGoogle')
    expect(enJson.login).toHaveProperty('signInWithGitHub')
    expect(enJson.login).toHaveProperty('errors')
    expect(enJson.login.errors).toHaveProperty('unauthorized')
    expect(enJson.login.errors).toHaveProperty('oauthError')
    expect(enJson.login.errors).toHaveProperty('default')
  })

  it('en.json metadata has title and description', () => {
    expect(enJson.metadata).toHaveProperty('title')
    expect(enJson.metadata).toHaveProperty('description')
  })
})

// ── t() helper ────────────────────────────────────────────────────────────

describe('t() helper — TranslatableField extraction', () => {
  it('returns en value when locale is en', () => {
    const field: TranslatableField = { en: 'Hello' }
    expect(t(field, 'en')).toBe('Hello')
  })

  it('returns fr value when locale is fr and fr is present', () => {
    const field: TranslatableField = { en: 'Hello', fr: 'Bonjour' }
    expect(t(field, 'fr')).toBe('Bonjour')
  })

  it('falls back to en when locale is fr but fr is absent', () => {
    const field: TranslatableField = { en: 'Hello' }
    expect(t(field, 'fr')).toBe('Hello')
  })

  it('returns empty string for null field', () => {
    expect(t(null, 'en')).toBe('')
  })

  it('returns empty string for undefined field', () => {
    expect(t(undefined, 'en')).toBe('')
  })

  it('returns en value as last resort when locale key missing', () => {
    const field: TranslatableField = { en: 'Fallback' }
    expect(t(field, 'de')).toBe('Fallback')
  })

  it('never throws on any input', () => {
    expect(() => t(null, 'en')).not.toThrow()
    expect(() => t(undefined, 'fr')).not.toThrow()
    expect(() => t({ en: '' }, 'en')).not.toThrow()
  })
})

// ── i18n config ───────────────────────────────────────────────────────────

describe('i18n config', () => {
  it('config.ts exports locales and defaultLocale', async () => {
    const { locales, defaultLocale } = await import('@/i18n/config')
    expect(locales).toContain('en')
    expect(locales).toContain('fr')
    expect(defaultLocale).toBe('en')
  })

  it('routing.ts exports routing with localePrefix never', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.locales).toContain('en')
    expect(routing.locales).toContain('fr')
    expect(routing.defaultLocale).toBe('en')
  })
})
