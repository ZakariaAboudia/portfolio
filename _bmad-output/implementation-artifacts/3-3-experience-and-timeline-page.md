# Story 3.3: Experience & Timeline Page

Status: review

## Story

As a hiring manager reviewing the developer's background,
I want to see a clear chronological work history,
So that I can understand their professional arc and depth of experience.

## Acceptance Criteria

1. **Given** the Experience page (`/experience`)
   **When** a visitor loads it
   **Then** all timeline entries are displayed in reverse-chronological order, each showing: role/title, organisation, date range, and description
   **And** data is fetched via Server Component querying `TimelineEntry` from Prisma directly

2. **Given** timeline entries with translatable `Json` fields
   **When** the page renders
   **Then** the `t(field, locale)` helper extracts the active locale's content, falling back to English

3. **Given** no timeline entries in the database
   **When** the page renders
   **Then** a graceful empty state is shown — not a blank panel

## Tasks / Subtasks

- [x] Task 1: Add i18n keys for Experience (AC: #1, #3)
  - [ ] In `src/i18n/messages/en.json`, add `"experience"` namespace:
    ```json
    "experience": {
      "title": "Experience",
      "empty": "No experience entries yet.",
      "present": "Present"
    }
    ```

- [x] Task 2: Create `TimelineEntryCard` component (AC: #1, #2)
  - [ ] `src/components/portfolio/TimelineEntryCard.tsx` — Server Component
  - [ ] Props: `entry: { id, title, description, organization, startDate, endDate, type }`, `locale: string`, `presentLabel: string`
  - [ ] Title: `t(entry.title as unknown as TranslatableField, locale)` — `text-base font-semibold text-text-primary`
  - [ ] Organization: `entry.organization` — `text-sm text-accent font-medium`
  - [ ] Date range: `formatDateRange(entry.startDate, entry.endDate, presentLabel)` — `text-xs text-text-muted font-mono`
  - [ ] Description: `t(entry.description as unknown as TranslatableField, locale)` — `text-sm text-text-secondary mt-2 leading-relaxed`
  - [ ] Type badge: `entry.type` — `text-xs font-mono bg-bg-elevated text-text-muted px-2 py-0.5 rounded capitalize`
  - [ ] Layout: vertical timeline with left border accent line
    ```
    <div className="relative pl-6 border-l border-border-subtle">
      <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-bg-base" />
      {/* content */}
    </div>
    ```
  - [ ] `formatDateRange` helper (same file or `src/lib/format-date.ts`):
    - Input: `startDate: Date`, `endDate: Date | null`, `presentLabel: string`
    - Output: `"Jan 2020 – Mar 2023"` or `"Jan 2020 – Present"`
    - Format: `Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })`

- [x] Task 3: Create Experience page (AC: #1–#3)
  - [ ] `src/app/experience/page.tsx` — async Server Component
  - [ ] Query: `prisma.timelineEntry.findMany({ orderBy: { startDate: 'desc' } })` — reverse-chron
  - [ ] Parallel: `Promise.all([getLocale(), getTranslations('experience'), prisma.timelineEntry.findMany(...)])`
  - [ ] Layout: `<main className="p-6 flex flex-col gap-6">`
  - [ ] Heading: `<h1 className="text-2xl font-bold font-mono text-text-primary">{t('title')}</h1>`
  - [ ] If empty: `<EmptyState message={t('empty')} />`
  - [ ] Timeline: `<div className="flex flex-col gap-6">` with `<TimelineEntryCard>` per entry

- [x] Task 4: Tests (AC: #1–#3)
  - [ ] `src/test/experience.test.ts` — new file:
    - Source checks (fs.readFileSync):
      - `TimelineEntryCard.tsx` exists, contains `border-l border-border-subtle`, `bg-accent`, `t(`, `TranslatableField`, `formatDateRange` or `Intl.DateTimeFormat`
      - `experience/page.tsx` exists, contains `orderBy: { startDate: 'desc' }`, `getLocale`, `EmptyState`
      - `en.json` has `experience.title`, `experience.empty`, `experience.present`
    - Unit test `formatDateRange`:
      - With endDate null → includes "Present"
      - With both dates → formats month + year range
      - Import the helper directly

## Dev Notes

### TimelineEntry Schema

```prisma
model TimelineEntry {
  id           String    @id
  title        Json      // TranslatableField
  description  Json      // TranslatableField
  organization String
  startDate    DateTime
  endDate      DateTime? // null = still active / "Present"
  type         String    // "work" | "education" | "project"
}
```

### Date Formatting

Use `Intl.DateTimeFormat` — no external date library needed:

```ts
function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

export function formatDateRange(start: Date, end: Date | null, presentLabel: string): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : presentLabel}`
}
```

Export from `src/lib/format-date.ts` so it's testable without importing React.

### Timeline Visual

Vertical left-border timeline — consistent warm dark aesthetic:
- Border: `border-l border-border-subtle` on each entry's wrapper
- Dot: `absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-bg-base`
- The `border-bg-base` on the dot creates a "ring" effect isolating the dot from the border line
- No RoughCard wrapper per entry (timeline entries are lighter, not card-heavy like projects)

### Hydration Safety

`new Date()` / `Intl.DateTimeFormat` runs in Server Component — safe, no client execution.

### File Locations

```
src/components/portfolio/TimelineEntryCard.tsx  — NEW
src/lib/format-date.ts                          — NEW
src/app/experience/page.tsx                     — NEW
src/i18n/messages/en.json                       — MODIFY (experience namespace)
src/test/experience.test.ts                     — NEW
```

### Established Patterns (from 3-1, 3-2)

- Parallel `Promise.all([getLocale(), getTranslations('ns'), prisma.query()])` at top of page
- `t(field as unknown as TranslatableField, locale)` for Json fields
- `EmptyState` (no action prop) for public empty states
- `text-2xl font-bold font-mono text-text-primary` for page headings
- Source-level tests primary; avoid mocking PrismaClient

### References

- [Source: epics.md#Story 3.3]
- [Source: prisma/schema.prisma — TimelineEntry model]
- [Source: src/lib/i18n.ts — t() helper]
- [Source: src/types/prisma.ts — TranslatableField]
- [Source: src/components/shared/EmptyState.tsx]
- [Source: src/app/projects/page.tsx — page pattern]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- `format-date.ts`: pure `Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })`, en-dash separator, `presentLabel` param
- `TimelineEntryCard`: left border + amber dot timeline visual, `t()` for title/description, `formatDateRange`, type badge, organization in accent color
- `experience/page.tsx`: `orderBy: { startDate: 'desc' }`, parallel Promise.all, EmptyState fallback
- 20 new tests in `experience.test.ts` including `formatDateRange` unit tests, 288 total passing, zero new TS errors

### File List

- `src/lib/format-date.ts` — NEW
- `src/components/portfolio/TimelineEntryCard.tsx` — NEW
- `src/app/experience/page.tsx` — NEW
- `src/i18n/messages/en.json` — MODIFY (experience namespace)
- `src/test/experience.test.ts` — NEW (20 tests)
