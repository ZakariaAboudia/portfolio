# Story 2.5: SEO, Open Graph & Discoverability

Status: review

## Story

As a visitor sharing the portfolio or arriving from a search engine,
I want all public pages to be discoverable and to render rich social previews,
so that links shared on LinkedIn or Slack show a compelling preview card.

## Acceptance Criteria

1. **Given** any public portfolio page
   **When** a search engine crawler accesses it
   **Then** the page is accessible and included in `src/app/sitemap.ts` output
   **And** the `<html>` head contains `<title>`, `<meta name="description">`, and canonical URL

2. **Given** any public portfolio URL shared on LinkedIn, Slack, or Twitter/X
   **When** the platform fetches the URL for link preview
   **Then** `og:title`, `og:description`, `og:image` (pointing to `public/og-image.png`), and `og:url` are present

3. **Given** any `/admin/*` route
   **When** a search engine crawler or OG scraper accesses it
   **Then** the route is excluded from indexing via `robots.txt` (already done) and a `noindex` meta tag on the admin layout
   **And** the sitemap does not include any admin paths

4. **Given** the portfolio sidebar
   **When** a visitor looks for the source code
   **Then** a link to the public GitHub repository is visible and functional (uses `NEXT_PUBLIC_GITHUB_URL` env var)

## Tasks / Subtasks

- [x] Task 1: Create `public/og-image.png` placeholder (AC: #2)
  - [x] Write minimal valid PNG binary to `public/og-image.png` (1200×630 placeholder, dark bg)
  - [x] Note: replace with real designed image before launch; file must exist for OG tag to resolve

- [x] Task 2: Update root `layout.tsx` — full SEO metadata (AC: #1, #2)
  - [x] Add `metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')` to `generateMetadata()`
  - [x] Add `openGraph` object: `{ title, description, url, images: ['/og-image.png'], type: 'website' }`
  - [x] Add `twitter` object: `{ card: 'summary_large_image', title, description, images: ['/og-image.png'] }`
  - [x] Add `alternates: { canonical: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000' }` for root

- [x] Task 3: Create `src/app/sitemap.ts` (AC: #1, #3)
  - [x] Export default `sitemap()` function returning `MetadataRoute.Sitemap`
  - [x] Include all public pages: `/`, `/projects`, `/experience`, `/skills`, `/map`, `/contact`
  - [x] Use `NEXT_PUBLIC_BASE_URL` env var as base URL, fallback `'http://localhost:3000'`
  - [x] Set `changeFrequency: 'weekly'` and `priority` per page (home: 1.0, others: 0.8)
  - [x] Do NOT include any `/admin/*` paths

- [x] Task 4: Create `src/app/admin/layout.tsx` — noindex (AC: #3)
  - [x] Export `metadata: Metadata` with `robots: { index: false, follow: false }`
  - [x] Pass through `children` — no visual change to admin UI
  - [x] Keep as Server Component (no `'use client'`)

- [x] Task 5: Add GitHub link to `AdminNavSidebar.tsx` (AC: #4)
  - [x] Add `NEXT_PUBLIC_GITHUB_URL` to translations as `nav.githubRepo` label
  - [x] Add `nav.githubAriaLabel` translation key: "View source on GitHub"
  - [x] Render GitHub link at the bottom of the desktop sidebar (below Admin nav item, above bottom edge)
  - [x] Only render if `process.env.NEXT_PUBLIC_GITHUB_URL` is set (falsy guard)
  - [x] External link (`target="_blank" rel="noopener noreferrer"`)
  - [x] Use a simple GitHub SVG icon (inline, `aria-hidden="true"`)
  - [x] Min 44×44px touch target

- [x] Task 6: Add `NEXT_PUBLIC_GITHUB_URL` to `.env.example` (AC: #4)
  - [x] Add line: `NEXT_PUBLIC_GITHUB_URL="https://github.com/yourusername/portfolio"`

- [x] Task 7: Update `src/i18n/messages/en.json` (AC: #4)
  - [x] Add `nav.githubRepo: "GitHub"` and `nav.githubAriaLabel: "View source on GitHub"`

- [x] Task 8: Tests (AC: #1–#4)
  - [ ] `src/test/seo.test.ts` — new file covering:
    - `public/og-image.png` exists
    - `src/app/sitemap.ts` exists and exports a function
    - sitemap output includes `/`, `/projects`, `/experience`, `/skills`, `/map`, `/contact`
    - sitemap output does NOT include any path starting with `/admin`
    - `src/app/admin/layout.tsx` exists and contains `robots` with `index: false`
    - `src/app/layout.tsx` contains `metadataBase`, `openGraph`, `twitter` metadata
    - `AdminNavSidebar.tsx` source contains `NEXT_PUBLIC_GITHUB_URL` reference and `githubAriaLabel`

## Dev Notes

### No `(public)` Route Group Yet

Architecture shows `src/app/(public)/sitemap.ts` — but the current app has no `(public)` route group (pages are at root level: `src/app/page.tsx`). Place sitemap at **`src/app/sitemap.ts`** (root). Next.js resolves `sitemap.ts` at root automatically. Creating `(public)/` route group is deferred to later epics when actual content pages are built.

### `generateMetadata()` Pattern

`layout.tsx` already has `generateMetadata()` from Story 2.4 with `title` and `description`. Extend it:

```ts
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    alternates: { canonical: baseUrl },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: baseUrl,
      images: ['/og-image.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },
  }
}
```

### Admin Layout — noindex Only

`src/app/admin/layout.tsx` is purely for `noindex` metadata. It must NOT replicate the root shell (sidebar, topbar) — those already come from root `layout.tsx`. Just:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

### Sitemap Implementation

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const pages = ['', '/projects', '/experience', '/skills', '/map', '/contact']
  return pages.map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }))
}
```

### GitHub Link in Sidebar

`AdminNavSidebar.tsx` is `'use client'` — reads `NEXT_PUBLIC_GITHUB_URL` from `process.env` (safe for client since it's `NEXT_PUBLIC_`). Render only if the env var is set:

```tsx
const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL
// ...in JSX, inside the desktop sidebar:
{githubUrl && (
  <a
    href={githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={t('githubAriaLabel')}
    title={t('githubAriaLabel')}
    className="..."
  >
    <IconGitHub />
    <span className="hidden lg:block">{t('githubRepo')}</span>
  </a>
)}
```

Place this in the desktop sidebar ONLY (not mobile bottom nav — too cluttered). Put it between the separator and the bottom edge, after the Admin nav item.

### OG Image Placeholder

Create a minimal valid PNG at `public/og-image.png`. Use Node.js to write a 1×1 dark pixel PNG binary — it's a valid placeholder that confirms the file path resolves. Replace before production with a real 1200×630 design image.

```
Minimal 1×1 dark PNG bytes (base64):
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVQI12NgAAIABQAABjkB6wAAAABJRU5ErkJggg==
```

### Naming Conventions

- `sitemap.ts` — kebab-case filename ✓ (Next.js convention)
- `admin/layout.tsx` — Next.js convention ✓
- `NEXT_PUBLIC_GITHUB_URL` — env var for client-accessible value ✓

### Story 2.4 Learnings Applied

- New translations added to `en.json` under `nav` namespace (same as 2.4 pattern)
- `AdminNavSidebar` already uses `useTranslations('nav')` — just add new keys
- No render-test changes needed for GitHub link (source-level check sufficient)

### File Locations

```
public/og-image.png                    — NEW (placeholder)
src/app/sitemap.ts                     — NEW
src/app/admin/layout.tsx               — NEW
src/app/layout.tsx                     — MODIFY (metadataBase + OG + twitter)
src/components/shared/AdminNavSidebar.tsx — MODIFY (GitHub link)
src/i18n/messages/en.json              — MODIFY (nav.githubRepo, nav.githubAriaLabel)
.env.example                           — MODIFY (NEXT_PUBLIC_GITHUB_URL)
src/test/seo.test.ts                   — NEW
```

### References

- [Source: epics.md#Story 2.5]
- [Source: architecture.md — FR35–38, sitemap.ts location, robots.txt, og-image.png]
- [Source: epics.md#NFR1, NFR2 — Lighthouse ≥90, SEO category]
- [Source: .env.example — NEXT_PUBLIC_BASE_URL pattern]
- [Source: implementation-artifacts/2-4 — next-intl pattern, en.json structure, renderWithIntl test helper]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- `public/og-image.png` — minimal valid 1×1 dark PNG placeholder (67 bytes); replace with 1200×630 design before launch
- sitemap at `src/app/sitemap.ts` (root, not `(public)/`) — no route group restructure needed at this stage
- Admin layout is passthrough (`<>{children}</>`) — no visual change, purely for `robots: { index: false }` metadata
- GitHub link in desktop sidebar only (not mobile bottom nav); conditionally rendered via `process.env.NEXT_PUBLIC_GITHUB_URL` falsy guard
- `layout.tsx` `generateMetadata()` extended: `metadataBase`, `openGraph`, `twitter`, `alternates.canonical` — all use `NEXT_PUBLIC_BASE_URL` with localhost fallback
- 167 tests pass (21 new in seo.test.ts), zero new TS errors

### File List

- `public/og-image.png` — NEW (minimal PNG placeholder)
- `src/app/sitemap.ts` — NEW (dynamic sitemap, 6 public pages)
- `src/app/admin/layout.tsx` — NEW (noindex metadata passthrough)
- `src/app/layout.tsx` — MODIFY (metadataBase, openGraph, twitter, alternates)
- `src/components/shared/AdminNavSidebar.tsx` — MODIFY (IconGitHub, GitHub link in desktop sidebar)
- `src/i18n/messages/en.json` — MODIFY (nav.githubRepo, nav.githubAriaLabel)
- `.env.example` — MODIFY (NEXT_PUBLIC_GITHUB_URL)
- `src/test/seo.test.ts` — NEW (21 tests)
