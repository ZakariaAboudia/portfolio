import { describe, it, expect, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'

// Mock ResizeObserver (not available in jsdom)
class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(_cb: ResizeObserverCallback) {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

import Skeleton, { SkeletonCard } from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import RoughButton from '@/components/shared/RoughButton'

const root = path.resolve(__dirname, '../..')

const roughButtonSource = fs.readFileSync(
  path.join(root, 'src/components/shared/RoughButton.tsx'),
  'utf-8'
)
const toastProviderSource = fs.readFileSync(
  path.join(root, 'src/components/shared/ToastProvider.tsx'),
  'utf-8'
)
const skeletonSource = fs.readFileSync(
  path.join(root, 'src/components/shared/Skeleton.tsx'),
  'utf-8'
)
const emptyStateSource = fs.readFileSync(
  path.join(root, 'src/components/shared/EmptyState.tsx'),
  'utf-8'
)

// ── Source-level structural checks ────────────────────────────────────────

describe('RoughButton — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/shared/RoughButton.tsx'))).toBe(true)
  })

  it('has variant prop', () => {
    expect(roughButtonSource).toContain('variant')
  })

  it('has drawRoughRect', () => {
    expect(roughButtonSource).toContain('drawRoughRect')
  })

  it('destructive variant has group-hover:opacity-100', () => {
    expect(roughButtonSource).toContain('group-hover:opacity-100')
  })

  it('SVG is aria-hidden', () => {
    expect(roughButtonSource).toContain('aria-hidden')
  })

  it('no NEXT_PUBLIC_ env coupling', () => {
    expect(roughButtonSource).not.toContain('NEXT_PUBLIC_')
  })

  it('has min-h-[44px] touch target', () => {
    expect(roughButtonSource).toContain('min-h-[44px]')
  })
})

describe('ToastProvider — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/shared/ToastProvider.tsx'))).toBe(true)
  })

  it('contains save-success type', () => {
    expect(toastProviderSource).toContain('save-success')
  })

  it('contains delete-success type', () => {
    expect(toastProviderSource).toContain('delete-success')
  })

  it('contains save-error type', () => {
    expect(toastProviderSource).toContain('save-error')
  })

  it('contains demo-blocked type', () => {
    expect(toastProviderSource).toContain('demo-blocked')
  })

  it('contains network-error type', () => {
    expect(toastProviderSource).toContain('network-error')
  })

  it('viewport is fixed bottom-right', () => {
    expect(toastProviderSource).toContain('fixed bottom-6 right-6')
  })
})

describe('Skeleton — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/shared/Skeleton.tsx'))).toBe(true)
  })

  it('has aria-busy', () => {
    expect(skeletonSource).toContain('aria-busy')
  })

  it('uses motion-safe:animate-pulse', () => {
    expect(skeletonSource).toContain('motion-safe:animate-pulse')
  })

  it('uses bg-bg-subtle', () => {
    expect(skeletonSource).toContain('bg-bg-subtle')
  })
})

describe('EmptyState — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/shared/EmptyState.tsx'))).toBe(true)
  })

  it('uses text-text-muted', () => {
    expect(emptyStateSource).toContain('text-text-muted')
  })
})

describe('useDelayedLoading — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/hooks/useDelayedLoading.ts'))).toBe(true)
  })
})

describe('useToast — source checks', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(root, 'src/hooks/useToast.ts'))).toBe(true)
  })
})

// ── Render tests ──────────────────────────────────────────────────────────

describe('Skeleton — render', () => {
  it('renders with aria-busy="true"', () => {
    const { container } = render(<Skeleton />)
    const busy = container.querySelector('[aria-busy="true"]')
    expect(busy).toBeTruthy()
  })

  it('renders multiple lines when lines prop set', () => {
    const { container } = render(<Skeleton lines={3} />)
    const busy = container.querySelector('[aria-busy="true"]')
    expect(busy?.children).toHaveLength(3)
  })

  it('SkeletonCard renders with aria-busy="true"', () => {
    const { container } = render(<SkeletonCard />)
    const busy = container.querySelector('[aria-busy="true"]')
    expect(busy).toBeTruthy()
  })
})

describe('EmptyState — render', () => {
  it('renders message text', () => {
    render(<EmptyState message="No items found" />)
    expect(screen.getByText('No items found')).toBeTruthy()
  })

  it('renders without action button when no action prop', () => {
    const { container } = render(<EmptyState message="Empty" />)
    expect(container.querySelector('button')).toBeNull()
  })

  it('renders primary action button when action prop provided', () => {
    render(<EmptyState message="Empty" action={{ label: 'Add item', onClick: () => {} }} />)
    expect(screen.getByText('Add item')).toBeTruthy()
  })
})

describe('RoughButton — render', () => {
  it('primary variant renders without throwing', () => {
    render(<RoughButton variant="primary">Click me</RoughButton>)
    expect(screen.getByText('Click me')).toBeTruthy()
  })

  it('secondary variant renders without throwing', () => {
    render(<RoughButton variant="secondary">Secondary</RoughButton>)
    expect(screen.getByText('Secondary')).toBeTruthy()
  })

  it('destructive variant renders with group-hover class', () => {
    const { container } = render(
      <div className="group">
        <RoughButton variant="destructive">Delete</RoughButton>
      </div>
    )
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('group-hover:opacity-100')
  })

  it('disabled button has opacity-50 class', () => {
    const { container } = render(
      <RoughButton variant="primary" disabled>
        Disabled
      </RoughButton>
    )
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('opacity-50')
  })
})
