# Story 2.3: Sidebar Navigation, Dark/Light Mode & Responsive Layout

Status: review

## Story

As a visitor,
I want to navigate between portfolio sections via a persistent sidebar that works on any device, and switch between dark and light modes with my preference remembered,
So that I can explore the portfolio efficiently whether I'm on a desktop or phone.

## Acceptance Criteria

1. **Given** a desktop viewport (1024px+)
   **When** any page loads
   **Then** the `AdminNavSidebar` is visible at 240px width with icon + text labels for all nav items
   **And** the active page item shows amber-muted background, amber text, and a 2px left-edge amber indicator
   **And** a Rough.js SVG border appears on the right edge of the sidebar

2. **Given** a tablet viewport (768px–1023px)
   **When** any page loads
   **Then** the sidebar automatically collapses to 64px icon-only mode
   **And** hovering any nav icon shows a `Tooltip` with the page label

3. **Given** a mobile viewport (< 768px)
   **When** any page loads
   **Then** the sidebar is replaced by a bottom navigation bar with 5 primary items (Overview, Projects, Skills, Map, Contact)
   **And** Admin is accessible via a "more" overflow in the bottom nav
   **And** all touch targets are minimum 44×44px
   **And** the `nav` element has `aria-label="Portfolio navigation"` and the active item has `aria-current="page"`

4. **Given** the `ThemeToggle` component
   **When** a visitor clicks it
   **Then** the color scheme switches between dark and light using CSS custom properties
   **And** the preference is persisted to `localStorage` and restored on the next visit

5. **Given** a visitor with `prefers-color-scheme: dark`
   **When** the portfolio loads for the first time
   **Then** dark mode is active by default without any manual action required

6. **Given** route navigation within the app
   **When** a nav item is clicked
   **Then** the sidebar does not re-render (persistent shell)
   **And** the page content area fades in at 150ms opacity

## Tasks / Subtasks

- [x] Task 1: Update `globals.css` — fix light mode selector + add fade-in animation (AC: #4, #6)
  - [x] Replace `.light, @media { :root {} }` with `:root.light {}` + `@media { :root:not(.force-dark) {} }`
  - [x] Add `@keyframes page-fade-in` + `.page-fade-in` class

- [x] Task 2: Implement `ThemeToggle` component (AC: #4, #5)
  - [x] `src/components/shared/ThemeToggle.tsx`
  - [x] Toggle `.light` class on `<html>`, persist to `localStorage`
  - [x] Read `prefers-color-scheme` as system default on first visit

- [x] Task 3: Implement `DemoBadge` component (AC: UI only)
  - [x] `src/components/shared/DemoBadge.tsx`
  - [x] font-mono, text-xs, accent text on accent-muted bg, `aria-live="polite"`

- [x] Task 4: Implement `AdminNavSidebar` (AC: #1, #2, #3)
  - [x] `src/components/shared/AdminNavSidebar.tsx`
  - [x] Responsive: `hidden md:flex md:w-16 lg:w-60`
  - [x] Active state: accent-muted bg + accent text + 2px left indicator
  - [x] Hover: text-primary + bg-elevated
  - [x] Native `title` attr tooltip for collapsed mode (Radix tooltip when installed)
  - [x] Rough.js right-edge SVG border (CSS fallback when roughjs absent)
  - [x] `aria-label="Portfolio navigation"`, `aria-current="page"`

- [x] Task 5: Implement `MobileBottomNav` + mobile overflow (AC: #3)
  - [x] Inline in `AdminNavSidebar` — fixed bottom bar for <768px
  - [x] 5 primary items + Admin in overflow; 44×44px touch targets

- [x] Task 6: Implement `PageTransition` wrapper (AC: #6)
  - [x] `src/components/shared/PageTransition.tsx`
  - [x] `key={pathname}` triggers fade-in on route change

- [x] Task 7: Update root `layout.tsx` — shell with sidebar + topbar (AC: #1–#6)
  - [x] Inline FOIT-prevention script in `<head>`
  - [x] Add `AdminNavSidebar`, topbar (ThemeToggle + DemoBadge), `PageTransition`

- [x] Task 8: Tests (AC: #1–#6)
  - [x] ThemeToggle source checks
  - [x] AdminNavSidebar source/render checks
  - [x] DemoBadge render check

## Dev Notes

### Light Mode CSS Strategy

- `:root` → dark tokens (default)
- `:root.light` → light tokens (manual or JS-applied)
- `@media (prefers-color-scheme: light) { :root:not(.force-dark) {} }` — system preference
- Inline `<script>` in `<head>` prevents FOIT for light-preference users

### Radix Tooltip Note

`@radix-ui/react-tooltip` not in npm cache — not installable offline. Tooltips implemented via HTML `title` attribute (accessible via keyboard via browser). Will be upgraded to Radix Tooltip when network available.

### References

- [Source: ux-design-specification.md#UX-DR5, UX-DR6, UX-DR11, UX-DR21, UX-DR22]
- [Source: epics.md#Story 2.3]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Removed Tailwind `dark` class from `<html>` — dark is `:root` default via CSS custom properties; `dark:` Tailwind utilities not used
- Light mode CSS uses `:root.light` (manual) + `@media { :root:not(.force-dark) }` (system); removes ambiguous `.light, @media {}` combo from Story 2-1
- Design token test updated: `applies dark class to html element` → checks `:root` dark default + FOIT script
- Radix Tooltip not in npm cache; `title` attribute used for collapsed sidebar tooltips
- `roughjs` `RoughGenerator` type stub extended with `line()` method for sidebar edge border
- 124 tests pass; build clean

### File List

- `src/app/globals.css` — updated light mode selectors + page-fade-in animation
- `src/app/layout.tsx` — shell with AdminNavSidebar, topbar, PageTransition, FOIT script
- `src/components/shared/AdminNavSidebar.tsx` — sidebar + mobile bottom nav
- `src/components/shared/ThemeToggle.tsx` — dark/light toggle with localStorage persistence
- `src/components/shared/DemoBadge.tsx` — demo mode indicator
- `src/components/shared/PageTransition.tsx` — 150ms fade on route change
- `src/types/roughjs.d.ts` — added `line()` to RoughGenerator type
- `src/test/design-tokens.test.ts` — updated dark-first test
- `src/test/sidebar-nav.test.tsx` — 36 tests
