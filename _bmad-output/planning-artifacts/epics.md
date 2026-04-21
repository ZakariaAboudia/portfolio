---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for app, decomposing the requirements from the PRD, UX Design Specification, and Architecture Decision Document into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitors can view an Overview page that communicates the developer's identity, role, and primary call to action without technical background, within a single viewport
FR2: Visitors can discover the developer's work and projects as the primary content on the Overview page, with personal introduction secondary
FR3: Visitors can view a dedicated Projects page with project details and geographic context
FR4: Visitors can view the developer's work history and professional timeline on an Experience page
FR5: Visitors can contact the developer through a dedicated Contact page
FR6: Visitors can explore the admin panel as a read-only guest without authenticating, accessible from the main navigation
FR7: Visitors can navigate between all portfolio sections via a persistent sidebar navigation
FR8: Visitors can use all portfolio pages on a mobile device with full functionality (not read-only)
FR9: Visitors can switch between light and dark display modes manually
FR10: The system preserves a visitor's display mode preference across sessions
FR11: Visitors can view project and client locations on an interactive map with geographic pins
FR12: Visitors can view anonymized location pins for confidential clients, showing sector and region without identifying information
FR13: Visitors can discover the developer's skills exclusively through data visualizations — no static skills list exists
FR14: Visitors can view tech stack depth, experience by domain, and project volume over time as distinct chart visualizations
FR15: Visitors with assistive technology can access the information conveyed by map pins and charts through accessible text alternatives
FR16: The administrator can create, update, and delete project entries via the admin panel
FR17: The administrator can create, update, and delete skill entries via the admin panel
FR18: The administrator can create, update, and delete timeline and experience entries via the admin panel
FR19: The administrator can perform all content management operations from a mobile device
FR20: The administrator can add translated content fields per entry to support multiple languages
FR21: The public portfolio reflects content changes immediately after the administrator saves them, without a code deployment
FR22: The administrator can authenticate using an OAuth provider without a username or password
FR23: The system restricts admin write access to a single pre-configured email address, enforced server-side
FR24: Visitors can enter the guest admin demo without authenticating
FR25: The system blocks all write operations from guest sessions at the server level, independent of UI state
FR26: The system rate-limits requests to all API endpoints
FR27: The system prevents guest sessions from escalating to authenticated admin access under any condition
FR28: Visitors can send a message to the developer through a contact form without downloading any file
FR29: The system delivers contact form submissions to the developer's email inbox
FR30: The system detects and silently blocks automated bot submissions before delivery
FR31: The system presents no visible challenge or friction to legitimate human users when bot protection is active
FR32: The system renders all user-facing text through an internationalization layer with no hardcoded strings
FR33: The administrator can manage translated content for all portfolio entries without modifying code
FR34: The system serves the correct language content based on the active locale
FR35: Search engines can crawl and index all public portfolio pages
FR36: Social platforms can render rich preview cards when any public portfolio URL is shared
FR37: The system excludes admin panel routes from search engine indexing
FR38: Visitors can access the portfolio's public source code repository from within the portfolio

### NonFunctional Requirements

NFR1 (Performance): All public pages achieve Lighthouse scores ≥ 90 across Performance, Accessibility, Best Practices, and SEO at launch — measured on a standard desktop connection
NFR2 (Performance): Core Web Vitals within Google's "Good" thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1
NFR3 (Performance): Time to Interactive on the Overview page ≤ 3 seconds on a 4G mobile connection
NFR4 (Performance): Mapbox GL JS and Rough.js loaded only on pages that require them — not bundled globally; chart libraries render client-side with skeleton loading states to prevent CLS
NFR5 (Security): All data transmission encrypted via HTTPS/TLS; no mixed-content on any page
NFR6 (Security): Admin write operations validated server-side on every request; client-side UI state is never the sole enforcement mechanism
NFR7 (Security): Guest session tokens are cryptographically distinct from admin session tokens and carry no write permissions at the server level — escalation is architecturally impossible, not just UI-blocked
NFR8 (Security): Rate limiting applied to all API endpoints; contact and admin-write endpoints apply stricter limits
NFR9 (Security): OAuth tokens never exposed to the client; authentication state managed server-side via secure, httpOnly cookies
NFR10 (Security): No sensitive data (developer email, admin session info, internal IDs) exposed in guest mode API responses
NFR11 (Security): Contact form submissions validated server-side before delivery; honeypot and Turnstile checks enforced at the API layer, not only the UI layer
NFR12 (Accessibility): WCAG 2.1 Level AA compliance across all public-facing pages
NFR13 (Accessibility): All interactive elements keyboard-navigable with visible, consistently styled focus indicators
NFR14 (Accessibility): Colour contrast ratios meet AA standards in both light and dark modes — verified independently for each palette
NFR15 (Accessibility): Decorative Rough.js SVG elements marked aria-hidden="true"; no accessibility tree pollution from visual styling
NFR16 (Accessibility): Map pins and chart data accessible via text alternatives (tooltip text, list view, or equivalent) for screen reader users
NFR17 (Accessibility): lang attribute on <html> reflects the active locale at all times
NFR18 (Accessibility): All translated strings carry through to aria-label attributes where relevant
NFR19 (Integration): Mapbox GL JS — Map renders and pins load within 3 seconds; graceful fallback displayed if Mapbox fails to initialise
NFR20 (Integration): BetterAuth + OAuth — error state surfaced clearly if provider is temporarily unavailable
NFR21 (Integration): Cloudflare Turnstile — Contact form remains submittable if Turnstile fails to load; graceful degradation, no silent blocking of legitimate users
NFR22 (Integration): Email delivery — failed deliveries surface an error to the user rather than silently dropping
NFR23 (Integration): next-intl — missing translation keys fall back to English without throwing an error or rendering a blank string
NFR24 (Reliability): Portfolio available 99.9% uptime monthly
NFR25 (Reliability): Failed admin content saves surface an explicit error to the administrator; no silent data loss on write operations

### Additional Requirements

- **Starter template (Epic 1, Story 1):** Project initialized using `npx create-next-app@16 . --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"` targeting the existing project root (Dockerfile and docker-compose already present)
- **Database:** PostgreSQL 17 managed via Prisma 7; Docker locally, Vercel Postgres or external PG in production; Prisma Migrate for all schema changes; `prisma migrate deploy` in Vercel build step or CI
- **Translatable fields:** JSON columns (`title Json`, `body Json`) with typed server-side `t(field, locale)` helper — never inline JSON access
- **Next.js caching:** `revalidatePath()` or `revalidateTag()` called on every successful admin write to bust public page cache
- **Rate limiting:** Upstash Ratelimit (Redis-backed, Vercel edge-compatible); standard limit on public endpoints; stricter limit on `/api/contact` and `/api/admin/*` write endpoints
- **Auth pattern (every admin route):** Session retrieved via `auth.getSession(request)`, email checked against `process.env.ADMIN_EMAIL`, returns 401 JSON `{ error, code }` if not matched
- **Guest session pattern:** `guest-token` cookie verified via `verifyGuestToken()` before auth check on guest-accessible admin routes; returns 403 on invalid token
- **Image storage:** Vercel Blob (`@vercel/blob`); server-side upload; blob URL stored in Prisma; served via Vercel CDN; one env var (`BLOB_READ_WRITE_TOKEN`)
- **Email delivery:** Resend (3k emails/month free tier); React Email templates
- **Error response shape:** All API errors return `{ error: string, code: string }` — no other format
- **robots.txt:** Static file at `public/robots.txt` disallowing `/admin/*`
- **Discoverability:** Dynamic sitemap at `app/(public)/sitemap.ts`; Open Graph meta in root `layout.tsx`
- **Hosting:** Vercel production + preview deployments; custom domain; Dockerfile retained for future self-hosting
- **CI/CD:** Vercel GitHub integration; GitHub Actions workflow (`vitest` pre-deploy)
- **Monitoring:** Sentry (runtime error + performance); Vercel Analytics + Speed Insights (Web Vitals)
- **Testing:** Vitest + Testing Library (co-located `*.test.ts`/`*.test.tsx` files); Playwright E2E (optional); `axe-core` via `jest-axe` for accessibility
- **Implementation sequence:** (1) Guest session boundary + middleware → (2) Prisma schema + PostgreSQL → (3) BetterAuth + OAuth → (4) REST API routes + rate limiting → (5) Public SSR pages → (6) i18n structure → (7) Rough.js design system → (8) Resend contact form → (9) Mapbox + data visualization → (10) Sentry + Vercel Analytics
- **Naming conventions:** React components `PascalCase.tsx`; all other files `kebab-case.ts`; API endpoints lowercase kebab-case plural nouns; Prisma models `PascalCase`; DB columns `snake_case` via `@map()`
- **Anti-patterns (enforce):** Never wrap success responses in `{ data: ... }` envelopes; never import Mapbox GL JS or Rough.js at module level (dynamic import only); never use `isLoading` state in Server Components; never use Unix timestamps (ISO 8601 only)

### UX Design Requirements

UX-DR1: Implement CSS design token system as CSS custom properties — warm dark palette (`--bg-base: #1a1814`, `--accent: #e8a020`, and all specified tokens) and warm light palette (`--bg-base: #f5f0e8`, `--accent: #c87010`, and all specified tokens); both modes switch via `prefers-color-scheme` with manual override; no class-swap hacks
UX-DR2: Implement Space Grotesk (primary UI font) and JetBrains Mono (monospace/code accents); Inter is explicitly excluded; apply the specified type scale (11px–36px) with defined weights and line heights
UX-DR3: Implement `RoughCard` component — fundamental content container with Rough.js SVG border (roughness 1.0, bowing 0.4, stroke 1.5px, color: `--border-default`); SVG positioned `absolute inset-0`, `aria-hidden="true"`, `pointer-events: none`; inner content in `relative z-10`; ResizeObserver-driven re-render; roughness seed keyed to component ID for stable re-renders
UX-DR4: Implement `StatCard` component — 4 Overview metric cards (projects count, countries count, technologies count, years active) using `RoughCard` wrapper; monospace label, 2xl/700 value, xs secondary sub-label, 2px amber bottom-edge accent strip; `role="figure"` with `aria-label`
UX-DR5: Implement `AdminNavSidebar` component — 240px expanded (icon + text label) / 64px collapsed (icon-only); Rough.js right-edge SVG border; amber active state (amber-muted bg + amber text + 2px left-edge indicator); hover state (text-primary + bg-elevated); Radix Tooltip showing label on hover in collapsed mode; `nav` element with `aria-label="Portfolio navigation"`; `aria-current="page"` on active item; admin section separated by a subtle label
UX-DR6: Implement `DemoBadge` component — persistent topbar indicator visible only in guest sessions (never to authenticated admin); font-mono, text-xs, amber text on amber-muted background; fixed in topbar right area; text "Demo mode"; `aria-live="polite"` — announced on session state change
UX-DR7: Implement `SketchyChart` component — Skills page chart rendered via roughViz.js or Chart.js + roughjs plugin; bar/segment fill at opacity 0.85; hover state (hovered segment highlighted, others at 0.4 opacity, Radix Tooltip showing proficiency + years); keyboard Tab cycling through segments with focus ring + tooltip; `role="img"` with `aria-label`; visually-hidden data table as screen reader alternative; loading skeleton (bars at 0 height); reduced motion: static render (no fill animation)
UX-DR8: Implement `MapWithPins` component — Mapbox GL JS (dynamically imported via `next/dynamic`) with custom Rough.js SVG path markers (hand-drawn pin shape) positioned via Mapbox `Marker` API; pin colors: accent (active client), success (completed), text-muted (older); Radix Tooltip shows sector + region label on hover/click (never client name); pin scales 1.15 on hover; map supplementary — visually-hidden structured region list as screen reader fallback; skeleton card while loading; graceful fallback card if Mapbox fails to initialize
UX-DR9: Implement `ContactForm` component — Name, Email, Message fields with Radix Label + Input/Textarea; Cloudflare Turnstile in invisible mode (auto-validates real users); honeypot field (`position: absolute; left: -9999px`); inline validation on blur; submit disabled until all required fields valid; loading state (inputs disabled, button `aria-busy="true"`); success state (form fades, confirmation message fades in: "Message sent. Expect a reply within 2 days"); error state (toast notification, form re-enabled); all inputs with `htmlFor`, errors with `aria-describedby`
UX-DR10: Implement `MobileAdminForm` — project add/edit form for mobile; all inputs full-width stacked vertically; min 48px touch target height on all inputs; tech stack tag input as scrollable pill row (text + Enter to add, × to remove); translation fields (title_fr, description_fr) in collapsed accordion ("French translation (optional)"), not required; sticky Save button at bottom of viewport, activates when required fields valid; optimistic UI (list updates immediately on save)
UX-DR11: Implement responsive sidebar breakpoints — desktop 1024px+: 240px expanded sidebar; tablet 768–1023px: auto-collapse to 64px icon-only; mobile < 768px: sidebar replaced by bottom navigation bar (5 primary items: Overview, Projects, Skills, Map, Contact) + hamburger sheet for Admin access; active item: amber icon + amber label; mobile breakpoint (768px) is the only structural navigation change
UX-DR12: Implement three-tier button hierarchy — Primary (Rough.js border, `--accent` background fill on hover); Secondary (Rough.js border, transparent fill, `--text-secondary` label); Ghost/Destructive (`--error` text, no border, visible only on parent row hover); never two primary buttons side by side; all destructive actions require Radix `AlertDialog` confirmation; loading state: spinner replaces label, `aria-busy="true"`; admin-only buttons never rendered in guest/public views (server-side conditional, not CSS hide)
UX-DR13: Implement Toast notification system using Radix `Toast` — Save success ("Project saved", 4s auto-dismiss); Delete success ("Project deleted", 4s auto-dismiss); Save error ("Failed to save — Retry" with retry button, persistent); Demo mode block ("Changes are disabled in demo mode", 4s auto-dismiss); Network error (persistent); max one toast visible at a time (queue subsequent); bottom-right position; never cover sticky mobile save button
UX-DR14: Implement empty states for all list/data surfaces — Projects list public ("No projects yet — check back soon.", no action); Projects list admin ("No projects added yet.", "Add your first project →" primary button); Skills chart ("No skills data — add skills in the admin.", admin link for authenticated only); Map ("No client locations yet.", map still renders, no pins); Messages inbox admin ("No messages received yet.", none); Contact sent ("Message sent. Expect a reply within 2 days.", terminal state); empty state copy in `--text-muted`, centered, no illustration
UX-DR15: Implement skeleton loading screens (not spinners) for all data surfaces — Stat cards (4 skeleton rectangles, same dimensions, Rough.js border); Projects list (3 skeleton rows, varying width); Map (skeleton card with Rough.js border); Skills chart (skeleton chart area, bars at 0 height); Admin form (skeleton fields); skeleton color: `--bg-subtle`; pulse animation (opacity 0.5→1.0 at 1.5s); pulse disabled if `prefers-reduced-motion`; skip skeleton entirely if data loads in < 200ms; `aria-busy="true"` on loading containers
UX-DR16: Implement filter bar for admin project and skills lists — debounced text search (300ms), region dropdown, tech tag filter; active filters shown as removable pills below the filter bar; "Clear all" link when any filter active; filter state persisted in URL query string (shareable, back-button-safe); no-results state: "No projects match your filters." with "Clear filters" link (distinct from empty state)
UX-DR17: Implement full WCAG 2.1 AA accessibility infrastructure — skip link (`<a href="#main-content">Skip to content</a>` as first focusable element); semantic HTML (`<nav aria-label>`, `<main>`, `<header>`, `<h1>` per page hierarchy); keyboard navigation for map (Tab cycles pins, Enter opens tooltip, ESC closes) and chart (Tab cycles segments, Enter/Space shows tooltip); focus trap in modals (ESC closes, focus returns to trigger); focus ring: 2px solid `--accent`, 2px offset, on ALL interactive elements, never `outline: none` without replacement; color is never the sole state indicator; `lang` attribute reflects active locale; `prefers-reduced-motion` disables all animations
UX-DR18: Implement Rough.js application system — every card, panel, modal border, button, form input, and divider gets Rough.js SVG border (no mixed registers); roughness 0.8–1.2; bowing 0.3–0.6; stroke 1.5px cards / 1px inputs and dividers / 2px chart elements; roughness 0.7 on mobile (smaller elements); color matches `--border-default` token (not hardcoded); all roughness seeds keyed to component ID; ResizeObserver re-render at 100ms debounce on resize; never `border` CSS alongside Rough.js on the same element
UX-DR19: Implement admin CRUD form patterns — inline validation on blur (not on keystroke); error message below field in `--error` color, font-mono, text-xs; Rough.js border re-renders in error color; no green tick on valid (absence of error is signal); Save (primary) + Cancel (secondary) always paired; Cancel navigates back without saving; dirty form + Cancel triggers AlertDialog ("Discard changes?" with Discard destructive + Keep Editing primary); translation fields in collapsed accordion by default; fields required unless labeled "Optional"
UX-DR20: Implement Radix UI primitives — Dialog (edit project modal), AlertDialog (delete confirmation, not dismissible by overlay click), Toast, Tooltip (map pins, collapsed nav icons), Select (client region dropdown, date month/year picker), Label + Input/Textarea (all admin form fields), Switch (published/draft toggle on projects), NavigationMenu (mobile nav), ScrollArea (project list, skills list in admin) — all styled from scratch via Tailwind + design tokens, zero shadcn/ui defaults
UX-DR21: Implement dark/light mode system — `prefers-color-scheme` sets initial mode (dark is primary design direction); manual override toggle persists preference across sessions; `ThemeToggle` component in shared; CSS custom properties switch mode — no class-swap hacks; both palettes independently verified for WCAG AA contrast
UX-DR22: Implement page transitions and navigation behavior — content area fades in (150ms opacity) on route change; sidebar never re-renders on navigation (persistent shell); no full-page slide or zoom transitions; topbar shows current page title only (no breadcrumb trail); instant navigation via Next.js App Router
UX-DR23: Implement Overview page "Ledger Dark" layout — 4-column stat grid leads above the fold (projects, countries, technologies, years active); projects list panel (left) + map panel (right) in a 2-column row below; work-first structure (no bio above the fold); 5-second legibility target for non-technical visitors (Sarah persona); stats visible without scroll on desktop viewport
UX-DR24: Implement guest admin UX pattern — Admin link in sidebar with equal visual weight to other nav items (no "try the demo" CTA or announcement); single click entry with no login wall; read-only status communicated implicitly via DemoBadge only (no modal, no banner); all forms pre-filled with real content and inputs interactive; save/submit attempts return 403 server-side and display calm toast "Changes are disabled in demo mode"; visitor can fully explore all admin sections, open edit forms, browse real content

### FR Coverage Map

FR1: Epic 3 — Overview page 5-second identity legibility
FR2: Epic 3 — Overview page work-first content hierarchy
FR3: Epic 3 — Projects page with geographic context
FR4: Epic 3 — Experience/timeline page
FR5: Epic 5 — Contact page existence and form
FR6: Epic 1 — Guest admin entry from main nav (security boundary)
FR7: Epic 2 — Persistent sidebar navigation
FR8: Epic 2 — Mobile full functionality across all pages
FR9: Epic 2 — Dark/light mode toggle
FR10: Epic 2 — Mode preference persisted across sessions
FR11: Epic 3 — Interactive Mapbox map with geographic pins
FR12: Epic 3 — Anonymized client pins (sector + region)
FR13: Epic 3 — Skills exclusively via data visualization (no static list)
FR14: Epic 3 — Tech stack depth, experience by domain, project volume charts
FR15: Epic 3 — Accessible text alternatives for map pins and charts
FR16: Epic 4 — Admin project CRUD
FR17: Epic 4 — Admin skill CRUD
FR18: Epic 4 — Admin timeline/experience CRUD
FR19: Epic 4 — Admin operations from mobile device
FR20: Epic 4 — Translated content fields per entry
FR21: Epic 4 — Immediate public reflection of admin saves (revalidatePath)
FR22: Epic 1 — OAuth authentication (Google/GitHub)
FR23: Epic 1 — Single email allowlist enforced server-side
FR24: Epic 1 — Guest admin entry without authentication
FR25: Epic 1 — Server-level write blocking for guest sessions
FR26: Epic 1 — Rate limiting on all API endpoints
FR27: Epic 1 — No guest-to-admin session escalation
FR28: Epic 5 — Contact form (no file download required)
FR29: Epic 5 — Email delivery of contact submissions via Resend
FR30: Epic 5 — Bot detection and silent blocking (honeypot + Turnstile)
FR31: Epic 5 — No visible CAPTCHA friction for legitimate users
FR32: Epic 2 — i18n layer via next-intl, no hardcoded strings
FR33: Epic 4 — Admin manages translated content fields without code changes
FR34: Epic 2 — Correct locale content served based on active locale
FR35: Epic 2 — Search engine indexing of all public pages (sitemap)
FR36: Epic 2 — Open Graph rich previews on all public URLs
FR37: Epic 2 — Admin routes excluded from search engine indexing (robots.txt)
FR38: Epic 6 — Public GitHub repository accessible from portfolio

## Epic List

### Epic 1: Secure Project Foundation & Authentication
The project scaffold, security architecture, and authentication system are fully in place. Any visitor hitting admin routes is correctly sandboxed at the server level — guest sessions can browse, but writes are blocked server-side regardless of UI state. The developer can authenticate via OAuth and access the admin panel.
**FRs covered:** FR6, FR22, FR23, FR24, FR25, FR26, FR27

### Epic 2: Public Portfolio Shell, Navigation & Design System
A visitor can navigate all portfolio sections via a persistent sidebar, toggle dark/light mode (preference persisted), and experience the full hand-drawn Rough.js aesthetic across every page. All public pages are SEO-indexed with Open Graph metadata and rendered through the i18n layer with no hardcoded strings.
**FRs covered:** FR7, FR8, FR9, FR10, FR32, FR34, FR35, FR36, FR37, FR38

### Epic 3: Overview, Projects, Experience & Data Visualizations
A hiring manager lands on the Overview page and understands the developer's identity within 5 seconds. She can explore Projects with Mapbox geographic context, review the Experience timeline, and discover skills exclusively through chart visualizations. All content is admin-driven with graceful empty and skeleton states.
**FRs covered:** FR1, FR2, FR3, FR4, FR11, FR12, FR13, FR14, FR15

### Epic 4: Admin Content Management
The developer can manage all portfolio content (projects, skills, timeline entries with translatable fields) from any device, including a phone. Changes reflect immediately on the public portfolio. A guest visitor can explore the full admin interface in read-only demo mode — real content, pre-filled forms, saves blocked server-side with a calm "Changes are disabled in demo mode" message.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR33

### Epic 5: Contact Form & Anti-Spam
Any visitor can send a message with zero visible friction — no CAPTCHA puzzle, no file download required. The developer receives the message reliably in their inbox. Bot submissions are silently discarded before delivery.
**FRs covered:** FR5, FR28, FR29, FR30, FR31

### Epic 6: Production Hardening & Observability
The developer can observe portfolio performance in real time (Sentry runtime errors, Vercel Analytics + Speed Insights), Lighthouse ≥90 across all four categories is confirmed, and the public GitHub repository is structured as a readable artifact for technical evaluators.
**FRs covered:** FR38 (GitHub link)
**NFRs addressed:** NFR1, NFR2, NFR3, NFR4, NFR24, NFR25

## Epic 1: Secure Project Foundation & Authentication

The project scaffold, security architecture, and authentication system are fully in place. Any visitor hitting admin routes is correctly sandboxed at the server level — guest sessions can browse, but writes are blocked server-side regardless of UI state. The developer can authenticate via OAuth and access the admin panel.

### Story 1.1: Project Scaffold & Deployable Skeleton

As the developer,
I want the Next.js project initialized with TypeScript, Tailwind, App Router, and continuous deployment to Vercel,
So that I have a deployable foundation with the correct directory structure for all subsequent stories.

**Acceptance Criteria:**

**Given** the existing Dockerfile and docker-compose.yml in the project root
**When** `npx create-next-app@16 . --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"` is run inside the Docker dev container
**Then** the project compiles without errors and `next dev` starts successfully on port 3000

**Given** the initialized project
**When** a commit is pushed to the GitHub repository
**Then** Vercel automatically deploys a preview and the production branch deploys to the configured custom domain

**Given** the project structure
**When** reviewing the file layout
**Then** the `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/i18n/`, and `src/types/` directories exist with placeholder index files
**And** `public/robots.txt` exists and disallows `/admin/*` from search engine indexing
**And** `.env.example` documents all required environment variables with descriptions
**And** a GitHub Actions workflow at `.github/workflows/ci.yml` runs `vitest` before any Vercel deployment

---

### Story 1.2: PostgreSQL Database & Prisma Schema

As the developer,
I want the complete Prisma schema defined with all portfolio models and a local PostgreSQL instance running,
So that all content-related features in subsequent epics have a stable, typed data foundation.

**Acceptance Criteria:**

**Given** the Prisma schema at `prisma/schema.prisma`
**When** `prisma migrate dev` is run
**Then** the following models are created in PostgreSQL: `Project`, `Skill`, `TimelineEntry`, `ContactMessage`, and a `User` model for BetterAuth sessions
**And** translatable fields (`title`, `description`, `body`) are typed as `Json` columns
**And** all model field names use `camelCase` in Prisma schema with `@map("snake_case")` for DB columns

**Given** the Prisma client
**When** importing from `src/lib/prisma.ts`
**Then** a singleton client is returned (no multiple connection instances in development hot-reload)

**Given** the local Docker environment
**When** `docker compose up` is run
**Then** a PostgreSQL 17 instance starts and is accessible to the Next.js app using the `DATABASE_URL` from `.env`

**Given** the Prisma schema
**When** `prisma migrate deploy` runs in the Vercel build step
**Then** all pending migrations are applied to the production database without error

---

### Story 1.3: Guest Session Security Boundary

As a visitor,
I want to access the admin panel without credentials,
So that I can explore the portfolio's admin architecture as a read-only guest.

**Acceptance Criteria:**

**Given** a visitor navigating to any `/admin/*` route without any session
**When** `src/middleware.ts` processes the request
**Then** a cryptographically signed guest token is issued and set as an `httpOnly` cookie
**And** the visitor is allowed to proceed to the admin page (no redirect to a login wall)

**Given** a guest session making a `POST`, `PATCH`, or `DELETE` request to any `/api/admin/*` route
**When** the middleware evaluates the request
**Then** the response is `403 { "error": "Forbidden", "code": "FORBIDDEN" }` — no write operation reaches the database

**Given** a guest token cookie
**When** `verifyGuestToken()` in `src/lib/auth.ts` evaluates it
**Then** the function returns `false` for any token not signed with the server secret, or expired, or structurally invalid

**Given** a guest session cookie and an admin session cookie simultaneously (manipulation attempt)
**When** any `/api/admin/*` write endpoint is called
**Then** the write is still blocked — guest token presence overrides, escalation is architecturally prevented

---

### Story 1.4: Rate Limiting on All API Routes

As the system,
I want rate limiting enforced at the top of every API route handler,
So that the guest session cannot be abused, the contact endpoint cannot be flooded, and admin write endpoints are protected from brute-force attempts.

**Acceptance Criteria:**

**Given** the Upstash Ratelimit wrappers at `src/lib/rate-limit.ts`
**When** any request arrives at any `/api/*` route
**Then** the IP-based rate limit check runs before any business logic executes

**Given** a client exceeding the standard rate limit on a public route
**When** the limit is breached
**Then** the response is `429 { "error": "Too many requests", "code": "RATE_LIMITED" }` with no business logic executed

**Given** a client hitting `/api/contact` or any `/api/admin/*` write endpoint
**When** the stricter rate limit is applied
**Then** the threshold is lower than the standard limit, and the same 429 response shape is returned on breach

**Given** the rate limit implementation
**When** reviewing the code
**Then** the `ratelimit.limit(ip)` call appears as the first statement in every route handler — no exception, no business logic above it

---

### Story 1.5: Admin OAuth Authentication & Email Allowlist

As the developer,
I want to authenticate to the admin panel via a single OAuth click with Google or GitHub,
So that I can securely access full CRUD capabilities with my identity verified server-side against my configured email address.

**Acceptance Criteria:**

**Given** a visitor navigating to `/admin/login` (or triggering auth from any admin-only action)
**When** they click the OAuth login button
**Then** they are redirected to the OAuth provider and return with a valid session upon success

**Given** a successful OAuth callback at `src/app/api/auth/[...betterauth]/route.ts`
**When** the user's email is checked against `process.env.ADMIN_EMAIL`
**Then** if the email matches: an `httpOnly` session cookie is set and the user is redirected to the admin dashboard
**And** if the email does not match: authentication is rejected with a `403` response and no session cookie is issued

**Given** an OAuth provider that is temporarily unavailable
**When** the login attempt fails at the provider level
**Then** a clear error state is displayed to the user — not a blank screen or unhandled exception

**Given** an authenticated admin session
**When** any `/api/admin/*` route handler runs the auth check pattern
**Then** `auth.getSession(request)` returns the session, the email is verified against `ADMIN_EMAIL`, and the request proceeds
**And** the OAuth token is never exposed to the client — only the `httpOnly` session cookie is used

**Given** a session cookie
**When** the admin panel is accessed on a mobile device
**Then** the OAuth session is fully valid — no desktop-only auth flow

---

## Epic 2: Public Portfolio Shell, Navigation & Design System

A visitor can navigate all portfolio sections via a persistent sidebar, toggle dark/light mode (preference persisted), and experience the full hand-drawn Rough.js aesthetic across every page. All public pages are SEO-indexed with Open Graph metadata and rendered through the i18n layer with no hardcoded strings.

### Story 2.1: CSS Design Token System & Typography

As a visitor,
I want the portfolio to have a consistent warm visual identity distinct from standard SaaS templates,
So that the hand-drawn aesthetic registers as a deliberate design choice within the first 200ms of page load.

**Acceptance Criteria:**

**Given** the Tailwind and global CSS configuration
**When** any page renders
**Then** all colors are served exclusively via CSS custom properties matching the dark palette spec (`--bg-base: #1a1814`, `--accent: #e8a020`, and all specified tokens) and light palette (`--bg-base: #f5f0e8`, `--accent: #c87010`, and all specified tokens)
**And** none of the excluded anti-pattern values (`#09090b`, `#18181b`, `#3b82f6`, `#ffffff`, `#000000`) appear anywhere in the stylesheet

**Given** the typography configuration
**When** any text renders
**Then** Space Grotesk is the primary UI typeface and JetBrains Mono is used for monospace contexts
**And** Inter does not appear in any font stack

**Given** the type scale
**When** reviewing Tailwind configuration
**Then** the custom scale is defined: `text-xs` (11px) through `text-3xl` (36px) with the specified weights and line heights
**And** no font-weight below 400 is used anywhere in the UI

---

### Story 2.2: RoughCard Component & Rough.js System

As a visitor,
I want every card and panel in the portfolio to have a consistent hand-drawn border,
So that the sketch aesthetic reads as a deliberate system rather than a partially-applied experiment.

**Acceptance Criteria:**

**Given** the `RoughCard` component at `src/components/shared/RoughCard.tsx`
**When** it renders with any content
**Then** Rough.js is loaded via `next/dynamic` (never at module level)
**And** a rounded rectangle SVG path is rendered with roughness 1.0, bowing 0.4, stroke 1.5px, color matching `--border-default`
**And** the SVG element has `aria-hidden="true"` and `pointer-events: none`, positioned `absolute inset-0`
**And** inner content renders in a `relative z-10` container

**Given** a `RoughCard` mounted and then the viewport resized
**When** a `ResizeObserver` detects the size change
**Then** the Rough.js SVG re-renders to fit the new dimensions, debounced at 100ms

**Given** a `RoughCard` with a `seed` prop matching the component ID
**When** the component re-renders (e.g. due to state update)
**Then** the rough border path is visually identical to the previous render (seed-stable)

**Given** a viewport narrower than 768px (mobile)
**When** `RoughCard` renders
**Then** the roughness parameter is reduced to 0.7

**Given** any card, panel, modal border, button, or form input in the application
**When** reviewing the implementation
**Then** it uses `RoughCard` or the Rough.js SVG border system — no `border` CSS property appears on the same element

---

### Story 2.3: Sidebar Navigation, Dark/Light Mode & Responsive Layout

As a visitor,
I want to navigate between portfolio sections via a persistent sidebar that works on any device, and switch between dark and light modes with my preference remembered,
So that I can explore the portfolio efficiently whether I'm on a desktop or phone.

**Acceptance Criteria:**

**Given** a desktop viewport (1024px+)
**When** any page loads
**Then** the `AdminNavSidebar` is visible at 240px width with icon + text labels for all nav items
**And** the active page item shows amber-muted background, amber text, and a 2px left-edge amber indicator
**And** a Rough.js SVG border appears on the right edge of the sidebar

**Given** a tablet viewport (768px–1023px)
**When** any page loads
**Then** the sidebar automatically collapses to 64px icon-only mode
**And** hovering any nav icon shows a Radix `Tooltip` with the page label

**Given** a mobile viewport (< 768px)
**When** any page loads
**Then** the sidebar is replaced by a bottom navigation bar with 5 primary items (Overview, Projects, Skills, Map, Contact)
**And** Admin is accessible via a hamburger or "more" overflow in the bottom nav
**And** all touch targets are minimum 44×44px
**And** the `nav` element has `aria-label="Portfolio navigation"` and the active item has `aria-current="page"`

**Given** the `ThemeToggle` component
**When** a visitor clicks it
**Then** the color scheme switches between dark and light using CSS custom properties (no class-swap)
**And** the preference is persisted to `localStorage` and restored on the next visit

**Given** a visitor with `prefers-color-scheme: dark`
**When** the portfolio loads for the first time
**Then** dark mode is active by default without any manual action required

**Given** route navigation within the app
**When** a nav item is clicked
**Then** the sidebar does not re-render (persistent shell)
**And** the page content area fades in at 150ms opacity

---

### Story 2.4: next-intl i18n Infrastructure

As the developer,
I want all user-facing strings externalized through next-intl from the very first component,
So that no hardcoded strings exist anywhere and French translations can be added later with zero architectural changes.

**Acceptance Criteria:**

**Given** the next-intl configuration at `src/i18n/config.ts` and `src/i18n/routing.ts`
**When** the app starts
**Then** English (`en`) and French (`fr`) are the configured supported locales, with English as the default

**Given** all UI strings
**When** reviewing any component
**Then** no string literals appear in JSX or component logic — all text is sourced from `en.json` via `useTranslations()` or the server equivalent

**Given** a translation key that exists in `en.json` but not in `fr.json`
**When** the active locale is French
**Then** next-intl falls back to the English value — no blank string, no thrown error

**Given** the `<html>` element
**When** any page renders
**Then** the `lang` attribute reflects the active locale (`lang="en"` or `lang="fr"`)

**Given** the `t(field, locale)` helper at `src/lib/i18n.ts`
**When** called with a `Json` translatable field and a locale string
**Then** it returns `field[locale]` if present, falling back to `field['en']`, then `''` — never throwing

---

### Story 2.5: SEO, Open Graph & Discoverability

As a visitor sharing the portfolio or arriving from a search engine,
I want all public pages to be discoverable and to render rich social previews,
So that links shared on LinkedIn or Slack show a compelling preview card.

**Acceptance Criteria:**

**Given** any public portfolio page (`(public)/*`)
**When** a search engine crawler accesses it
**Then** the page is accessible and included in `app/(public)/sitemap.ts` output
**And** the `<html>` head contains `<title>`, `<meta name="description">`, and canonical URL

**Given** any public portfolio URL shared on LinkedIn, Slack, or Twitter/X
**When** the platform fetches the URL for link preview
**Then** `og:title`, `og:description`, `og:image` (pointing to `public/og-image.png`), and `og:url` are present

**Given** any `/admin/*` route
**When** a search engine crawler or OG scraper accesses it
**Then** the route is excluded from indexing via `robots.txt` and a `noindex` meta tag
**And** the sitemap does not include any admin paths

**Given** the portfolio footer or sidebar
**When** a visitor looks for the source code
**Then** a link to the public GitHub repository is visible and functional

---

### Story 2.6: Shared UI Patterns — Buttons, Toasts, Skeletons & Empty States

As a visitor or developer using the portfolio,
I want consistent, accessible UI feedback patterns across every interaction,
So that save confirmations, loading states, and empty data surfaces all communicate clearly without disrupting the workflow.

**Acceptance Criteria:**

**Given** the three-tier button hierarchy
**When** any button renders
**Then** Primary buttons have a Rough.js border with `--accent` fill on hover; Secondary buttons have a Rough.js border with transparent fill; Ghost/Destructive buttons show `--error` text with no border (visible on parent hover only)
**And** never two Primary buttons appear side by side on the same screen

**Given** any async operation (save, delete, send)
**When** it completes successfully or fails
**Then** a Radix `Toast` appears at bottom-right with the correct message and duration (4s auto-dismiss for success; persistent for errors with retry action)
**And** only one toast is visible at a time — subsequent toasts are queued

**Given** any data surface that is loading
**When** the data has not yet resolved
**Then** a skeleton screen renders (not a spinner) using `--bg-subtle` colored placeholders with the correct dimensions
**And** a pulse animation (opacity 0.5→1.0 at 1.5s cycle) runs unless `prefers-reduced-motion` is set
**And** the skeleton is skipped entirely if data resolves in under 200ms
**And** the loading container has `aria-busy="true"`

**Given** any list or data surface with no records
**When** the data resolves to an empty array
**Then** an empty state renders with the correct message in `--text-muted`, centered, with no illustration
**And** if an action button is specified for the empty state, it renders as a Primary button

---

## Epic 3: Overview, Projects, Experience & Data Visualizations

A hiring manager lands on the Overview page and understands the developer's identity within 5 seconds. She can explore Projects with Mapbox geographic context, review the Experience timeline, and discover skills exclusively through chart visualizations. All content is admin-driven with graceful empty and skeleton states.

### Story 3.1: Overview Page — Ledger Dark Layout

As a hiring manager visiting the portfolio for the first time,
I want to immediately understand who this developer is, what they do, and what to explore next,
So that I can make a snap judgment about whether to invest more time — without needing technical context.

**Acceptance Criteria:**

**Given** a visitor loading the Overview page (`/`)
**When** the page renders
**Then** four `StatCard` components appear in a 4-column CSS Grid above the fold — showing counts for total projects, countries, technologies, and years active — all sourced directly from Prisma via Server Component
**And** each `StatCard` uses the `RoughCard` wrapper, shows a monospace label, a `text-2xl` 700-weight value, and a 2px amber bottom-edge accent strip

**Given** the Overview page below the stat grid
**When** a visitor views it without scrolling on a standard desktop viewport
**Then** a 2-column row is visible: a projects list panel on the left and a map placeholder panel on the right (map renders in Story 3.4)
**And** no bio or personal introduction appears above the stat grid — work content leads

**Given** a non-technical visitor (no technical background)
**When** spending 5 seconds on the Overview page
**Then** they can identify the developer's role and the primary call to action without reading more than the stat cards and page title

**Given** no projects in the database yet
**When** the Overview renders
**Then** the stat cards show `0` values and the projects panel shows the correct empty state: "No projects yet — check back soon."

**Given** a mobile viewport
**When** the Overview renders
**Then** the 4-column stat grid collapses to a 2×2 grid and the 2-column row stacks to single-column

---

### Story 3.2: Projects Page & Public API Routes

As a hiring manager exploring the portfolio,
I want to browse the developer's projects with their geographic context and tech stack details,
So that I can assess the breadth and type of work they've delivered.

**Acceptance Criteria:**

**Given** the Projects page (`/projects`)
**When** a visitor loads it
**Then** all published projects are listed in a 2-column CSS Grid (1-column on mobile), each in a `RoughCard` showing: title, description, tech stack tags, and client region label
**And** data is fetched via Server Component querying Prisma directly (no API hop)

**Given** a project `slug`
**When** a visitor navigates to `/projects/[slug]`
**Then** the full project detail renders with all available fields

**Given** `GET /api/projects`
**When** any client requests it
**Then** the rate limit check runs first, then a direct array of published projects is returned with `camelCase` JSON fields and ISO 8601 dates — no `{ data: }` wrapper
**And** `GET /api/projects/[id]` returns a single project or `404 { "error": "Not found", "code": "PROJECT_NOT_FOUND" }`

**Given** no projects in the database
**When** the Projects page renders
**Then** the empty state displays: "No projects yet — check back soon."

---

### Story 3.3: Experience & Timeline Page

As a hiring manager reviewing the developer's background,
I want to see a clear chronological work history,
So that I can understand their professional arc and depth of experience.

**Acceptance Criteria:**

**Given** the Experience page (`/experience`)
**When** a visitor loads it
**Then** all timeline entries are displayed in reverse-chronological order, each showing: role/title, organisation, date range, and description
**And** data is fetched via Server Component querying `TimelineEntry` from Prisma directly

**Given** timeline entries with translatable `Json` fields
**When** the page renders
**Then** the `t(field, locale)` helper extracts the active locale's content, falling back to English

**Given** no timeline entries in the database
**When** the page renders
**Then** a graceful empty state is shown — not a blank panel

---

### Story 3.4: Interactive Map with Anonymized Client Pins

As a visitor curious about the developer's international experience,
I want to explore an interactive map showing where projects were delivered,
So that I can understand their geographic reach without exposing confidential client details.

**Acceptance Criteria:**

**Given** the map panel on the Overview page and any dedicated map page
**When** Mapbox GL JS initialises (loaded via `next/dynamic` — never at module level)
**Then** project pins render using custom Rough.js SVG path markers (hand-drawn pin shape) positioned via the Mapbox `Marker` API
**And** pin colors reflect project status: `--accent` for active clients, `--success` for completed, `--text-muted` for older

**Given** a visitor hovering or clicking a map pin
**When** the interaction triggers
**Then** a Radix `Tooltip` displays the sector and region label (e.g. "E-commerce · Netherlands") — never the client name or identifying information
**And** the pin scales to 1.15 on hover

**Given** Mapbox GL JS failing to initialise (network error, API key issue)
**When** the map container would otherwise be blank
**Then** a fallback `RoughCard` renders with a graceful message — no blank panel, no console error shown to the user

**Given** a screen reader user navigating the map
**When** they reach the map element
**Then** a visually-hidden structured list of all regions is present in the DOM as a text alternative
**And** the map container has `role="img"` with an `aria-label`

**Given** a visitor with `prefers-reduced-motion`
**When** map pin transitions would animate
**Then** transitions are suppressed — pins render statically

---

### Story 3.5: Skills Visualization — SketchyChart

As a visitor evaluating the developer's technical depth,
I want to explore their skills through an interactive hand-drawn chart,
So that I can assess technical breadth without reading a generic skills list.

**Acceptance Criteria:**

**Given** the Skills page (`/skills`)
**When** it loads
**Then** the `SketchyChart` component renders via `next/dynamic` (never at module level) using roughViz.js or Chart.js with the roughjs plugin
**And** chart bars/segments have fill opacity 0.85, giving a hand-filled appearance
**And** no static skills list exists anywhere on the page or in the codebase

**Given** a visitor hovering a chart segment
**When** the hover triggers
**Then** the hovered segment is highlighted, all others dim to 0.4 opacity, and a Radix `Tooltip` shows the skill name, proficiency level, and years used

**Given** a keyboard user navigating the chart
**When** they Tab through the page
**Then** focus cycles through chart segments in order, each with a visible focus ring
**And** pressing Enter or Space on a focused segment opens the same tooltip as hover

**Given** a screen reader user
**When** they reach the chart
**Then** the chart has `role="img"` and an `aria-label` describing its purpose
**And** a visually-hidden data table lists all skills with their proficiency and years — same data as the chart

**Given** the chart loading
**When** data has not yet resolved
**Then** a skeleton renders with bars at 0 height and the standard `RoughCard` border
**And** on mount, bars animate up to their target height — unless `prefers-reduced-motion` is set, in which case they render at full height immediately

**Given** no skills in the database
**When** the Skills page renders
**Then** the empty state displays: "No skills data — add skills in the admin."

---

## Epic 4: Admin Content Management

The developer can manage all portfolio content (projects, skills, timeline entries with translatable fields) from any device, including a phone. Changes reflect immediately on the public portfolio. A guest visitor can explore the full admin interface in read-only demo mode — real content, pre-filled forms, saves blocked server-side with a calm "Changes are disabled in demo mode" message.

### Story 4.1: Admin Dashboard Shell & DemoBadge

As a visitor clicking Admin from the sidebar,
I want to land directly in a live admin dashboard without any login prompt,
So that I can immediately explore the portfolio's admin architecture as a credibility signal.

**Acceptance Criteria:**

**Given** a guest session navigating to `/admin`
**When** the admin layout at `src/app/admin/layout.tsx` renders
**Then** the admin dashboard loads with no redirect, no login wall, and no explanation modal
**And** the `DemoBadge` component is visible in the topbar: font-mono, text-xs, amber text on amber-muted background, reading "Demo mode"
**And** the `DemoBadge` has `aria-live="polite"` so it is announced to screen readers when the session state changes

**Given** an authenticated admin session
**When** the admin layout renders
**Then** the `DemoBadge` is not rendered — no "Demo mode" indicator for the owner

**Given** the admin dashboard home (`/admin`)
**When** any session (guest or owner) views it
**Then** content counts (total projects, skills, timeline entries) are displayed, sourced from Prisma via Server Component

**Given** the admin sidebar
**When** a guest visitor navigates between admin sections (Projects, Skills, Experience)
**Then** navigation works freely — no sections are locked or hidden from guests
**And** the Admin nav section uses the same visual language as the public sidebar (same tokens, same aesthetic)

---

### Story 4.2: Project Admin CRUD

As the developer,
I want to create, update, and delete projects through the admin panel,
So that the portfolio content stays current without any code changes or deployments.

**Acceptance Criteria:**

**Given** `POST /api/admin/projects`
**When** an authenticated admin submits a new project
**Then** the rate limit check runs first, then the auth check, then the project is created in Prisma
**And** `revalidatePath()` is called for the public projects path after a successful write
**And** the response is `201` with the created project object (no `{ data: }` wrapper)

**Given** `PATCH /api/admin/projects/[id]` and `DELETE /api/admin/projects/[id]`
**When** an authenticated admin updates or deletes a project
**Then** the same rate limit → auth check → Prisma write → `revalidatePath()` sequence runs
**And** the public portfolio reflects the change on next page load without a deployment

**Given** a guest session calling any write endpoint (`POST`, `PATCH`, `DELETE`) on `/api/admin/projects`
**When** the request reaches the middleware
**Then** the response is `403 { "error": "Forbidden", "code": "FORBIDDEN" }` — Prisma is never called

**Given** the admin projects list page (`/admin/projects`)
**When** the developer views it
**Then** all projects are listed with Edit and Delete actions per row
**And** Edit opens a Radix `Dialog` with the project form pre-filled with existing values
**And** Delete triggers a Radix `AlertDialog` — "Delete [project name]?" — requiring explicit confirmation before the API call fires

**Given** a guest visitor clicking Edit on a project row
**When** the form modal opens
**Then** all form inputs are interactive and pre-filled — the guest can freely inspect the data structure
**And** clicking Save triggers the request which returns `403` server-side
**And** the UI shows the Toast: "Changes are disabled in demo mode" (4s auto-dismiss)

**Given** a failed admin save (network error, server error)
**When** the API returns a non-2xx response
**Then** a persistent error Toast appears: "Failed to save — Retry" with a retry action
**And** no silent data loss occurs — the form state is preserved for retry

---

### Story 4.3: Skills & Timeline Admin CRUD

As the developer,
I want to manage my skills and professional timeline entries through the admin panel,
So that the skills chart and experience page always reflect my current situation.

**Acceptance Criteria:**

**Given** `POST /api/admin/skills`, `PATCH /api/admin/skills/[id]`, `DELETE /api/admin/skills/[id]`
**When** an authenticated admin writes to these endpoints
**Then** rate limit → auth check → Prisma write → `revalidatePath('/skills')` runs in sequence
**And** guest session writes return `403` as with projects

**Given** `POST /api/admin/timeline`, `PATCH /api/admin/timeline/[id]`, `DELETE /api/admin/timeline/[id]`
**When** an authenticated admin writes to these endpoints
**Then** the same pattern applies and `revalidatePath('/experience')` is called

**Given** the admin skills list and timeline list pages
**When** the developer views them
**Then** each list has Edit (Radix `Dialog`, pre-filled form) and Delete (Radix `AlertDialog` confirmation) actions
**And** the skills list includes the proficiency level and years fields used to populate the `SketchyChart`

**Given** no skills or timeline entries yet
**When** the respective admin list pages render
**Then** the correct empty state with a "Add your first [item] →" primary button is shown

---

### Story 4.4: Translatable Content Fields

As the developer,
I want to add French translations for project titles and descriptions directly in the admin forms,
So that the portfolio is ready to serve French content without any code changes when the time comes.

**Acceptance Criteria:**

**Given** any admin form for a content type with translatable fields (Project, Skill, TimelineEntry)
**When** the form renders
**Then** the primary fields (English title, description) are visible by default
**And** a collapsed accordion labeled "French translation (optional)" is present below the primary fields
**And** the accordion is collapsed by default — expanding it reveals `title_fr` and `description_fr` inputs

**Given** a developer saving a record without filling in the French fields
**When** the form is submitted
**Then** the save succeeds — empty French fields are valid at save time

**Given** a `Json` translatable field in Prisma (e.g. `title: { en: "...", fr: "..." }`)
**When** a public page renders and calls `t(field, locale)`
**Then** the English value is returned when locale is `en`
**And** the French value is returned when locale is `fr` and the field is populated
**And** English is returned as fallback if the French value is absent

**Given** the `LocaleTabPanel` component in admin forms
**When** it renders
**Then** it shows the EN/FR toggle clearly, and switching tabs shows the corresponding translation input fields

---

### Story 4.5: Mobile Admin Forms & Image Upload

As the developer updating the portfolio from a phone on a Sunday evening,
I want to add a new project in under 90 seconds using only my thumb,
So that the portfolio never goes stale because updating it is too inconvenient.

**Acceptance Criteria:**

**Given** an authenticated admin on a mobile viewport (< 768px)
**When** they open the new project form
**Then** the `MobileAdminForm` layout renders: all inputs full-width and stacked vertically, minimum 48px touch target height on all inputs

**Given** the tech stack tag field on mobile
**When** the developer types a tag name and presses Enter (or comma)
**Then** the tag is added as a pill in a scrollable horizontal row
**And** tapping the × on any pill removes it — no drag-and-drop required

**Given** the Save button on mobile
**When** the required fields are not yet complete
**Then** the Save button is disabled and remains sticky at the bottom of the viewport

**Given** the required fields all completed
**When** the developer taps Save
**Then** optimistic UI updates the project list immediately while the server request is in flight
**And** a success Toast appears on confirmation: "Project saved"
**And** on error, a persistent retry Toast appears and the form state is preserved

**Given** `POST /api/admin/images`
**When** an authenticated admin uploads an image file
**Then** the file is uploaded to Vercel Blob server-side using `BLOB_READ_WRITE_TOKEN`
**And** the returned blob URL is stored in the project's Prisma record
**And** the image is served via Vercel CDN from the stored URL
**And** `DELETE /api/admin/images` removes the blob and clears the field

---

### Story 4.6: Admin Filter Bars & Accessibility

As the developer managing a growing list of projects and skills,
I want to filter and search admin lists quickly,
So that I can find and edit specific entries without scrolling through everything.

**Acceptance Criteria:**

**Given** the admin projects list and skills list pages
**When** the developer views them
**Then** a filter bar appears above the list with: a debounced text search (300ms), a region dropdown, and a tech tag filter

**Given** one or more active filters
**When** filters are applied
**Then** active filters are shown as removable pills below the filter bar
**And** a "Clear all" link appears and removes all filters when clicked
**And** filter state is persisted in the URL query string — the filtered view is shareable and back-button-safe

**Given** active filters that match no records
**When** the filtered list resolves
**Then** the message "No projects match your filters." appears with a "Clear filters" link
**And** this state is visually distinct from the empty state (no records at all)

**Given** any admin form (create or edit)
**When** a required field is left empty and the input loses focus
**Then** an inline error message appears below the field in `--error` color, font-mono, text-xs
**And** the Rough.js border on that input re-renders in `--error` color

**Given** a dirty admin form (unsaved changes) and the developer clicks Cancel
**When** the Cancel action triggers
**Then** a Radix `AlertDialog` asks: "Discard changes?" with a Discard (destructive) and Keep Editing (primary) button
**And** if the form is clean (no changes), Cancel navigates away immediately without confirmation

---

## Epic 5: Contact Form & Anti-Spam

Any visitor can send a message with zero visible friction — no CAPTCHA puzzle, no file download required. The developer receives the message reliably in their inbox. Bot submissions are silently discarded before delivery.

### Story 5.1: Contact Page & Form UI

As any visitor wanting to reach the developer,
I want a simple, frictionless contact form I can complete on any device,
So that I can send a message without downloading anything or solving a puzzle.

**Acceptance Criteria:**

**Given** the Contact page (`/contact`)
**When** a visitor loads it
**Then** three fields are visible: Name, Email, and Message — each with a Radix `Label` and `Input`/`Textarea` with a Rough.js border
**And** no CV download link, no file attachment option, and no visible CAPTCHA widget are present

**Given** a visitor interacting with the form
**When** a field loses focus (blur)
**Then** inline validation runs: an error message in `--error` color appears below the field if invalid, the Rough.js border re-renders in error color
**And** the Submit button is disabled until all required fields are valid

**Given** a visitor submitting the form
**When** the Submit button is clicked
**Then** the button enters a loading state (spinner, `aria-busy="true"`, inputs disabled) while the request is in flight

**Given** a successful submission
**When** the server confirms delivery
**Then** the form fades out and a confirmation message fades in: "Message sent. Expect a reply within 2 days."
**And** no further action is required from the visitor

**Given** a submission that fails (server error, email delivery failure)
**When** the API returns a non-2xx response
**Then** a Toast notification appears: "Something went wrong — please try again."
**And** the form is re-enabled with all field values preserved for retry

---

### Story 5.2: Bot Protection — Honeypot & Cloudflare Turnstile

As the developer,
I want bot submissions silently blocked before they reach my inbox,
So that I receive only genuine messages without any friction imposed on real visitors.

**Acceptance Criteria:**

**Given** the `ContactForm` component
**When** it renders
**Then** a honeypot field is present in the DOM positioned off-screen (`position: absolute; left: -9999px`) — never visible to real users
**And** the Cloudflare Turnstile widget is loaded in invisible mode — no challenge box, no user interaction required

**Given** a real human visitor submitting the form
**When** Turnstile auto-validates the session
**Then** the Submit button becomes available with no visible action required from the visitor

**Given** `POST /api/contact` receiving a submission with the honeypot field populated
**When** the server-side honeypot check runs
**Then** the submission is silently discarded — a fake success response is returned to the client, giving no signal to the bot that detection occurred

**Given** `POST /api/contact` receiving a submission that fails Turnstile server-side verification
**When** the Turnstile token is invalid or missing
**Then** the submission is rejected at the API layer — never passed to Resend

**Given** the Turnstile script failing to load (network issue, script blocked)
**When** the visitor attempts to submit
**Then** the form remains submittable — graceful degradation with honeypot still enforced at the API layer

---

### Story 5.3: Email Delivery via Resend

As the developer,
I want contact form submissions delivered reliably to my inbox,
So that I never miss a genuine inquiry from a potential employer or client.

**Acceptance Criteria:**

**Given** `POST /api/contact` receiving a valid submission (honeypot clean, Turnstile verified, rate limit not exceeded)
**When** the server processes the request
**Then** the strict rate limit check runs first, followed by honeypot check, Turnstile verification, then `src/lib/email.ts` sends the message via Resend
**And** the ContactMessage is stored in Prisma before the Resend call — no submission is lost if email delivery fails

**Given** Resend successfully delivering the email
**When** the API call returns success
**Then** the server responds `200` to the client and the confirmation UI is shown

**Given** Resend failing to deliver (API error, rate limit on Resend's side)
**When** the delivery call throws
**Then** the server responds with an error status that surfaces to the visitor as a retry prompt — the submission is not silently dropped
**And** the ContactMessage record in Prisma remains so the developer can retrieve it from the admin panel

**Given** `GET /api/admin/contact-messages` (admin-only, rate limited, auth-checked)
**When** an authenticated admin views the messages section
**Then** all stored ContactMessage records are listed — providing a fallback inbox if email delivery fails

---

## Epic 6: Production Hardening & Observability

The developer can observe portfolio performance in real time (Sentry runtime errors, Vercel Analytics + Speed Insights), Lighthouse ≥90 across all four categories is confirmed, and the public GitHub repository is structured as a readable artifact for technical evaluators.

### Story 6.1: Sentry Error Tracking & error.tsx Boundaries

As the developer running a live portfolio,
I want runtime errors captured automatically and surfaced in Sentry,
So that I know immediately when something breaks — before a hiring manager encounters it.

**Acceptance Criteria:**

**Given** `sentry.client.config.ts` and `sentry.server.config.ts` configured with the project DSN
**When** any unhandled exception occurs on the client or server
**Then** Sentry captures it with full stack trace, breadcrumbs, and request context

**Given** a route segment that throws an unhandled error
**When** Next.js invokes the nearest `error.tsx` boundary
**Then** a user-friendly error page renders — not a blank screen or raw stack trace
**And** the error is captured in Sentry automatically via SDK instrumentation

**Given** a failed admin write operation
**When** the API returns a non-2xx response
**Then** the error is surfaced explicitly to the administrator via the Toast system — no silent failure

**Given** the root `error.tsx`
**When** it renders
**Then** it matches the portfolio's visual language (design tokens, Rough.js borders) — not a default Next.js error page

---

### Story 6.2: Vercel Analytics, Speed Insights & Web Vitals

As the developer,
I want Core Web Vitals and page analytics tracked automatically,
So that I can verify the portfolio meets the Lighthouse ≥90 NFR and monitor real-user performance over time.

**Acceptance Criteria:**

**Given** `@vercel/analytics` and `@vercel/speed-insights` initialised in `src/app/layout.tsx`
**When** any visitor loads any page
**Then** page view events are recorded in Vercel Analytics
**And** Core Web Vitals (LCP, INP, CLS) are reported to Vercel Speed Insights for real-user monitoring

**Given** the Vercel Speed Insights dashboard
**When** reviewing data after the first week of traffic
**Then** LCP is consistently < 2.5s, INP < 200ms, and CLS < 0.1

**Given** admin routes (`/admin/*`)
**When** a guest or owner visits them
**Then** admin page views are recorded but clearly distinguishable from public page views in the analytics dashboard

---

### Story 6.3: Lighthouse Audit & Performance Optimisation

As the developer preparing to share the portfolio with hiring managers,
I want all public pages to score ≥90 across all four Lighthouse categories,
So that the portfolio signals production-grade quality to technical evaluators who inspect it.

**Acceptance Criteria:**

**Given** all public pages (`/`, `/projects`, `/projects/[slug]`, `/experience`, `/skills`, `/contact`)
**When** a Lighthouse audit is run on a standard desktop connection
**Then** every page scores ≥90 in Performance, Accessibility, Best Practices, and SEO

**Given** the Overview page on a simulated 4G mobile connection
**When** Time to Interactive is measured
**Then** TTI is ≤3 seconds

**Given** Mapbox GL JS and Rough.js
**When** any page that does not use them is loaded
**Then** neither library appears in the page bundle — confirmed via Lighthouse bundle analysis

**Given** chart libraries rendering client-side
**When** the page loads before the chart data resolves
**Then** CLS is < 0.1 — skeleton containers prevent layout shift

**Given** all public page images
**When** served to visitors
**Then** `next/image` is used with appropriate `sizes` props per breakpoint — no oversized images

---

### Story 6.4: WCAG 2.1 AA Verification & Accessibility Audit

As any visitor using assistive technology,
I want every page of the portfolio to be fully navigable and understandable without a mouse or visual display,
So that the portfolio is accessible to all visitors and demonstrates production-grade accessibility standards.

**Acceptance Criteria:**

**Given** all public-facing pages and the admin panel
**When** `axe-core` via `jest-axe` runs in the CI test suite
**Then** zero accessibility violations are reported across all page renders

**Given** a keyboard-only user navigating the portfolio
**When** they Tab through any page
**Then** every interactive element receives a visible focus ring (2px solid `--accent`, 2px offset)
**And** no element uses `outline: none` without a replacement focus indicator
**And** the skip link (`Skip to content`) is the first focusable element on every page

**Given** all color combinations in the dark and light palettes
**When** contrast ratios are measured independently for each mode
**Then** every text/background combination meets WCAG AA (minimum 4.5:1 for body text) — verified separately for dark and light, not assumed from the other mode

**Given** all Rough.js SVG elements
**When** a screen reader traverses the page
**Then** every decorative SVG has `aria-hidden="true"` — no accessibility tree pollution

**Given** a VoiceOver (macOS/iOS) or NVDA (Windows/Chrome) user
**When** they navigate to the Skills chart or Map page
**Then** the visually-hidden data table (Skills) and region list (Map) are announced correctly, providing full information equivalence

---

### Story 6.5: Public GitHub Repository as Readable Artifact

As a technical evaluator reviewing the portfolio before an interview,
I want to inspect the public source code repository directly from the portfolio,
So that I can assess the developer's architectural decisions, code quality, and commit history without asking for access.

**Acceptance Criteria:**

**Given** the portfolio sidebar or footer
**When** a visitor clicks the GitHub repository link
**Then** they are taken to the public repository — accessible without a GitHub account

**Given** the repository README
**When** a technical evaluator reads it on a cold visit
**Then** it explains the project structure, key architectural decisions (guest session security, i18n approach, Rough.js system), and how to run the project locally

**Given** the repository directory structure
**When** a technical evaluator browses it
**Then** the layout matches the architecture document exactly — no undocumented directories, no leftover scaffolding files

**Given** the commit history
**When** reviewed from the initial scaffold commit forward
**Then** commits are logically ordered and have clear, meaningful messages — the history tells a coherent story of the build
