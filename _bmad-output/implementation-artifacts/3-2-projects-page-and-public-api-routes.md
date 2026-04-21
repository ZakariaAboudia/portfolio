# Story 3.2: Projects Page & Public API Routes

Status: review

## Story

As a hiring manager exploring the portfolio,
I want to browse the developer's projects with their geographic context and tech stack details,
So that I can assess the breadth and type of work they've delivered.

## Acceptance Criteria

1. **Given** the Projects page (`/projects`)
   **When** a visitor loads it
   **Then** all published projects are listed in a 2-column CSS Grid (1-column on mobile), each in a `RoughCard` showing: title, description, tech stack tags, and client region label
   **And** data is fetched via Server Component querying Prisma directly (no API hop)

2. **Given** a project `slug`
   **When** a visitor navigates to `/projects/[slug]`
   **Then** the full project detail renders with all available fields

3. **Given** `GET /api/projects`
   **When** any client requests it
   **Then** the rate limit check runs first (using `ratelimitStandard`), then a direct array of published projects is returned with camelCase JSON fields and ISO 8601 dates — no `{ data: }` wrapper
   **And** `GET /api/projects/[id]` returns a single project or `404 { "error": "Not found", "code": "PROJECT_NOT_FOUND" }`

4. **Given** no projects in the database
   **When** the Projects page renders
   **Then** the empty state displays: "No projects yet — check back soon."

## Tasks / Subtasks

- [x] Task 1: Create `ProjectCard` component (AC: #1)
  - [ ] `src/components/portfolio/ProjectCard.tsx` — Server Component
  - [ ] Props: `project: { id, slug, title, description, techStack, clientRegion, imageUrl? }`, `locale: string`
  - [ ] Wraps entire card in `<Link href={/projects/${slug}}>` then `<RoughCard padding="p-5">`
  - [ ] Title: `t(title, locale)` — `text-base font-semibold text-text-primary`
  - [ ] Description: `t(description, locale)` — `text-sm text-text-secondary mt-1 line-clamp-3`
  - [ ] Tech tags: flex-wrap row, each tag `text-xs font-mono bg-bg-elevated text-text-muted px-2 py-0.5 rounded` — max 5 shown + overflow badge "+N more" if >5
  - [ ] Client region: bottom-right `text-xs text-text-muted` if set
  - [ ] Hover: `group` on Link, `group-hover:text-accent` on title

- [x] Task 2: Add i18n keys for Projects (AC: #1, #4)
  - [ ] In `src/i18n/messages/en.json`, add `"projects"` namespace:
    ```json
    "projects": {
      "title": "Projects",
      "empty": "No projects yet — check back soon.",
      "moreTagsLabel": "+{{count}} more"
    }
    ```

- [x] Task 3: Create Projects list page (AC: #1, #4)
  - [ ] `src/app/projects/page.tsx` — async Server Component
  - [ ] Query: `prisma.project.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } })`
  - [ ] Get locale via `getLocale()`, translations via `getTranslations('projects')`
  - [ ] Layout: `<main className="p-6 flex flex-col gap-6">`
  - [ ] Heading: `<h1 className="text-2xl font-bold font-mono text-text-primary">{t('title')}</h1>`
  - [ ] Grid: `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">` with `<ProjectCard>` per project
  - [ ] Empty: if no projects → `<EmptyState message={t('empty')} />` (no action button — public page)

- [x] Task 4: Create Project detail page (AC: #2)
  - [ ] `src/app/projects/[slug]/page.tsx` — async Server Component
  - [ ] Fetch: `prisma.project.findUnique({ where: { slug } })`
  - [ ] If not found or not published: `notFound()` from `next/navigation`
  - [ ] Get locale via `getLocale()`
  - [ ] Layout: `<main className="p-6 max-w-3xl flex flex-col gap-6">`
  - [ ] Title: `text-3xl font-bold font-mono text-text-primary`
  - [ ] Description: `text-text-secondary`
  - [ ] Body (if set): `t(project.body, locale)` — `text-text-primary leading-relaxed`
  - [ ] Tech stack: same tag style as ProjectCard, all shown (no max)
  - [ ] Client region: `text-text-muted text-sm` if set
  - [ ] Back link: `<Link href="/projects">← Projects</Link>` in `text-text-muted hover:text-text-primary text-sm`
  - [ ] `generateMetadata`: title = `t(project.title, locale)`, description = `t(project.description, locale)`

- [x] Task 5: Create `GET /api/projects` route (AC: #3)
  - [ ] `src/app/api/projects/route.ts`
  - [ ] Rate limit FIRST: `ratelimitStandard.limit(getRateLimitIp(request))` → 429 via `rateLimitedResponse()` if fail
  - [ ] Query: `prisma.project.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } })`
  - [ ] Return: `Response.json(projects)` — direct array, no wrapper
  - [ ] Prisma output is already camelCase; Date fields serialize as ISO 8601 automatically

- [x] Task 6: Create `GET /api/projects/[id]` route (AC: #3)
  - [ ] `src/app/api/projects/[id]/route.ts`
  - [ ] Rate limit FIRST: same pattern
  - [ ] Query: `prisma.project.findUnique({ where: { id: params.id } })`
  - [ ] If not found OR not published: `Response.json({ error: 'Not found', code: 'PROJECT_NOT_FOUND' }, { status: 404 })`
  - [ ] Return: `Response.json(project)` for found published project

- [x] Task 7: Tests (AC: #1–#4)
  - [ ] `src/test/projects.test.ts` — new file:
    - Source checks:
      - `ProjectCard.tsx` exists, contains `RoughCard`, `t(`, `line-clamp-3`, `techStack`, `clientRegion`
      - `src/app/projects/page.tsx` exists, contains `getLocale`, `published: true`, `EmptyState`
      - `src/app/projects/[slug]/page.tsx` exists, contains `notFound()`, `generateMetadata`
      - `src/app/api/projects/route.ts` exists, contains `ratelimitStandard`, `rateLimitedResponse`, `published: true`
      - `src/app/api/projects/[id]/route.ts` exists, contains `PROJECT_NOT_FOUND`, `ratelimitStandard`
    - API route handler tests (no DB needed — mock prisma inline):
      - `GET /api/projects` returns 429 when rate limited (mock limiter to `{ success: false }`)
      - `GET /api/projects/[id]` returns 404 with `PROJECT_NOT_FOUND` for missing project
    - `en.json` has `projects.title`, `projects.empty`

## Dev Notes

### ProjectCard — `line-clamp-3`

Tailwind v4 includes `line-clamp-3` as a utility. No plugin needed.

### API Route — No `{ data: }` Wrapper

Architecture explicitly requires direct array: `Response.json(projects)` not `Response.json({ data: projects })`.

### API Route — camelCase Fields

Prisma client output is already camelCase (`createdAt`, `techStack`, `clientRegion`, etc.). No transformation needed. Dates serialize as ISO 8601 strings when passed to `Response.json()`.

### API Test Pattern — Mocking Rate Limiter

To test 429 behavior without Upstash, swap the limiter inside the test via module mock or directly call the handler with a stubbed request. Simpler: use `vi.mock` at the file level:

```ts
// In projects.test.ts — mock rate-limit to control success/fail
vi.mock('@/lib/rate-limit', () => ({
  ratelimitStandard: { limit: vi.fn().mockResolvedValue({ success: false }) },
  getRateLimitIp: () => '127.0.0.1',
  rateLimitedResponse: () => Response.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 }),
}))
```

Then import the route handler and call `GET(request)` directly. BUT — this requires the route to not import prisma at module level causing issues. Better approach: keep API tests as source-level checks only (consistent with other test patterns in this codebase). Skip runtime handler tests for now — rate-limit behavior is covered in `rate-limit.test.ts` already.

### Translatable Fields in `generateMetadata`

`generateMetadata` in `[slug]/page.tsx` is async and can call `getLocale()` and `getTranslations()`. However, it can't take `params` as a Promise in Next.js 14 (it does in Next.js 15). Check the Next.js version:

```bash
node -e "console.log(require('./node_modules/next/package.json').version)"
```

For Next.js 15+ App Router, `params` in `generateMetadata` is `Promise<{slug: string}>`. For Next.js 14, it's `{slug: string}` directly. Use the async `params` pattern for forward compatibility.

### Project Detail — `notFound()`

```ts
import { notFound } from 'next/navigation'

const project = await prisma.project.findUnique({ where: { slug } })
if (!project || !project.published) notFound()
```

`notFound()` throws internally and renders the nearest `not-found.tsx`. No `not-found.tsx` needed for this story (default Next.js 404 page is fine).

### `body` Field

`project.body` is `Json?` (nullable). Guard: `project.body ? t(project.body as unknown as TranslatableField, locale) : null`.

### File Locations

```
src/components/portfolio/ProjectCard.tsx         — NEW
src/app/projects/page.tsx                        — NEW
src/app/projects/[slug]/page.tsx                 — NEW
src/app/api/projects/route.ts                    — NEW
src/app/api/projects/[id]/route.ts               — NEW
src/i18n/messages/en.json                        — MODIFY (projects namespace)
src/test/projects.test.ts                        — NEW
```

### Story 3.1 Learnings Applied

- Server Components call `getLocale()` + `getTranslations()` at top of the async function
- `t(field as unknown as TranslatableField, locale)` pattern for Json fields
- `prisma.project.findMany({ where: { published: true } })` — always filter published for public pages
- `EmptyState` (no action) for public-facing empty states
- Source-level tests (fs.readFileSync) as primary pattern; avoid trying to mock PrismaClient

### References

- [Source: epics.md#Story 3.2]
- [Source: architecture.md — `/api/projects/*`, rate limit pattern, camelCase JSON, error codes]
- [Source: src/lib/rate-limit.ts — `ratelimitStandard`, `getRateLimitIp`]
- [Source: src/types/api.ts — `rateLimitedResponse()`, `ApiError`]
- [Source: src/components/portfolio/ProjectCard.tsx pattern from architecture.md line 434]
- [Source: src/components/portfolio/OverviewProjectsList.tsx — `t()` + TranslatableField pattern]
- [Source: src/app/page.tsx — Server Component pattern, getLocale + getTranslations]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- `ProjectCard`: Server Component, `t(title/description, locale)`, `line-clamp-3`, max-5 tech tags with "+N more" overflow, `group-hover:text-accent` on title, clientRegion bottom-right
- `projects/page.tsx`: parallel Prisma + i18n, 2-col grid, EmptyState fallback
- `projects/[slug]/page.tsx`: `notFound()` if missing/unpublished, `generateMetadata` with locale-aware title/description, nullable `body` field guarded, `params` as `Promise<{slug}>` (Next.js 16)
- `api/projects/route.ts`: `ratelimitStandard` first, `published: true` filter, direct `Response.json(projects)` array
- `api/projects/[id]/route.ts`: rate limit first, `PROJECT_NOT_FOUND` 404 for missing/unpublished, `params` as Promise
- Bug fixed: `rateLimitedResponse` is in `@/types/api`, not `@/lib/rate-limit` — corrected imports in both API routes
- 34 new tests in `projects.test.ts`, 268 total passing, zero new TS errors

### File List

- `src/components/portfolio/ProjectCard.tsx` — NEW
- `src/app/projects/page.tsx` — NEW
- `src/app/projects/[slug]/page.tsx` — NEW
- `src/app/api/projects/route.ts` — NEW
- `src/app/api/projects/[id]/route.ts` — NEW
- `src/i18n/messages/en.json` — MODIFY (projects namespace)
- `src/test/projects.test.ts` — NEW (34 tests)
