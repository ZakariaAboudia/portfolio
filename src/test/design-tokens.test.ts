import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')
const globalsCss = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf-8')
const layoutTsx = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf-8')

describe('CSS design tokens — dark palette', () => {
  it('defines --bg-base as #1a1814', () => {
    expect(globalsCss).toContain('--bg-base: #1a1814')
  })

  it('defines --accent as #e8a020', () => {
    expect(globalsCss).toContain('--accent: #e8a020')
  })

  it('defines all required dark palette tokens', () => {
    const required = [
      '--bg-base', '--bg-surface', '--bg-elevated', '--bg-subtle',
      '--text-primary', '--text-secondary', '--text-muted',
      '--accent', '--accent-hover', '--accent-muted',
      '--border-default', '--border-subtle',
      '--success', '--error',
    ]
    for (const token of required) {
      expect(globalsCss, `missing token: ${token}`).toContain(token)
    }
  })
})

describe('CSS design tokens — light palette', () => {
  it('defines --bg-base as #f5f0e8 for light mode', () => {
    expect(globalsCss).toContain('--bg-base: #f5f0e8')
  })

  it('defines --accent as #c87010 for light mode', () => {
    expect(globalsCss).toContain('--accent: #c87010')
  })
})

describe('Anti-pattern color exclusion', () => {
  const antiPatterns = ['#09090b', '#18181b', '#3b82f6', '#ffffff', '#000000']

  for (const color of antiPatterns) {
    it(`does not contain anti-pattern color ${color}`, () => {
      expect(globalsCss.toLowerCase()).not.toContain(color.toLowerCase())
    })
  }
})

describe('Typography — font loading', () => {
  it('imports Space_Grotesk from next/font/google', () => {
    expect(layoutTsx).toContain('Space_Grotesk')
    expect(layoutTsx).toContain("next/font/google")
  })

  it('imports JetBrains_Mono from next/font/google', () => {
    expect(layoutTsx).toContain('JetBrains_Mono')
  })

  it('does not import Geist or Inter fonts', () => {
    expect(layoutTsx).not.toContain('Geist')
    expect(layoutTsx).not.toContain('Inter')
  })

  it('exposes --font-space-grotesk CSS variable', () => {
    expect(layoutTsx).toContain('--font-space-grotesk')
  })

  it('exposes --font-jetbrains-mono CSS variable', () => {
    expect(layoutTsx).toContain('--font-jetbrains-mono')
  })

  it('applies dark-first via CSS :root default (no Tailwind dark class needed)', () => {
    // Dark is the default in :root CSS custom properties — no html.dark class required.
    // The FOIT script handles light-preference users before first paint.
    expect(globalsCss).toContain('--bg-base: #1a1814') // :root dark tokens present
    expect(layoutTsx).toContain('themeScript')         // FOIT prevention script applied
  })
})

describe('Type scale — globals.css @theme', () => {
  const expectedSizes = [
    { name: '--text-xs', value: '0.6875rem' },
    { name: '--text-sm', value: '0.8125rem' },
    { name: '--text-base', value: '0.9375rem' },
    { name: '--text-lg', value: '1.125rem' },
    { name: '--text-xl', value: '1.375rem' },
    { name: '--text-2xl', value: '1.75rem' },
    { name: '--text-3xl', value: '2.25rem' },
  ]

  for (const { name, value } of expectedSizes) {
    it(`${name} is ${value}`, () => {
      expect(globalsCss).toContain(`${name}: ${value}`)
    })
  }
})

describe('Font definitions in globals.css', () => {
  it('defines --font-ui using --font-space-grotesk', () => {
    expect(globalsCss).toContain('--font-space-grotesk')
    expect(globalsCss).toContain('--font-ui')
  })

  it('defines --font-mono using --font-jetbrains-mono', () => {
    expect(globalsCss).toContain('--font-jetbrains-mono')
    expect(globalsCss).toContain('--font-mono')
  })

  it('does not reference Inter font', () => {
    expect(globalsCss).not.toContain('Inter')
    expect(globalsCss).not.toContain('inter')
  })

  it('does not reference Geist font', () => {
    expect(globalsCss).not.toContain('Geist')
    expect(globalsCss).not.toContain('geist')
  })
})
