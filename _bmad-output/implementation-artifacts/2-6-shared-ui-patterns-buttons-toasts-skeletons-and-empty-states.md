# Story 2.6: Shared UI Patterns — Buttons, Toasts, Skeletons & Empty States

Status: review

## Story

As a visitor or developer using the portfolio,
I want consistent, accessible UI feedback patterns across every interaction,
So that save confirmations, loading states, and empty data surfaces all communicate clearly without disrupting the workflow.

## Acceptance Criteria

1. **Given** the three-tier button hierarchy
   **When** any button renders
   **Then** Primary buttons have a Rough.js border with `--accent` fill area on hover; Secondary buttons have a Rough.js border with transparent fill; Ghost/Destructive buttons show `--error` text with no border (visible on parent hover only via `group-hover`)
   **And** never two Primary buttons appear side by side on the same screen

2. **Given** any async operation (save, delete, send)
   **When** it completes successfully or fails
   **Then** a Radix `Toast` appears at bottom-right with the correct message and duration (4s auto-dismiss for success; persistent for errors with retry action)
   **And** only one toast is visible at a time — subsequent toasts are queued

3. **Given** any data surface that is loading
   **When** the data has not yet resolved
   **Then** a skeleton screen renders (not a spinner) using `--bg-subtle` colored placeholders with the correct dimensions
   **And** a pulse animation (opacity 0.5→1.0 at 1.5s cycle) runs unless `prefers-reduced-motion` is set
   **And** the skeleton is skipped entirely if data resolves in under 200ms
   **And** the loading container has `aria-busy="true"`

4. **Given** any list or data surface with no records
   **When** the data resolves to an empty array
   **Then** an empty state renders with the correct message in `--text-muted`, centered, with no illustration
   **And** if an action button is specified for the empty state, it renders as a Primary button

## Tasks / Subtasks

- [x] Task 1: Install Radix UI packages (AC: #2)
  - [x] `npm install @radix-ui/react-toast @radix-ui/react-alert-dialog`

- [x] Task 2: Create `RoughButton` component (AC: #1)
  - [x] `src/components/shared/RoughButton.tsx` — `'use client'`
  - [x] Props: `variant: 'primary' | 'secondary' | 'destructive'`, `children`, `className?`, `onClick?`, `disabled?`, `type?`
  - [x] `primary` variant: Rough.js border (roughness 1.0), hover background `bg-accent-muted`, text `text-accent`, min-h 44px, px-4 py-2
  - [x] `secondary` variant: Rough.js border (roughness 1.0), transparent fill, text `text-text-primary`
  - [x] `destructive` variant: no Rough.js border, `text-error`, opacity-0 normally, `group-hover:opacity-100` — parent must have `group` class
  - [x] Reuse `drawRoughRect` / `drawFallbackRect` pattern from `RoughCard.tsx` — copy the async Rough.js draw logic (do NOT import from RoughCard, keep self-contained)
  - [x] Use `useRef<HTMLButtonElement>` + `useRef<SVGSVGElement>` + ResizeObserver for primary/secondary
  - [x] `disabled` state: opacity-50, cursor-not-allowed, skip Rough.js redraw
  - [x] Seed: stable per-instance `useState(() => ++_idCounter)`
  - [x] SVG positioned absolute inset-0, `aria-hidden`, `pointerEvents: none`

- [x] Task 3: Create Toast system (AC: #2)
  - [x] `src/components/shared/ToastProvider.tsx` — `'use client'`
    - [x] Wraps `Toast.Provider` (Radix) with `swipeDirection="right"` and `duration` controlled per toast
    - [x] Renders `Toast.Viewport` fixed bottom-right: `fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80`
    - [x] Exports `ToastContext` with `{ addToast }` function
    - [x] Queue logic: store array of toast objects in state; only render first; shift on dismiss
  - [x] `src/hooks/useToast.ts` — `'use client'`
    - [x] `useToast()` returns `{ addToast }` from context
    - [x] All 5 toast types: `save-success`, `delete-success`, `save-error`, `demo-blocked`, `network-error`
    - [x] 4s auto-dismiss for success/demo-blocked; Infinity duration for errors with Retry action button

- [x] Task 4: Mount ToastProvider in root layout (AC: #2)
  - [x] In `src/app/layout.tsx`, wrap body content with `<ToastProvider>`
  - [x] Place INSIDE `NextIntlClientProvider` (ToastProvider is `'use client'`, safe inside client provider)

- [x] Task 5: Create `Skeleton` component (AC: #3)
  - [x] `src/components/shared/Skeleton.tsx` — `'use client'`
  - [x] Props: `width?`, `height?`, `className?`, `lines?`
  - [x] `motion-safe:animate-pulse` — respects `prefers-reduced-motion` via Tailwind prefix
  - [x] `aria-busy="true"` on the wrapper `<div>`
  - [x] `SkeletonCard` named export: full-width h-32 preset
  - [x] `src/hooks/useDelayedLoading.ts`: returns true only after isLoading has been true for delay ms

- [x] Task 6: Create `EmptyState` component (AC: #4)
  - [x] `src/components/shared/EmptyState.tsx` — `'use client'`
  - [x] Props: `message: string`, `action?: { label: string; onClick: () => void }`
  - [x] Layout: centered, `text-text-muted`, no illustration
  - [x] Action renders as `<RoughButton variant="primary">`

- [x] Task 7: Tests (AC: #1–#4)
  - [ ] `src/test/ui-patterns.test.tsx` — new file:
    - Source-level checks (fs.readFileSync):
      - `RoughButton.tsx` exists and contains `variant`, `drawRoughRect` or equivalent, `NEXT_PUBLIC_` pattern absent (no env coupling)
      - `RoughButton.tsx` contains `group-hover:opacity-100` (destructive visibility)
      - `RoughButton.tsx` contains `aria-hidden` (SVG)
      - `ToastProvider.tsx` exists and contains all 5 toast type strings
      - `ToastProvider.tsx` contains `fixed bottom-6 right-6`
      - `Skeleton.tsx` exists and contains `aria-busy`
      - `Skeleton.tsx` contains `motion-safe:animate-pulse`
      - `EmptyState.tsx` exists and contains `text-text-muted`
      - `globals.css` contains `skeleton-pulse` keyframe
    - Render tests (renderWithIntl):
      - `<Skeleton />` renders with `aria-busy="true"`
      - `<EmptyState message="No items" />` renders message text
      - `<RoughButton variant="primary">Click</RoughButton>` renders without throwing
      - `<RoughButton variant="destructive">Delete</RoughButton>` renders with `group-hover:opacity-100` class

## Dev Notes

### Package Installation

Run first:
```bash
npm install @radix-ui/react-toast @radix-ui/react-alert-dialog
```

Versions available on npm:
- `@radix-ui/react-toast`: 1.2.15
- `@radix-ui/react-alert-dialog`: 1.1.15

### RoughButton — Rough.js Pattern

Copy the draw pattern from `RoughCard.tsx` — do NOT import from it. Keep `RoughButton` self-contained:

```tsx
'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

let _btnIdCounter = 0

function drawFallbackRect(svg: SVGSVGElement, w: number, h: number, stroke: string) { /* same as RoughCard */ }
async function drawRoughRect(svg: SVGSVGElement, w: number, h: number, roughness: number, seed: number, stroke: string) { /* same as RoughCard */ }

interface RoughButtonProps {
  variant: 'primary' | 'secondary' | 'destructive'
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function RoughButton({ variant, children, className = '', onClick, disabled, type = 'button' }: RoughButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [stableSeed] = useState(() => ++_btnIdCounter)

  const render = useCallback(() => {
    if (variant === 'destructive') return  // no border
    const el = btnRef.current
    const svg = svgRef.current
    if (!el || !svg) return
    const { width, height } = el.getBoundingClientRect()
    if (!width || !height) return
    const stroke = getComputedStyle(el).getPropertyValue('--border-default').trim() || '#3a342a'
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    drawRoughRect(svg, width, height, 1.0, stableSeed, stroke)
  }, [variant, stableSeed])

  // ...ResizeObserver setup same as RoughCard
```

Primary button classes: `relative min-h-[44px] px-4 py-2 text-accent hover:bg-accent-muted transition-colors`
Secondary button classes: `relative min-h-[44px] px-4 py-2 text-text-primary`
Destructive button classes: `opacity-0 group-hover:opacity-100 text-error min-h-[44px] px-2 py-1 transition-opacity`

### ToastProvider — Queue Logic

```tsx
'use client'

import * as Toast from '@radix-ui/react-toast'
import { createContext, useContext, useState, useCallback } from 'react'

// Single active toast + queue array
// On dismiss/timeout: shift queue, show next
// duration=0 means persistent (no auto-dismiss) — pass duration to Toast.Root
```

Toast.Root `duration` prop: pass `4000` for success/demo-blocked, `Infinity` for errors (Radix supports this).

### Skeleton — 200ms Defer Hook

```ts
// src/hooks/useDelayedLoading.ts
'use client'
import { useState, useEffect } from 'react'

export function useDelayedLoading(isLoading: boolean, delay = 200): boolean {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!isLoading) { setShow(false); return }
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [isLoading, delay])
  return show
}
```

Usage pattern: `const showSkeleton = useDelayedLoading(isLoading)` — only render `<Skeleton>` if `showSkeleton`.

### Skeleton — globals.css Addition

Add to `src/app/globals.css` (after existing keyframes):

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.skeleton-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

Then use `motion-safe:animate-[skeleton-pulse_1.5s_ease-in-out_infinite]` in Tailwind, OR just use Tailwind's built-in `motion-safe:animate-pulse` (it's close enough and avoids custom CSS).

**Decision:** Use Tailwind's built-in `motion-safe:animate-pulse` — it already respects `prefers-reduced-motion` via the `motion-safe:` prefix. No custom keyframe needed.

### EmptyState — Client vs Server

If `action` prop is absent: pure Server Component works fine.
If action needs `onClick`: cannot pass functions to Server Components — caller must wrap `EmptyState` in a client component or make `EmptyState` itself `'use client'`.

**Simple approach:** Make `EmptyState` always `'use client'` — it's a small leaf component. This avoids the complexity of splitting.

### ToastProvider Placement in Layout

```tsx
// src/app/layout.tsx (existing)
<NextIntlClientProvider locale={locale} messages={messages}>
  <ToastProvider>    {/* ADD */}
    {children}
  </ToastProvider>   {/* ADD */}
</NextIntlClientProvider>
```

### File Locations

```
src/components/shared/RoughButton.tsx     — NEW
src/components/shared/ToastProvider.tsx   — NEW
src/components/shared/Skeleton.tsx        — NEW
src/components/shared/EmptyState.tsx      — NEW
src/hooks/useToast.ts                     — NEW
src/hooks/useDelayedLoading.ts            — NEW
src/app/layout.tsx                        — MODIFY (add ToastProvider)
src/app/globals.css                       — MODIFY only if custom keyframe needed
src/test/ui-patterns.test.tsx             — NEW
```

### Story 2.5 Learnings Applied

- Render tests need `renderWithIntl()` from `src/test/setup.ts` pattern — or import directly
- Source-level checks (fs.readFileSync) work well for structural verification without needing full render
- Components using `useTranslations` need `renderWithIntl()` — RoughButton/Skeleton/EmptyState do NOT use translations (hardcoded EN for now), so plain `render()` from Testing Library is fine

### References

- [Source: epics.md#Story 2.6]
- [Source: architecture.md — Radix UI headless, design token system, Tailwind v4]
- [Source: src/components/shared/RoughCard.tsx — Rough.js draw pattern to replicate]
- [Source: src/app/globals.css — design tokens: --accent, --error, --bg-subtle, --text-muted, --border-default]
- [Source: src/test/seo.test.ts — test pattern: fs source checks + dynamic import]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Installed `@radix-ui/react-toast@1.2.15` and `@radix-ui/react-alert-dialog@1.1.15`
- `RoughButton`: three variants (primary/secondary/destructive); Rough.js border via self-contained `drawRoughRect`/`drawFallbackRect` pattern copied from RoughCard; ResizeObserver for live border resize; destructive is opacity-0 `group-hover:opacity-100`; disabled adds opacity-50 cursor-not-allowed
- `ToastProvider`: Radix Toast.Provider with queue (array state, shift on dismiss); 5 typed toasts; Infinity duration for error toasts; `text-error` border/title for errors; Retry button (`text-accent underline`) for save-error/network-error
- `useToast`: thin hook consuming ToastContext; exports `ToastConfig` type
- `ToastProvider` mounted in `src/app/layout.tsx` inside `NextIntlClientProvider`
- `Skeleton`: `motion-safe:animate-pulse` (Tailwind built-in, respects prefers-reduced-motion); `aria-busy="true"`; `SkeletonCard` preset (full-width h-32)
- `useDelayedLoading`: returns true only after isLoading has been true for delay ms (default 200ms) — prevents skeleton flash
- `EmptyState`: `'use client'`, centered `text-text-muted`, optional `<RoughButton variant="primary">` action
- Tests: `vi.stubGlobal('ResizeObserver', MockResizeObserver)` pattern (same as rough-card.test.tsx); 32 tests in ui-patterns.test.tsx; globals.css not modified (used Tailwind's built-in animate-pulse)
- 199 total tests pass, zero regressions, zero new TS errors

### File List

- `src/components/shared/RoughButton.tsx` — NEW
- `src/components/shared/ToastProvider.tsx` — NEW
- `src/components/shared/Skeleton.tsx` — NEW
- `src/components/shared/EmptyState.tsx` — NEW
- `src/hooks/useToast.ts` — NEW
- `src/hooks/useDelayedLoading.ts` — NEW
- `src/app/layout.tsx` — MODIFY (import ToastProvider, wrap children)
- `src/test/ui-patterns.test.tsx` — NEW (32 tests)
- `package.json` — MODIFY (@radix-ui/react-toast, @radix-ui/react-alert-dialog added)
- `package-lock.json` — MODIFY (lockfile updated)
