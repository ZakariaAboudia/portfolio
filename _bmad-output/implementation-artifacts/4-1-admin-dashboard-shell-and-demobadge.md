# Story 4.1: Admin Dashboard Shell & DemoBadge

Status: done

## Story

As a visitor clicking Admin from the sidebar,
I want to land directly in a live admin dashboard without any login prompt,
So that I can immediately explore the portfolio's admin architecture as a credibility signal.

## Acceptance Criteria

1. **Given** a guest session navigating to `/admin`
   **When** the admin layout renders
   **Then** the admin dashboard loads with no redirect and `DemoBadge` is visible

2. **Given** an authenticated admin session
   **When** the admin layout renders
   **Then** `DemoBadge` is NOT rendered

3. **Given** the admin dashboard home
   **When** any session views it
   **Then** content counts (projects, skills, timeline entries) are displayed from Prisma

4. **Given** the admin sidebar
   **When** on any `/admin/*` route
   **Then** admin sub-nav items (Projects, Skills, Timeline) appear

## Dev Agent Record

### File List

- `src/lib/auth-server.ts` — NEW
- `src/app/layout.tsx` — MODIFY (conditional DemoBadge)
- `src/app/admin/layout.tsx` — MODIFY (metadata only, pass-through)
- `src/app/admin/page.tsx` — NEW (dashboard with counts)
- `src/components/shared/AdminNavSidebar.tsx` — MODIFY (admin sub-nav)
- `src/i18n/messages/en.json` — MODIFY (admin + nav keys)
- `src/test/admin-shell.test.ts` — NEW
