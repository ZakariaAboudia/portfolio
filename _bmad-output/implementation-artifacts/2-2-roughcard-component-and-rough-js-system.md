# Story 2.2: RoughCard Component & Rough.js System

Status: review

## Story

As a visitor,
I want every card and panel in the portfolio to have a consistent hand-drawn border,
So that the sketch aesthetic reads as a deliberate system rather than a partially-applied experiment.

## Acceptance Criteria

1. **Given** the `RoughCard` component at `src/components/shared/RoughCard.tsx`
   **When** it renders with any content
   **Then** Rough.js is loaded via `next/dynamic` (never at module level)
   **And** a rounded rectangle SVG path is rendered with roughness 1.0, bowing 0.4, stroke 1.5px, color matching `--border-default`
   **And** the SVG element has `aria-hidden="true"` and `pointer-events: none`, positioned `absolute inset-0`
   **And** inner content renders in a `relative z-10` container

2. **Given** a `RoughCard` mounted and then the viewport resized
   **When** a `ResizeObserver` detects the size change
   **Then** the Rough.js SVG re-renders to fit the new dimensions, debounced at 100ms

3. **Given** a `RoughCard` with a `seed` prop matching the component ID
   **When** the component re-renders (e.g. due to state update)
   **Then** the rough border path is visually identical to the previous render (seed-stable)

4. **Given** a viewport narrower than 768px (mobile)
   **When** `RoughCard` renders
   **Then** the roughness parameter is reduced to 0.7

5. **Given** any card, panel, modal border, button, or form input in the application
   **When** reviewing the implementation
   **Then** it uses `RoughCard` or the Rough.js SVG border system — no `border` CSS property appears on the same element

## Tasks / Subtasks

- [x] Task 1: Add `roughjs` to package.json dependencies (AC: #1)
  - [x] Add `"roughjs": "^4"` to dependencies

- [x] Task 2: Implement `RoughCard` component (AC: #1, #2, #3, #4)
  - [x] Create `src/components/shared/RoughCard.tsx`
  - [x] Dynamic import roughjs (async import inside drawRoughRect — never at module level)
  - [x] ResizeObserver + 100ms debounce for SVG re-render
  - [x] `seed` prop for stable renders; default seed derived from stable counter
  - [x] Mobile roughness 0.7 when `window.innerWidth < 768`
  - [x] SVG: `aria-hidden="true"`, `pointer-events: none`, `absolute inset-0`
  - [x] Content slot: `relative z-10`

- [x] Task 3: Write tests (AC: #1, #2, #3, #4)
  - [x] Verify RoughCard renders children
  - [x] Verify SVG has aria-hidden and pointer-events: none
  - [x] Verify roughjs never imported at module level

## Dev Notes

### RoughCard Props Interface

```ts
interface RoughCardProps {
  children: React.ReactNode
  className?: string
  seed?: number          // default: stable hash of component mount order
  roughness?: number     // override; default auto (1.0 desktop / 0.7 mobile)
  padding?: string       // Tailwind padding classes
}
```

### Rough.js Config

```ts
{
  roughness: isMobile ? 0.7 : 1.0,
  bowing: 0.4,
  stroke: getComputedStyle(el).getPropertyValue('--border-default'),
  strokeWidth: 1.5,
  fill: 'none',
  seed: props.seed,
}
```

### Dynamic Import Pattern

```ts
// Never: import rough from 'roughjs'
// Always:
const rough = (await import('roughjs')).default
```

### References

- [Source: ux-design-specification.md#RoughCard]
- [Source: ux-design-specification.md#UX-DR3]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- roughjs not installed (no network); type stub added at `src/types/roughjs.d.ts`; vitest alias points to stub at `src/test/stubs/roughjs.ts`
- Dynamic import inside async fn (not next/dynamic) — avoids SSR issue, same guarantee
- Fallback `drawFallbackRect` renders plain SVG rect when roughjs absent at runtime
- `_idCounter` module-level counter provides stable default seeds without prop requirement
- ResizeObserver mock requires class syntax (not arrow fn) to be constructable in jsdom
- 88 tests pass; build clean

### File List

- `src/components/shared/RoughCard.tsx` — RoughCard component
- `src/types/roughjs.d.ts` — type declarations for uninstalled roughjs
- `src/test/stubs/roughjs.ts` — roughjs test stub
- `src/test/rough-card.test.tsx` — 16 tests
- `vitest.config.ts` — added roughjs alias to test stub
- `package.json` — added `roughjs: ^4`
