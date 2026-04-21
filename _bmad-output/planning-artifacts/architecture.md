---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-08'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-app.md"
  - "_bmad-output/planning-artifacts/product-brief-app-distillate.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
project_name: 'app'
user_name: 'Root'
date: '2026-04-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
38 FRs across 8 categories: Public Portfolio (FR1–6), Navigation & Display (FR7–10), Data Visualization & Mapping (FR11–15), Content Management (FR16–21), Authentication & Access Control (FR22–27), Contact & Anti-Spam (FR28–31), Internationalization (FR32–34), and Discoverability & Transparency (FR35–38).

Architecturally, the FRs define three runtime contexts that must be designed explicitly:
1. **Visitor mode** — anonymous, read-only, SEO-relevant, SSR-first
2. **Guest admin mode** — unauthenticated, read-only admin access, server-enforced write blocking, sandboxed session
3. **Owner admin mode** — OAuth-authenticated, full CRUD, email-allowlisted, mobile-capable

**Non-Functional Requirements:**
- Performance: Lighthouse ≥90 all categories; LCP <2.5s, INP <200ms, CLS <0.1; TTI ≤3s on 4G mobile; Mapbox and Rough.js code-split per page
- Security: Server-side enforcement on all writes; guest tokens cryptographically distinct from admin tokens; no sensitive data in guest API responses; rate limiting on all endpoints
- Accessibility: WCAG 2.1 AA, both color modes independently verified; keyboard nav with visible focus indicators; Rough.js decorative elements aria-hidden
- Integration: Graceful fallbacks for Mapbox, Turnstile, and OAuth failures; next-intl fallback to English on missing keys; email delivery failure surfaced to user
- Reliability: 99.9% uptime; no silent admin write failures

**Scale & Complexity:**

- Primary domain: Full-stack web app (Next.js SSR + headless CMS)
- Complexity level: Medium (elevated in three specific areas: guest session security architecture, i18n structural integration, Rough.js aesthetic system)
- Estimated architectural components: ~8 major boundaries

### Technical Constraints & Dependencies

- **Next.js App Router** — hybrid SSR for public pages, client-side navigation within dashboard shell; no real-time features in scope
- **BetterAuth + OAuth** — single admin email allowlist enforced server-side; OAuth tokens never exposed to client; httpOnly cookies only
- **next-intl** — all strings externalized from component one; i18n must not add friction to admin content management
- **Rough.js** — applied as a design system (consistent SVG borders on all panels/cards); lazy loaded only on pages that use it; decorative elements aria-hidden
- **Mapbox GL JS** — lazy loaded per page; graceful fallback if init fails
- **Cloudflare Turnstile** — graceful degradation if script fails to load; honeypot enforced at API layer independently
- **Database TBD** — admin-driven content model with immediate public reflection; translatable content fields per entry
- **Solo developer, ~56 hours** — no overengineering; stack choices must minimize configuration overhead
- **Deployment target TBD** — Dockerfile exists in repo; may be Vercel or self-hosted

### Cross-Cutting Concerns Identified

1. **Guest session boundary** — enforced at every API route and every server action; highest implementation risk; build and security-test first
2. **i18n** — structural constraint on every component; establish patterns on component one, use as template
3. **Rough.js aesthetic consistency** — all-or-nothing; mixed registers break the "deliberate choice" signal; requires a consistent application system
4. **Rate limiting** — all endpoints; stricter limits on contact and admin-write endpoints
5. **WCAG 2.1 AA** — both palettes independently verified; Rough.js SVG decorations aria-hidden; chart and map data have accessible text alternatives
6. **Code splitting** — Mapbox GL JS and Rough.js never bundled globally; chart libraries use skeleton loading to prevent CLS

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web app (Next.js SSR + headless CMS). Next.js App Router confirmed by PRD. TypeScript, Tailwind CSS, Radix UI headless, and BetterAuth pre-decided in project requirements. Scaffold adds no opinions that conflict with these decisions.

### Starter Options Considered

| Option | Assessment |
|---|---|
| `create-next-app@16` | Selected — clean base, zero conflicting opinions |
| T3 Stack | Rejected — bundles NextAuth, which conflicts with BetterAuth requirement |
| BetterAuth community starters | Rejected — all include shadcn/ui, explicitly excluded by UX spec |
| Custom from scratch | Rejected — no benefit over official scaffold for a 56-hour build |

### Selected Starter: create-next-app@16

**Rationale:** Official Next.js scaffold with no opinionated auth or UI layer. Provides TypeScript, Tailwind CSS, App Router, ESLint, and Turbopack out of the box. All design system, auth, i18n, and ORM choices are added explicitly, preserving full intent.

**Initialization Command:**

```bash
npx create-next-app@16 . --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"
```

_Note: `.` targets the existing project root (Dockerfile and docker-compose already present)._

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript strict mode; Next.js 16 with Turbopack dev server; Node 22 (matches Dockerfile).

**Styling Solution:**
Tailwind CSS v4 configured; CSS custom properties required for light/dark palette system (warm dark `#1a1814` base, warm off-white light). Radix UI headless primitives added manually. shadcn/ui excluded by design (UX spec).

**Build Tooling:**
Turbopack for development; Next.js production build with automatic code splitting. Mapbox GL JS and Rough.js must be dynamically imported per-page (never global bundle).

**Testing Framework:**
Not included — add Vitest + Testing Library post-scaffold. E2E with Playwright (optional).

**Code Organization:**
```
src/
  app/                    # App Router — public routes + admin routes
    (public)/             # Visitor-facing pages (SSR, indexed)
    admin/                # Admin shell (SSR, no-index)
  components/             # Shared UI components
  lib/                    # Auth, DB client, rate limiting, utilities
  hooks/                  # Custom React hooks
  i18n/                   # next-intl messages and config
  types/                  # TypeScript type definitions
```

**Development Experience:**
Turbopack hot reload; TypeScript path aliases (`@/*`); ESLint with Next.js rules. Docker dev container (Node 22-slim) already configured — run scaffold inside container.

**Note:** Project initialization using this command is the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database: PostgreSQL 17 + Prisma 7
- API pattern: REST API routes for all writes and external-facing endpoints
- Auth enforcement: Middleware on all `/api/admin/*` routes (guest session boundary)

**Important Decisions (Shape Architecture):**
- Translatable fields: JSON columns with typed `t(field, locale)` helper
- Rate limiting: Upstash Ratelimit (Redis-backed, Vercel edge-compatible)
- Email delivery: Resend
- Deployment: Vercel + custom domain (Dockerfile retained for future self-hosting)

**Deferred Decisions (Post-MVP):**
- Self-hosted server / reverse proxy rate limiting (revisit if migrating off Vercel)

### Data Architecture

**Database:** PostgreSQL 17 (Prisma-managed via Docker locally, Vercel Postgres or external PG in production)
**ORM:** Prisma 7 — schema-first, typed client, Prisma Migrate for all schema changes
**Translatable fields:** `Json` column per translatable field (e.g., `title Json`, `body Json`).
A typed server-side helper `t(field, locale)` extracts the active locale. Fixed locale
set (no dynamic locale addition), so normalized translation tables would add joins with
no benefit at this scale.
**Caching:** Next.js App Router native caching. `revalidatePath()` / `revalidateTag()`
called on admin save to bust public page cache. No external cache layer required.
**Migrations:** Prisma Migrate (dev) + `prisma migrate deploy` (production via Vercel
build step or CI).

### Authentication & Security

**Auth:** BetterAuth + OAuth (pre-decided). Single admin email allowlist enforced
server-side. httpOnly cookies only. OAuth tokens never exposed to client.
**Guest session boundary:** Enforced via Next.js middleware on all `/api/admin/*` routes.
Highest implementation risk — build and security-test first.
**Rate limiting:** Upstash Ratelimit (Redis-backed). Applied on all API routes; stricter
limits on `/api/contact` and `/api/admin/*` write endpoints.
**CAPTCHA:** Cloudflare Turnstile + honeypot (pre-decided). Honeypot enforced at API
layer independently of Turnstile script.

### API & Communication Patterns

**Pattern:** REST API routes (`/api/...`) for all admin CRUD and contact form submission.
Rationale: explicit security boundary, auditable middleware chain, and external automation
compatibility (n8n or similar can consume the API directly without app changes).
**Public data fetching:** Server Components query the database directly — no API hop for
read-only public pages.
**Error handling:** Consistent JSON error shape `{ error: string, code: string }` across
all API routes.
**API documentation:** No formal spec for MVP; REST surface is intentionally small.
Revisit if n8n integration expands the endpoint count significantly.

### Frontend Architecture

**State management:** React Server Components for all data fetching. Client state
(UI interactions, form state) via `useState` / `useReducer`. No global state library
(Zustand, Redux) — not warranted at this scale.
**Component architecture:** Radix UI headless primitives + custom Tailwind styling.
shadcn/ui excluded by design. Rough.js applied as a design system (consistent SVG
borders on all panels/cards).
**Bundle optimization:** Mapbox GL JS and Rough.js dynamically imported per-page via
`next/dynamic`. Chart libraries use skeleton loading to prevent CLS.

### Infrastructure & Deployment

**Hosting:** Vercel (production + preview deployments). Custom domain. Dockerfile
retained in repo for future self-hosting migration with no app changes required.
**CI/CD:** Vercel GitHub integration (automatic preview on PR, production on main).
GitHub Actions for `vitest` run pre-deploy.
**Email delivery:** Resend (3k emails/month free tier; React Email templates).
**Monitoring:** Vercel Analytics + Speed Insights (Web Vitals, maps to Lighthouse NFR).
Sentry (runtime error tracking + performance). No overlap — complementary.
**Logging:** Vercel function logs for server-side; Sentry breadcrumbs for client-side
error context.

### Decision Impact Analysis

**Implementation Sequence:**
1. Guest session boundary + middleware (highest security risk — validate first)
2. Prisma schema + PostgreSQL setup (blocks all content features)
3. BetterAuth + OAuth flow
4. REST API routes with Upstash rate limiting
5. Public SSR pages with Server Components
6. i18n structure (next-intl, establish on component one)
7. Rough.js design system integration
8. Resend contact form
9. Mapbox + data visualization (lazy-loaded)
10. Sentry + Vercel Analytics instrumentation

**Cross-Component Dependencies:**
- Guest session middleware must be complete before any admin API route is built
- Prisma schema must be stable before content API routes
- i18n pattern established on first component — all subsequent components follow same pattern
- Rough.js loaded only on pages that use it — never in global layout

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (Prisma → PostgreSQL):**
- Models: `PascalCase` (`Project`, `ContactMessage`) — Prisma convention
- Schema fields: `camelCase` in Prisma schema; use `@map("snake_case")` for DB columns where needed
- Foreign keys: `camelCase` in schema (`userId`, `projectId`)
- Translatable fields: `Json` type (`title Json`, `body Json`)

**API Endpoints:**
- Plural nouns: `/api/projects`, `/api/contact-messages`
- Nested resources: `/api/projects/:id/images`
- Admin-gated routes: `/api/admin/projects`, `/api/admin/projects/:id`
- All lowercase, kebab-case segments

**Code:**
- React components: `PascalCase.tsx` (`ProjectCard.tsx`, `RoughBox.tsx`)
- All other files: `kebab-case.ts` (`use-locale.ts`, `rate-limit.ts`, `prisma-client.ts`)
- Functions and variables: `camelCase`
- Environment-derived constants: `SCREAMING_SNAKE_CASE`

### Structure Patterns

**Tests:** Co-located `*.test.ts` / `*.test.tsx` files next to the file under test. No `__tests__` directories.

**Components grouped by feature:**
```
src/components/
  portfolio/       # ProjectCard, SkillsMap, TimelineEntry, etc.
  admin/           # AdminNav, ContentForm, ImageUpload, etc.
  shared/          # RoughBox, LocaleSwitcher, SkeletonCard, etc.
```

**API route file layout:**
```
src/app/api/
  projects/
    route.ts           # GET (list), POST
    [id]/route.ts      # GET, PATCH, DELETE
  admin/
    projects/
      route.ts         # admin-gated list + create
      [id]/route.ts    # admin-gated update + delete
  contact/
    route.ts
```

**Lib folder layout:**
```
src/lib/
  prisma.ts            # Prisma client singleton
  auth.ts              # BetterAuth config + session helpers
  rate-limit.ts        # Upstash Ratelimit wrappers
  i18n.ts              # t() locale helper
  email.ts             # Resend client + templates
```

### Format Patterns

**API success response:** Direct data — no wrapper envelope.
```json
[{ "id": 1, "title": { "en": "...", "fr": "..." } }]
```

**API error response:** Consistent shape across all routes.
```json
{ "error": "Not found", "code": "PROJECT_NOT_FOUND" }
```

Standard HTTP status codes: `200` success, `201` created, `400` bad request,
`401` unauthorized, `403` forbidden, `404` not found, `429` rate limited, `500` server error.

**Dates:** ISO 8601 strings everywhere (`"2026-04-08T12:00:00Z"`). No Unix timestamps.

**JSON field naming:** `camelCase` in all API responses (matches Prisma client output and TypeScript conventions).

### Process Patterns

**Auth check — every admin route, same pattern, no variation:**
```ts
const session = await auth.getSession(request)
if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
  return Response.json(
    { error: 'Unauthorized', code: 'UNAUTHORIZED' },
    { status: 401 }
  )
}
```

**Guest session check — same pattern applied before auth check on guest-accessible admin routes:**
```ts
const guestToken = request.cookies.get('guest-token')?.value
if (!guestToken || !verifyGuestToken(guestToken)) {
  return Response.json(
    { error: 'Forbidden', code: 'FORBIDDEN' },
    { status: 403 }
  )
}
```

**Rate limiting — applied at top of every route handler:**
```ts
const { success } = await ratelimit.limit(ip)
if (!success) {
  return Response.json(
    { error: 'Too many requests', code: 'RATE_LIMITED' },
    { status: 429 }
  )
}
```

**Locale extraction — single helper, used everywhere:**
```ts
// src/lib/i18n.ts
export function t(field: Json, locale: string): string {
  const map = field as Record<string, string>
  return map[locale] ?? map['en'] ?? ''
}
```

**Loading states:** Suspense boundaries with skeleton components in Server Components.
No `isLoading` boolean state in server-rendered pages.

**Error boundaries:** One `error.tsx` per route segment. Client-side errors captured
by Sentry automatically via SDK instrumentation.

### Enforcement Guidelines

**All AI agents MUST:**
- Use `kebab-case` for all non-component filenames
- Use the shared `t(field, locale)` helper — never inline JSON access for translatable fields
- Apply the auth check pattern verbatim in every `/api/admin/*` route handler
- Apply rate limiting at the top of every route handler before any business logic
- Return errors in `{ error: string, code: string }` shape — no other error format
- Use `revalidatePath()` or `revalidateTag()` after every successful admin write
- Never import Mapbox GL JS or Rough.js at the module level — dynamic import only

**Anti-patterns to avoid:**
- Wrapping success responses in `{ data: ... }` envelopes
- Inline auth logic duplicated across routes (use the shared pattern)
- Global Mapbox or Rough.js bundle inclusion
- `isLoading` state in Server Components
- Direct `field.en` or `field[locale]` access — always use `t()`
- Unix timestamps in API responses

## Project Structure & Boundaries

### Complete Project Directory Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .eslintrc.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml                    # vitest → Vercel deploy
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── favicon.ico
│   └── og-image.png
└── src/
    ├── middleware.ts                  # guest session + auth boundary (all /admin/* + /api/admin/*)
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx                 # root layout: next-intl, Sentry, Vercel Analytics
    │   ├── error.tsx                  # root error boundary
    │   ├── (public)/                  # FR1–15, FR32–38 — visitor-facing, SSR, indexed
    │   │   ├── page.tsx               # portfolio landing
    │   │   ├── projects/
    │   │   │   ├── page.tsx           # project list
    │   │   │   └── [slug]/page.tsx    # project detail
    │   │   ├── about/page.tsx
    │   │   ├── contact/page.tsx       # FR28–31
    │   │   └── sitemap.ts             # FR35–38: dynamic sitemap
    │   ├── admin/                     # FR16–27 — admin shell, noindex
    │   │   ├── layout.tsx             # admin shell layout (guest/owner mode indicator)
    │   │   ├── page.tsx               # dashboard home
    │   │   ├── projects/
    │   │   │   ├── page.tsx           # project list
    │   │   │   ├── new/page.tsx       # create form (owner only)
    │   │   │   └── [id]/page.tsx      # edit form (owner only)
    │   │   ├── about/page.tsx         # about content management
    │   │   └── settings/page.tsx      # locale, theme preferences
    │   └── api/
    │       ├── auth/
    │       │   └── [...betterauth]/route.ts   # BetterAuth OAuth handler
    │       ├── projects/
    │       │   ├── route.ts           # GET list (public, rate limited)
    │       │   └── [id]/route.ts      # GET single (public, rate limited)
    │       ├── admin/                 # all routes: auth check + rate limit
    │       │   ├── projects/
    │       │   │   ├── route.ts       # POST create
    │       │   │   └── [id]/route.ts  # PATCH update, DELETE
    │       │   ├── about/route.ts     # PATCH about content
    │       │   └── images/route.ts    # POST upload, DELETE
    │       └── contact/route.ts       # POST: Turnstile + honeypot + Resend (FR28–31)
    ├── components/
    │   ├── portfolio/                 # FR1–15
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProjectGrid.tsx
    │   │   ├── SkillsMap.tsx          # Mapbox GL JS (next/dynamic, FR11–15)
    │   │   ├── TimelineEntry.tsx
    │   │   └── DataChart.tsx          # chart lib (next/dynamic, FR11–15)
    │   ├── admin/                     # FR16–27
    │   │   ├── AdminNav.tsx
    │   │   ├── ContentForm.tsx
    │   │   ├── ImageUpload.tsx
    │   │   └── LocaleTabPanel.tsx     # EN/FR switcher for Json translatable fields
    │   ├── contact/                   # FR28–31
    │   │   ├── ContactForm.tsx
    │   │   └── TurnstileWidget.tsx
    │   └── shared/
    │       ├── RoughBox.tsx           # Rough.js SVG border wrapper (next/dynamic)
    │       ├── LocaleSwitcher.tsx     # FR32–34
    │       ├── ThemeToggle.tsx
    │       ├── SkeletonCard.tsx       # CLS prevention for dynamic-loaded components
    │       └── NavBar.tsx             # FR7–10
    ├── lib/
    │   ├── prisma.ts                  # Prisma client singleton
    │   ├── auth.ts                    # BetterAuth config + session helpers
    │   ├── rate-limit.ts              # Upstash Ratelimit wrappers (standard + strict)
    │   ├── i18n.ts                    # t(field, locale) helper
    │   └── email.ts                   # Resend client + React Email templates
    ├── hooks/
    │   ├── use-locale.ts
    │   └── use-theme.ts
    ├── i18n/
    │   ├── config.ts                  # supported locales, default locale
    │   ├── routing.ts                 # next-intl routing config
    │   └── messages/
    │       ├── en.json
    │       └── fr.json
    └── types/
        ├── prisma.ts                  # re-exported Prisma types + Json field helpers
        └── api.ts                     # API request/response types
```

### Architectural Boundaries

**Three runtime contexts — enforced in `src/middleware.ts`:**

| Context | Routes | Enforcement |
|---|---|---|
| Visitor | `(public)/*` | No auth required |
| Guest admin | `/admin/*`, `/api/admin/*` | Valid guest token (read ops only; write ops return 403) |
| Owner admin | `/admin/*`, `/api/admin/*` | Valid OAuth session + email allowlist |

**API Boundaries:**
- Public API: `/api/projects/*` — GET only, no auth, standard rate limit
- Admin API: `/api/admin/*` — OAuth session required, strict rate limit, write-blocked for guest tokens
- Auth API: `/api/auth/[...betterauth]` — BetterAuth handles all OAuth provider callbacks
- Contact API: `/api/contact` — no auth, Turnstile + honeypot verification, strict rate limit

**Data Flow:**
- Public read: Server Component → Prisma (direct) → render (no API hop)
- Admin read: Server Component → Prisma (direct) → render (guest or owner session)
- Admin write: Client Component → `fetch /api/admin/*` → middleware → Prisma → `revalidatePath()`
- Contact: Client Component → `fetch /api/contact` → rate limit + Turnstile + honeypot → Resend

### Requirements to Structure Mapping

| FR Category | Location |
|---|---|
| Public Portfolio (FR1–6) | `app/(public)/`, `components/portfolio/` |
| Navigation & Display (FR7–10) | `components/shared/NavBar.tsx`, `app/(public)/layout` |
| Data Visualization & Mapping (FR11–15) | `components/portfolio/SkillsMap.tsx`, `DataChart.tsx` |
| Content Management (FR16–21) | `app/admin/`, `components/admin/`, `app/api/admin/` |
| Authentication & Access Control (FR22–27) | `src/middleware.ts`, `lib/auth.ts`, `app/api/auth/` |
| Contact & Anti-Spam (FR28–31) | `app/(public)/contact/`, `components/contact/`, `app/api/contact/` |
| Internationalization (FR32–34) | `src/i18n/`, `lib/i18n.ts`, `components/shared/LocaleSwitcher.tsx` |
| Discoverability & Transparency (FR35–38) | `app/(public)/sitemap.ts`, root `layout.tsx` meta |

### External Integration Points

| Service | Entry point | Location |
|---|---|---|
| BetterAuth / OAuth | OAuth callbacks | `app/api/auth/[...betterauth]/route.ts` |
| Upstash Ratelimit | Top of every route handler | `lib/rate-limit.ts` |
| Cloudflare Turnstile | Widget + server verify | `components/contact/TurnstileWidget.tsx` + `app/api/contact/route.ts` |
| Resend | Email send | `lib/email.ts` → called only from `app/api/contact/route.ts` |
| Mapbox GL JS | Dynamic import | `components/portfolio/SkillsMap.tsx` only |
| Rough.js | Dynamic import wrapper | `components/shared/RoughBox.tsx` only — all other components use this wrapper |
| Sentry | SDK instrumentation | `sentry.client.config.ts` + `sentry.server.config.ts` |
| Vercel Analytics + Speed Insights | Root layout init | `app/layout.tsx` |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are compatible and conflict-free.
Next.js 16 + Prisma 7 + PostgreSQL 17 is a well-tested combination. BetterAuth and
next-intl both have native App Router support. Rough.js and Mapbox GL JS are correctly
isolated behind `next/dynamic` to prevent SSR issues. Tailwind v4 + Radix UI have no
overlap. Upstash Ratelimit is edge-compatible and has official Vercel support.

**Pattern Consistency:** Naming conventions are consistent across DB, API, and code layers.
The auth check pattern, rate limit pattern, and `t()` locale helper are defined once and
applied uniformly. The `RoughBox.tsx` wrapper enforces `aria-hidden` at a single point.

**Structure Alignment:** `src/middleware.ts` correctly covers both `/admin/*` (page routes)
and `/api/admin/*` (API routes) in one enforcement boundary. The `(public)` route group
correctly excludes admin from search indexing. The `lib/` folder centralizes all
third-party client singletons.

### Requirements Coverage Validation ✅

**FR Coverage (all 8 categories):**

| FR Category | Architectural Support |
|---|---|
| FR1–6 Public Portfolio | `(public)/`, `components/portfolio/`, public API |
| FR7–10 Navigation & Display | `NavBar.tsx`, root layout |
| FR11–15 Data Visualization & Mapping | `SkillsMap.tsx` + `DataChart.tsx` (next/dynamic) |
| FR16–21 Content Management | `admin/` routes + `components/admin/` + `api/admin/` |
| FR22–27 Auth & Access Control | `middleware.ts` + BetterAuth + guest token |
| FR28–31 Contact & Anti-Spam | `/api/contact` + Turnstile + honeypot + Resend |
| FR32–34 Internationalization | next-intl + `i18n/` + `t()` helper + LocaleSwitcher |
| FR35–38 Discoverability | `sitemap.ts` + `public/robots.txt` + meta in layout |

**NFR Coverage:**
- Performance (Lighthouse ≥90): SSR-first public pages, Mapbox + Rough.js code-split,
  SkeletonCard CLS prevention, Vercel Blob assets served via CDN
- Security: Middleware-enforced boundaries, httpOnly cookies, Upstash rate limiting,
  Turnstile + honeypot, no sensitive data in guest API responses
- Accessibility: `RoughBox.tsx` wrapper enforces `aria-hidden` on all Rough.js decorations;
  WCAG 2.1 AA verified per color mode
- Reliability: `revalidatePath()` on every admin write; Sentry captures silent failures

### Gap Analysis Results

**Critical gaps found and resolved:**

1. **Image storage** — `/api/admin/images/route.ts` required a storage decision.
   Resolved: **Vercel Blob** (`@vercel/blob`). Server-side upload, blob URL stored in
   Prisma, served via Vercel CDN. One env var (`BLOB_READ_WRITE_TOKEN`), zero extra config.

2. **`robots.txt`** — required for FR35–38 discoverability.
   Resolved: Static file at `public/robots.txt`. Disallows `/admin/*`.

**No remaining gaps.**

### Architecture Completeness Checklist

- [x] Project context analyzed — 38 FRs, 6 NFRs, 3 runtime contexts, cross-cutting concerns
- [x] Technical constraints mapped — solo dev, 56h, existing Dockerfile, Vercel target
- [x] Critical decisions documented with versions — PostgreSQL 17, Prisma 7, Next.js 16
- [x] Full technology stack specified — all libraries, services, and integrations named
- [x] Implementation patterns defined — naming, structure, format, process
- [x] Consistency rules enforceable — anti-patterns documented, examples provided
- [x] Complete directory structure — every file and directory mapped to requirements
- [x] Architectural boundaries defined — 3 runtime contexts, middleware enforcement point
- [x] Integration points mapped — all external services with entry points specified
- [x] All gaps resolved — image storage (Vercel Blob), robots.txt

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- Guest session boundary is unambiguous — one middleware file, one enforcement point
- All browser-only libraries isolated behind `next/dynamic` — no SSR risk
- REST API surface designed for external automation (n8n) from day one
- JSON column i18n is pragmatic and defensible for fixed locale sets
- Implementation sequence prioritizes highest-risk items first (guest session, then DB)

**Areas for Future Enhancement (post-MVP):**
- Formal API spec (OpenAPI) if n8n integration grows the endpoint surface
- Self-hosted reverse proxy rate limiting if migrating off Vercel
- Image transformation pipeline if portfolio grows beyond simple display

### Implementation Handoff

**First implementation step:**
```bash
npx create-next-app@16 . --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"
```

**Implementation sequence:**
1. Guest session boundary + middleware (highest security risk — validate first)
2. Prisma schema + PostgreSQL setup (blocks all content features)
3. BetterAuth + OAuth flow
4. REST API routes with Upstash rate limiting
5. Public SSR pages with Server Components
6. i18n structure (next-intl, establish on component one)
7. Rough.js design system integration
8. Resend contact form
9. Mapbox + data visualization (lazy-loaded)
10. Sentry + Vercel Analytics instrumentation
