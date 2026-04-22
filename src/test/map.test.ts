import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { getRegionCoords } from '@/lib/region-coords'

const root = path.resolve(__dirname, '../..')

const regionCoordsSource = fs.readFileSync(
  path.join(root, 'src/lib/region-coords.ts'),
  'utf-8'
)
const mapPinsSource = fs.readFileSync(
  path.join(root, 'src/lib/map-pins.ts'),
  'utf-8'
)
const roughPinSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/RoughPin.tsx'),
  'utf-8'
)
const roughWorldMapSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/RoughWorldMap.tsx'),
  'utf-8'
)
const mapWithPinsDynamicSource = fs.readFileSync(
  path.join(root, 'src/components/portfolio/MapWithPinsDynamic.tsx'),
  'utf-8'
)
const mapPageSource = fs.readFileSync(
  path.join(root, 'src/app/map/page.tsx'),
  'utf-8'
)
const enMessages = JSON.parse(
  fs.readFileSync(path.join(root, 'src/i18n/messages/en.json'), 'utf-8')
)

// ── region-coords.ts ───────────────────────────────────────────────────────

describe('region-coords.ts — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/region-coords.ts'))).toBe(true)
  })

  it('exports getRegionCoords', () => {
    expect(regionCoordsSource).toContain('getRegionCoords')
  })

  it('has at least 10 region entries', () => {
    const matches = regionCoordsSource.match(/:\s*\[/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(10)
  })
})

// ── map-pins.ts ────────────────────────────────────────────────────────────

describe('map-pins.ts — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/map-pins.ts'))).toBe(true)
  })

  it('exports getMapPins', () => {
    expect(mapPinsSource).toContain('getMapPins')
  })

  it('contains colorTier', () => {
    expect(mapPinsSource).toContain('colorTier')
  })

  it('filters published: true', () => {
    expect(mapPinsSource).toContain('published: true')
  })
})

// ── RoughPin.tsx ───────────────────────────────────────────────────────────

describe('RoughPin.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/RoughPin.tsx'))).toBe(true)
  })

  it('dynamically imports roughjs', () => {
    expect(roughPinSource).toContain("import('roughjs')")
  })

  it('uses var(--accent)', () => {
    expect(roughPinSource).toContain('var(--accent)')
  })

  it('uses var(--success)', () => {
    expect(roughPinSource).toContain('var(--success)')
  })

  it('has reducedMotion prop', () => {
    expect(roughPinSource).toContain('reducedMotion')
  })
})

// ── RoughWorldMap.tsx ──────────────────────────────────────────────────────

describe('RoughWorldMap.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/RoughWorldMap.tsx'))).toBe(true)
  })

  it('has role="img"', () => {
    expect(roughWorldMapSource).toContain('role="img"')
  })

  it('has sr-only visually-hidden list', () => {
    expect(roughWorldMapSource).toMatch(/sr-only|visually-hidden/)
  })

  it('uses Tooltip', () => {
    expect(roughWorldMapSource).toContain('Tooltip')
  })

  it('uses roughjs', () => {
    expect(roughWorldMapSource).toContain("import('roughjs')")
  })

  it('uses prefers-reduced-motion', () => {
    expect(roughWorldMapSource).toContain('prefers-reduced-motion')
  })
})

// ── MapWithPinsDynamic.tsx ─────────────────────────────────────────────────

describe('MapWithPinsDynamic.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/portfolio/MapWithPinsDynamic.tsx'))).toBe(true)
  })

  it('has ssr: false', () => {
    expect(mapWithPinsDynamicSource).toContain('ssr: false')
  })
})

// ── map/page.tsx ───────────────────────────────────────────────────────────

describe('map/page.tsx — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/map/page.tsx'))).toBe(true)
  })

  it('calls getMapPins', () => {
    expect(mapPageSource).toContain('getMapPins')
  })
})

// ── en.json map namespace ──────────────────────────────────────────────────

describe('en.json — map namespace', () => {
  it('has map namespace', () => {
    expect(enMessages).toHaveProperty('map')
  })

  it('has map.ariaLabel', () => {
    expect(enMessages.map).toHaveProperty('ariaLabel')
  })

  it('has map.fallback', () => {
    expect(enMessages.map).toHaveProperty('fallback')
  })
})

// ── getRegionCoords — unit tests ───────────────────────────────────────────

describe('getRegionCoords', () => {
  it('returns coords for known region', () => {
    const coords = getRegionCoords('Netherlands')
    expect(coords).not.toBeNull()
    expect(coords).toHaveLength(2)
    expect(coords![0]).toBeCloseTo(4.9)
    expect(coords![1]).toBeCloseTo(52.37)
  })

  it('returns null for unknown region', () => {
    expect(getRegionCoords('Atlantis')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getRegionCoords('')).toBeNull()
  })

  it('returns coords for United States', () => {
    const coords = getRegionCoords('United States')
    expect(coords).not.toBeNull()
    expect(coords![0]).toBe(-98)
  })

  it('returns coords for Australia', () => {
    const coords = getRegionCoords('Australia')
    expect(coords).not.toBeNull()
    expect(coords![1]).toBeLessThan(0)
  })
})
