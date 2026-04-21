import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import fs from 'fs'
import path from 'path'

// ── Source-level checks ─────────────────────────────────────────────────────

const root = path.resolve(__dirname, '../..')
const roughCardSource = fs.readFileSync(
  path.join(root, 'src/components/shared/RoughCard.tsx'),
  'utf-8'
)

describe('RoughCard — source-level constraints', () => {
  it('does not import roughjs at module level', () => {
    // Top-level static import would look like: import rough from 'roughjs'
    // Dynamic import inside async fn is fine
    const topLevelImport = /^import\s+.*['"]roughjs['"]/m
    expect(roughCardSource).not.toMatch(topLevelImport)
  })

  it('uses dynamic import for roughjs', () => {
    expect(roughCardSource).toContain("import('roughjs')")
  })

  it('sets aria-hidden on SVG element', () => {
    expect(roughCardSource).toContain('aria-hidden="true"')
  })

  it('sets pointer-events none on SVG element', () => {
    // JSX uses pointerEvents (camelCase) or inline style string
    const hasPointerEvents =
      roughCardSource.includes('pointerEvents') ||
      roughCardSource.includes('pointer-events')
    expect(hasPointerEvents).toBe(true)
    expect(roughCardSource).toContain('none')
  })

  it('positions SVG absolute inset-0', () => {
    expect(roughCardSource).toContain('absolute inset-0')
  })

  it('wraps content in relative z-10 container', () => {
    expect(roughCardSource).toContain('relative z-10')
  })

  it('uses ResizeObserver', () => {
    expect(roughCardSource).toContain('ResizeObserver')
  })

  it('debounces resize at 100ms', () => {
    expect(roughCardSource).toContain('100')
    expect(roughCardSource).toContain('setTimeout')
  })

  it('applies roughness 0.7 for mobile breakpoint', () => {
    expect(roughCardSource).toContain('0.7')
    expect(roughCardSource).toContain('768')
  })

  it('applies roughness 1.0 for desktop', () => {
    expect(roughCardSource).toContain('1.0')
  })

  it('uses bowing 0.4', () => {
    expect(roughCardSource).toContain('0.4')
  })

  it('uses strokeWidth 1.5', () => {
    expect(roughCardSource).toContain('1.5')
  })

  it('uses --border-default for stroke color', () => {
    expect(roughCardSource).toContain('--border-default')
  })

  it('accepts seed prop for stable renders', () => {
    expect(roughCardSource).toContain('seed')
  })
})

// ── Runtime render tests ────────────────────────────────────────────────────

// Mock ResizeObserver (not available in jsdom) — must be constructable
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
class MockResizeObserver {
  observe = mockObserve
  disconnect = mockDisconnect
  unobserve = vi.fn()
  constructor(_cb: ResizeObserverCallback) {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

import RoughCard from '../components/shared/RoughCard'

describe('RoughCard — runtime rendering', () => {
  beforeEach(() => {
    mockObserve.mockClear()
    mockDisconnect.mockClear()
  })

  it('renders children', () => {
    render(
      <RoughCard>
        <span data-testid="child">hello</span>
      </RoughCard>
    )
    expect(screen.getByTestId('child')).toBeDefined()
    expect(screen.getByTestId('child').textContent).toBe('hello')
  })

  it('mounts a ResizeObserver on the container', () => {
    render(
      <RoughCard>
        <span>content</span>
      </RoughCard>
    )
    expect(mockObserve).toHaveBeenCalled()
  })
})
