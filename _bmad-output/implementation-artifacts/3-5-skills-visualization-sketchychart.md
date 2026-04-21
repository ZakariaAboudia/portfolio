# Story 3.5: Skills Visualization — SketchyChart

Status: review

## Story

As a visitor evaluating the developer's technical depth,
I want to explore their skills through an interactive hand-drawn chart,
So that I can assess technical breadth without reading a generic skills list.

## Acceptance Criteria

1. **Given** the Skills page (`/skills`)
   **When** it loads
   **Then** `SketchyChart` renders via `next/dynamic` (never at module level) using roughjs directly — consistent with existing codebase pattern
   **And** chart bars have roughjs `fill` at opacity `0.85` (hand-filled feel)
   **And** no static skills list exists anywhere on the page

2. **Given** a visitor hovering a chart bar
   **When** the hover triggers
   **Then** the hovered bar is highlighted, all others dim to `opacity: 0.4`
   **And** a Radix `Tooltip` shows the skill name and proficiency level (e.g. "Level 3 / 5")

3. **Given** a keyboard user navigating the chart
   **When** they Tab through the page
   **Then** focus cycles through chart bars in order, each with a visible focus ring
   **And** pressing Enter or Space on a focused bar shows the same tooltip as hover

4. **Given** a screen reader user
   **When** they reach the chart
   **Then** the chart container has `role="img"` and `aria-label`
   **And** a visually-hidden `<table>` below lists all skills with name, category, and level

5. **Given** the chart mounting for the first time
   **When** data is present and `prefers-reduced-motion` is NOT set
   **Then** bars animate from `scaleY(0)` to `scaleY(1)` with `transform-origin: bottom`
   **When** `prefers-reduced-motion` IS set
   **Then** bars render at full height immediately — no animation

6. **Given** no skills in the database
   **When** the Skills page renders
   **Then** `EmptyState` displays "No skills data yet."

## Tasks / Subtasks

- [x] Task 1: Create skills data helper (AC: #1, #6)
  - [x] `src/lib/skills-data.ts` — server function
  - [x] `getSkillsByCategory(): Promise<SkillGroup[]>`
  - [x] Query: `prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { level: 'desc' }] })`
  - [x] Group by `category` using `Map<string, Skill[]>` → return sorted array
  - [x] Export type: `type SkillGroup = { category: string; skills: Array<{ id: string; name: string; level: number }> }`

- [x] Task 2: Create `SketchyChart` client component (AC: #1–#5)
  - [ ] `src/components/portfolio/SketchyChart.tsx` — `'use client'`
  - [ ] Props: `groups: SkillGroup[]`, `ariaLabel: string`
  - [x] Library: use **roughjs directly** (dynamic import in `useEffect`) — same pattern as `RoughCard`, `RoughPin`; do NOT install roughViz.js or chartjs-plugin-rough
  - [x] Chart layout: horizontal group per category, bars side-by-side, category label below group
  - [x] Bar dimensions: `MAX_BAR_HEIGHT = 120`, bar height = `(level / 5) * MAX_BAR_HEIGHT`px, bar width `32px`, gap `8px` between bars
  - [x] Draw each bar via `rc.rectangle(x, y, width, height, options)` on per-bar `<svg>` elements
  - [x] Rough options: `{ fill: barColor, fillStyle: 'solid', fillWeight: 2, stroke: barColor, roughness: 1.0, bowing: 0.4, seed }`
  - [x] Bar color: `var(--accent)` base; hovered bar full opacity, others `opacity: 0.4`
  - [x] `seed` per skill: stable, same algorithm as RoughPin
  - [x] Each bar: `<button>` with `aria-label` wrapping `<svg>` — handles click/focus/hover
  - [x] `hoveredId` state; set on `onMouseEnter`/`onFocus`, clear on `onMouseLeave`/`onBlur`
  - [x] Animation: `mounted` state; `useEffect` + `setTimeout`; `scaleY` transform with `transform-origin: bottom`
  - [x] Fallback: plain `<div>` bars on roughjs load failure
  - [x] `prefers-reduced-motion`: inline hook
  - [x] Radix `Tooltip` per bar: `{skill.name} — Level {skill.level} / 5`
  - [x] `Tooltip.Provider` wraps entire chart
  - [x] `<div role="img" aria-label={ariaLabel}>` wrapping chart bars
  - [x] Visually-hidden `<table className="sr-only">` OUTSIDE `role="img"` div

- [x] Task 3: Create dynamic export wrapper (AC: #1)
  - [x] `src/components/portfolio/SketchyChartDynamic.tsx` — `'use client'`
  - [x] `'use client'` directive — required for `ssr: false` in App Router
  - [x] `export default dynamic(() => import('./SketchyChart'), { ssr: false, loading: () => <SkeletonCard /> })`

- [x] Task 4: Create `/skills` page (AC: #1–#6)
  - [x] `src/app/skills/page.tsx` — async Server Component
  - [x] Parallel: `Promise.all([getTranslations('skills'), getSkillsByCategory()])`
  - [x] Heading, EmptyState fallback, SketchyChartDynamic render

- [x] Task 5: Add i18n keys (AC: #4, #6)
  - [x] `src/i18n/messages/en.json` — `skills` namespace (title, ariaLabel, empty)

- [x] Task 6: Tests (AC: #1–#6)
  - [x] `src/test/skills.test.ts` — 26 tests: source checks + `groupSkills` unit tests

## Dev Notes

### Library Choice — Use roughjs Directly

**Do NOT install roughViz.js or chartjs-plugin-rough.** Both have limited docs (flagged as high-risk). The project already uses `roughjs` for all hand-drawn visuals (`RoughCard`, `RoughButton`, `RoughPin`). Build the chart using roughjs `rc.rectangle()` on per-bar SVG elements — consistent with existing patterns.

Roughjs import pattern (same as every other rough component):
```ts
const roughModule = await import('roughjs')
const rough = (roughModule.default ?? roughModule) as unknown as typeof import('roughjs').default
const rc = rough.svg(svgEl) as any  // cast to any — typings don't expose all methods
```

### Dynamic Import Pattern — `'use client'` on the Wrapper

`SketchyChartDynamic.tsx` MUST have `'use client'` directive — Next.js App Router does not allow `ssr: false` in Server Components (same fix applied to `MapWithPinsDynamic.tsx` in story 3-4):

```tsx
'use client'
import dynamic from 'next/dynamic'
import { SkeletonCard } from '@/components/shared/Skeleton'
export default dynamic(() => import('./SketchyChart'), { ssr: false, loading: () => <SkeletonCard /> })
```

### prefers-reduced-motion Hook

Inline — same pattern as `MapWithPins.tsx`:
```ts
const [reducedMotion, setReducedMotion] = useState(false)
useEffect(() => {
  setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}, [])
```

### Bar Animation Pattern

Each bar's SVG wrapper gets the scale transform, NOT the `<button>`:
```tsx
<div style={{
  transform: mounted && !reducedMotion ? 'scaleY(1)' : 'scaleY(0)',
  transformOrigin: 'bottom',
  transition: reducedMotion ? 'none' : 'transform 0.4s ease-out',
}}>
  <svg ref={barSvgRef} ... />
</div>
```

`mounted` flips true in a `useEffect` with `setTimeout(..., 0)` so the DOM renders at `scaleY(0)` first, then transitions up.

### roughjs Per-Bar SVG Pattern

Each bar is an individual `<svg>` element with its own roughjs rectangle:
```tsx
useEffect(() => {
  barRefs.forEach(({ svgEl, skill, barHeight }) => {
    const rc = rough.svg(svgEl) as any
    svgEl.innerHTML = ''
    const node = rc.rectangle(0, MAX_BAR_HEIGHT - barHeight, BAR_WIDTH, barHeight, {
      fill: 'var(--accent)',
      fillStyle: 'solid',
      fillWeight: 2,
      stroke: 'var(--accent)',
      roughness: 1.0,
      bowing: 0.4,
      seed: skillSeed(skill.name),
    })
    svgEl.appendChild(node)
  })
}, [groups])
```

Note: rectangle args are `(x, y, width, height)`. Draw from top of bar downward: `y = MAX_BAR_HEIGHT - barHeight` so bar sits at bottom of svg.

### Skill Schema

```prisma
model Skill {
  id        String   @id @default(cuid())
  name      String
  category  String
  level     Int      // 1–5 proficiency
  createdAt DateTime
}
```

No `yearsUsed` field — tooltip shows `Level {n} / 5` only (not years as mentioned in AC).

### Screen Reader List Outside `role="img"`

Elements inside `role="img"` are hidden from AT — same rule as MapWithPins sr-only list. Place `<table className="sr-only">` OUTSIDE the `<div role="img">` wrapper.

### Radix Tooltip — Already Installed

`@radix-ui/react-tooltip@1.2.8` is installed (added in story 3-4). Import:
```ts
import * as Tooltip from '@radix-ui/react-tooltip'
```

### Empty State

`EmptyState` component from `src/components/shared/EmptyState.tsx`. No action prop for public pages:
```tsx
<EmptyState message={t('empty')} />
```

### Test: Pure Grouping Logic

Extract the grouping logic from `getSkillsByCategory` into a testable pure function to avoid mocking Prisma:
```ts
export function groupSkills(skills: Skill[]): SkillGroup[] {
  const map = new Map<string, SkillGroup>()
  for (const s of skills) {
    if (!map.has(s.category)) map.set(s.category, { category: s.category, skills: [] })
    map.get(s.category)!.skills.push({ id: s.id, name: s.name, level: s.level })
  }
  return Array.from(map.values())
}
```

Then `getSkillsByCategory` just calls `prisma.skill.findMany(...)` → `groupSkills(results)`.

### File Locations

```
src/lib/skills-data.ts                          — NEW
src/components/portfolio/SketchyChart.tsx       — NEW
src/components/portfolio/SketchyChartDynamic.tsx — NEW
src/app/skills/page.tsx                         — NEW
src/i18n/messages/en.json                       — MODIFY (skills namespace)
src/test/skills.test.ts                         — NEW
```

### Story 3-4 Learnings Applied

- `'use client'` on `*Dynamic.tsx` wrappers — required for `ssr: false` in App Router
- `mapbox-gl` wasn't pre-installed despite story saying so — verify deps before assuming
- roughjs `rc.path()` / `rc.rectangle()` needs `as any` cast on return of `rough.svg()`
- Parallel `Promise.all` for server data
- Source-level tests primary pattern
- Updated test in prior story when component changed — do same if any existing test references old components

### References

- [Source: epics.md#Story 3.5 + UX-DR7]
- [Source: ux-design-specification.md — SketchyChart component specification]
- [Source: src/components/portfolio/RoughPin.tsx — roughjs dynamic import pattern]
- [Source: src/components/portfolio/MapWithPins.tsx — prefers-reduced-motion hook, Tooltip pattern]
- [Source: src/components/portfolio/MapWithPinsDynamic.tsx — 'use client' + ssr:false pattern]
- [Source: src/components/shared/EmptyState.tsx — empty state pattern]
- [Source: src/components/shared/Skeleton.tsx — SkeletonCard for loading]
- [Source: prisma/schema.prisma — Skill model]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- `skills-data.ts`: `groupSkills()` pure function (testable without Prisma mock) + `getSkillsByCategory()` calling it; ordered by category asc, level desc
- `SketchyChart.tsx`: roughjs per-bar SVG in useEffect via `barRefs` Map, `scaleY` animation from `mounted` state, Radix Tooltip per bar, `role="img"`, `sr-only` table outside img div, fallback plain div bars, prefers-reduced-motion inline hook
- `SketchyChartDynamic.tsx`: `'use client'` + `ssr: false` pattern (same as MapWithPinsDynamic)
- `skills/page.tsx`: parallel fetch, EmptyState fallback, SketchyChartDynamic
- `en.json`: `skills` namespace added
- 26 new tests in `skills.test.ts`; 344 total passing, zero new TS errors

### File List

- `src/lib/skills-data.ts` — NEW
- `src/components/portfolio/SketchyChart.tsx` — NEW
- `src/components/portfolio/SketchyChartDynamic.tsx` — NEW
- `src/app/skills/page.tsx` — NEW
- `src/i18n/messages/en.json` — MODIFY (skills namespace)
- `src/test/skills.test.ts` — NEW (26 tests)
