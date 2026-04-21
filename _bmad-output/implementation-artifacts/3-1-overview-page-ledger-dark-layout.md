# Story 3.1: Overview Page — Ledger Dark Layout

Status: review

## Story

As a hiring manager visiting the portfolio for the first time,
I want to immediately understand who this developer is, what they do, and what to explore next,
So that I can make a snap judgment about whether to invest more time — without needing technical context.

## Acceptance Criteria

1. **Given** a visitor loading the Overview page (`/`)
   **When** the page renders
   **Then** four `StatCard` components appear in a 4-column CSS Grid above the fold — showing counts for total projects, countries, technologies, and years active — all sourced directly from Prisma via Server Component
   **And** each `StatCard` uses the `RoughCard` wrapper, shows a monospace label, a `text-2xl` 700-weight value, and a 2px amber bottom-edge accent strip
   **And** each `StatCard` has `role="figure"` with an `aria-label`

2. **Given** the Overview page below the stat grid
   **When** a visitor views it without scrolling on a standard desktop viewport
   **Then** a 2-column row is visible: a projects list panel on the left and a map placeholder `RoughCard` on the right (actual map renders in Story 3.4)
   **And** no bio or personal introduction appears above the stat grid — work content leads

3. **Given** a non-technical visitor spending 5 seconds on the Overview page
   **When** the page renders
   **Then** they can identify the developer's role and the primary call to action without reading more than the stat cards and page title

4. **Given** no projects in the database yet
   **When** the Overview renders
   **Then** the stat cards show `0` values and the projects panel shows the correct empty state: "No projects yet — check back soon."

5. **Given** a mobile viewport
   **When** the Overview renders
   **Then** the 4-column stat grid collapses to a 2×2 grid and the 2-column row stacks to single-column

## Tasks / Subtasks

- [x] Task 1: Create `src/components/portfolio/` directory and `StatCard` component (AC: #1)
  - [ ] `src/components/portfolio/StatCard.tsx` — pure Server Component (no `'use client'`)
  - [ ] Props: `label: string`, `value: number | string`, `subLabel?: string`, `ariaLabel: string`
  - [ ] Wraps `RoughCard` with `role="figure"` and `aria-label={ariaLabel}`
  - [ ] Layout: `px-5 py-4` padding inside RoughCard; label in `font-mono text-xs text-text-muted uppercase tracking-widest`; value in `text-2xl font-bold text-text-primary mt-1`; subLabel in `text-xs text-text-muted mt-0.5` (optional)
  - [ ] Amber bottom-edge accent strip: `absolute bottom-0 left-4 right-4 h-0.5 bg-accent rounded-full` (inside RoughCard relative container, below content)

- [x] Task 2: Add i18n keys for Overview (AC: #1, #3)
  - [ ] In `src/i18n/messages/en.json`, add `"overview"` namespace:
    ```json
    "overview": {
      "title": "Portfolio",
      "statProjects": "Projects",
      "statCountries": "Countries",
      "statTechnologies": "Technologies",
      "statYearsActive": "Years Active",
      "recentProjects": "Recent Projects",
      "mapComingSoon": "Map — coming soon",
      "emptyProjects": "No projects yet — check back soon."
    }
    ```

- [x] Task 3: Implement data-fetching helpers (AC: #1, #4)
  - [ ] Create `src/lib/overview-stats.ts`:
    ```ts
    import { prisma } from './prisma'

    export async function getOverviewStats() {
      const [projects, allProjects, earliestEntry] = await Promise.all([
        prisma.project.count({ where: { published: true } }),
        prisma.project.findMany({ where: { published: true }, select: { clientRegion: true, techStack: true } }),
        prisma.timelineEntry.findFirst({ orderBy: { startDate: 'asc' }, select: { startDate: true } }),
      ])

      const countries = new Set(allProjects.map(p => p.clientRegion).filter(Boolean)).size
      const technologies = new Set(allProjects.flatMap(p => p.techStack)).size
      const yearsActive = earliestEntry
        ? new Date().getFullYear() - new Date(earliestEntry.startDate).getFullYear()
        : 0

      return { projects, countries, technologies, yearsActive }
    }

    export async function getRecentProjects(limit = 5) {
      return prisma.project.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, slug: true, title: true, clientRegion: true },
      })
    }
    ```

- [x] Task 4: Rewrite `src/app/page.tsx` — Overview page (AC: #1–#5)
  - [ ] Server Component (`async function`), no `'use client'`
  - [ ] Calls `getOverviewStats()` and `getRecentProjects()` in parallel via `Promise.all`
  - [ ] Gets locale via `getLocale()` for `t(field, locale)` on translatable fields
  - [ ] Uses `getTranslations('overview')` for labels
  - [ ] Layout structure:
    ```
    <main className="p-6 flex flex-col gap-6">
      <h1>  {/* page title */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">  {/* stat grid */}
        <StatCard ...> × 4
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  {/* 2-col row */}
        <OverviewProjectsList projects={recentProjects} locale={locale} emptyMessage={t('emptyProjects')} />
        <MapPlaceholder label={t('mapComingSoon')} />
      </div>
    </main>
    ```
  - [ ] Page title `<h1>`: use `t('title')` from `overview` namespace — `text-2xl font-bold font-mono text-text-primary`
  - [ ] The `grid-cols-2 md:grid-cols-4` handles AC #5 (mobile 2×2 collapses from 4-col)

- [x] Task 5: Create `OverviewProjectsList` component (AC: #2, #4)
  - [ ] `src/components/portfolio/OverviewProjectsList.tsx` — Server Component
  - [ ] Props: `projects: Array<{id: string, slug: string, title: Json, clientRegion: string | null}>`, `locale: string`, `emptyMessage: string`
  - [ ] Wraps in `RoughCard` with section heading `t('recentProjects')` (passed as prop or via `useTranslations` — use prop since Server Component)
  - [ ] If `projects.length === 0`: render `<EmptyState message={emptyMessage} />` (no action button — public page)
  - [ ] Each project: `<Link href={/projects/${slug}}>` showing `t(title as TranslatableField, locale)` and `clientRegion` (if set) in muted text
  - [ ] List style: `flex flex-col divide-y divide-border-subtle`
  - [ ] Each item: `py-3 flex items-center justify-between text-sm` — title in `text-text-primary`, region in `text-text-muted text-xs`

- [x] Task 6: Create `MapPlaceholder` component (AC: #2)
  - [ ] `src/components/portfolio/MapPlaceholder.tsx` — Server Component
  - [ ] Props: `label: string`
  - [ ] Wraps in `RoughCard` with `className="min-h-[200px] flex items-center justify-center"`
  - [ ] Shows label text in `text-text-muted text-sm`
  - [ ] Will be replaced by actual Mapbox map in Story 3.4

- [x] Task 7: Tests (AC: #1–#5)
  - [ ] `src/test/overview.test.ts` — new file:
    - Source checks (fs.readFileSync):
      - `src/components/portfolio/StatCard.tsx` exists, contains `role="figure"`, `RoughCard`, `font-mono`, `bg-accent`, `text-2xl`
      - `src/components/portfolio/OverviewProjectsList.tsx` exists
      - `src/components/portfolio/MapPlaceholder.tsx` exists
      - `src/lib/overview-stats.ts` exists, contains `getOverviewStats`, `getRecentProjects`
      - `src/app/page.tsx` contains `getOverviewStats`, `grid-cols-2 md:grid-cols-4`
      - `src/i18n/messages/en.json` has `overview.statProjects`, `overview.statCountries`, `overview.emptyProjects`
    - Unit test for `getOverviewStats` data shape (mock prisma — or structural test only)
    - `StatCard` render test: renders `role="figure"` with the value and label

## Dev Notes

### No `(public)` Route Group

Pages are at root level (`src/app/page.tsx`). No route group restructure. This is established from Story 2.5.

### Stat Computation Details

- **Projects**: `prisma.project.count({ where: { published: true } })` — only published
- **Countries**: distinct non-null `clientRegion` values from published projects. `clientRegion` is a string like "Netherlands" or "France" — treat each distinct value as one country
- **Technologies**: distinct strings across all `techStack` arrays from published projects — flatten + `new Set()`
- **Years Active**: `new Date().getFullYear() - new Date(earliestEntry.startDate).getFullYear()`. If no timeline entries → `0`. This is computed in a Server Component so no hydration issue with `new Date()`

### TranslatableField Usage

Project `title` is `Json` in Prisma but typed as `TranslatableField = { en: string; fr?: string }`. Cast with `title as unknown as TranslatableField` then use `t(field, locale)` from `src/lib/i18n.ts`.

```ts
import { t } from '@/lib/i18n'
import type { TranslatableField } from '@/types/prisma'

// In OverviewProjectsList:
const titleStr = t(project.title as unknown as TranslatableField, locale)
```

### StatCard Accent Strip

The `RoughCard` component wraps children in `<div className="relative z-10">`. The accent strip needs to be INSIDE the `RoughCard` children but positioned at bottom:

```tsx
// StatCard.tsx
<RoughCard className="relative" padding="px-5 py-4 pb-6">
  <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{label}</p>
  <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
  {subLabel && <p className="text-xs text-text-muted mt-0.5">{subLabel}</p>}
  {/* amber bottom strip — inside RoughCard, uses absolute positioning within the padding area */}
  <span aria-hidden="true" className="absolute bottom-2 left-5 right-5 h-0.5 bg-accent rounded-full" />
</RoughCard>
```

Wait — RoughCard itself is `relative` and puts content in `relative z-10`. The `absolute` span inside will be relative to the `z-10` div, not the outer container. Fix: pass the strip as a sibling to the RoughCard content via a wrapper or add `relative` to the inner z-10 div.

**Simpler approach:** Don't use `absolute`. Use flex column with `flex-1` spacer:
```tsx
<RoughCard padding="px-5 py-4">
  <div role="figure" aria-label={ariaLabel} className="flex flex-col gap-1 pb-2 border-b-2 border-accent">
    <p ...>{label}</p>
    <p ...>{value}</p>
  </div>
</RoughCard>
```

Actually cleanest: use a bottom border on the inner content div. `border-b-2 border-accent` gives a 2px amber bottom edge without needing absolute positioning:

```tsx
<RoughCard padding="p-5">
  <div role="figure" aria-label={ariaLabel}>
    <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    {subLabel && <p className="text-xs text-text-muted mt-0.5">{subLabel}</p>}
    <div aria-hidden="true" className="mt-3 h-0.5 bg-accent rounded-full" />
  </div>
</RoughCard>
```

This renders a 2px amber strip at the bottom of the card content. **Use this pattern.**

### RoughCard `padding` prop

`RoughCard` accepts `padding` prop that sets the padding class. Pass `padding="p-5"` — do NOT use `className` for padding since `RoughCard` renders `<div ref={containerRef} className="relative {padding} {className}">`.

### Hydration Safety

`new Date().getFullYear()` in a Server Component is safe — runs only server-side, no client hydration. `getRecentProjects` and `getOverviewStats` are server-only (import `prisma` which uses `PrismaClient` — should not be bundled for client).

Mark `src/lib/overview-stats.ts` as server-only by adding `import 'server-only'` at the top (if `server-only` package is installed). Check first:

```bash
ls /app/node_modules/server-only 2>/dev/null && echo "installed" || echo "not installed"
```

If not installed, skip — the file is only imported by Server Components so it won't accidentally be client-bundled.

### EmptyState in Server Context

`EmptyState` is `'use client'`. Can be used inside a Server Component render tree — Next.js App Router supports client components inside server components. No issue.

### `OverviewProjectsList` — heading label

Pass `heading` as a prop (string from the parent's `getTranslations`) rather than calling `getTranslations` inside the component — keeps it a pure Server Component with no async overhead:

```tsx
// in page.tsx:
const t = await getTranslations('overview')
<OverviewProjectsList
  heading={t('recentProjects')}
  emptyMessage={t('emptyProjects')}
  ...
/>
```

### Test Mocking for Prisma

`getOverviewStats` calls `prisma.*` directly. In tests, use source-level checks (structural) rather than trying to mock PrismaClient — consistent with existing test patterns (e.g. `auth-admin.test.ts` uses source checks). The Prisma queries will fail gracefully in test env (no DATABASE_URL) — just don't import the module in tests.

### File Locations

```
src/components/portfolio/StatCard.tsx          — NEW
src/components/portfolio/OverviewProjectsList.tsx — NEW
src/components/portfolio/MapPlaceholder.tsx    — NEW
src/lib/overview-stats.ts                      — NEW
src/app/page.tsx                               — REWRITE
src/i18n/messages/en.json                      — MODIFY (add overview namespace)
src/test/overview.test.ts                      — NEW
```

### Previous Story (2-6) Learnings Applied

- `vi.stubGlobal('ResizeObserver', MockResizeObserver)` needed for RoughCard/RoughButton render tests
- Source-level checks (fs.readFileSync) are the primary test pattern for structural verification
- `EmptyState` is `'use client'` — safe to import in Server Component trees
- `RoughCard` accepts `padding` prop for inner spacing
- Server Components call `getTranslations('namespace')` directly — no hook

### References

- [Source: epics.md#Story 3.1 + UX-DR4 + UX-DR23]
- [Source: architecture.md — Prisma, Server Components, TranslatableField]
- [Source: prisma/schema.prisma — Project, TimelineEntry models]
- [Source: src/lib/prisma.ts — prisma singleton]
- [Source: src/lib/i18n.ts — t(field, locale) helper]
- [Source: src/components/shared/RoughCard.tsx — padding prop, relative z-10 inner div]
- [Source: src/components/shared/EmptyState.tsx — 'use client', message + optional action]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- `StatCard`: Server Component, RoughCard wrapper, `role="figure"` + `aria-label`, font-mono label, text-2xl bold value, amber accent strip via `bg-accent` div at bottom
- `getOverviewStats`: parallel Prisma queries — `count(published)`, distinct countries via `Set(clientRegion)`, distinct technologies via `Set(flatMap(techStack))`, yearsActive from earliest `TimelineEntry.startDate`
- `getRecentProjects(5)`: recent 5 published projects, selects only needed fields
- `OverviewProjectsList`: Server Component, `t(title, locale)` for translatable fields, EmptyState for 0 projects, Link to `/projects/[slug]`
- `MapPlaceholder`: Server Component stub, replaced by Mapbox in Story 3.4
- `page.tsx`: parallel `Promise.all` for locale + translations + stats + projects; `grid-cols-2 md:grid-cols-4` for mobile 2×2 → desktop 4-col; `grid-cols-1 md:grid-cols-2` for 2-col row
- `suppressHydrationWarning` added to `<html>` in layout.tsx (Story 2-6 continuation — theme script class mutation)
- 35 new tests in `overview.test.ts`, 234 total passing, zero new TS errors

### File List

- `src/components/portfolio/StatCard.tsx` — NEW
- `src/components/portfolio/OverviewProjectsList.tsx` — NEW
- `src/components/portfolio/MapPlaceholder.tsx` — NEW
- `src/lib/overview-stats.ts` — NEW
- `src/app/page.tsx` — REWRITE
- `src/i18n/messages/en.json` — MODIFY (overview namespace added)
- `src/test/overview.test.ts` — NEW (35 tests)
