# Story 2.4: next-intl i18n Infrastructure

Status: review

## Story

As the developer,
I want all user-facing strings externalized through next-intl from the very first component,
so that no hardcoded strings exist anywhere and French translations can be added later with zero architectural changes.

## Acceptance Criteria

1. **Given** the next-intl configuration at `src/i18n/config.ts` and `src/i18n/routing.ts`
   **When** the app starts
   **Then** English (`en`) and French (`fr`) are the configured supported locales, with English as the default

2. **Given** all UI strings
   **When** reviewing any component
   **Then** no string literals appear in JSX or component logic — all text is sourced from `en.json` via `useTranslations()` (client) or `getTranslations()` (server)

3. **Given** a translation key that exists in `en.json` but not in `fr.json`
   **When** the active locale is French
   **Then** next-intl falls back to the English value — no blank string, no thrown error

4. **Given** the `<html>` element
   **When** any page renders
   **Then** the `lang` attribute reflects the active locale (`lang="en"` or `lang="fr"`)

5. **Given** the `t(field, locale)` helper at `src/lib/i18n.ts`
   **When** called with a `TranslatableField` Json value and a locale string
   **Then** it returns `field[locale]` if present, falling back to `field['en']`, then `''` — never throwing

## Tasks / Subtasks

- [x] Task 1: Install next-intl (AC: #1–#4)
  - [x] `npm install next-intl` — confirms installable from dry-run output
  - [x] Verify `node_modules/next-intl` is present and version >= 3.x

- [x] Task 2: Create i18n config files (AC: #1, #3)
  - [x] `src/i18n/config.ts` — export `locales`, `Locale` type, `defaultLocale`
  - [x] `src/i18n/routing.ts` — `defineRouting({ locales, defaultLocale, localePrefix: 'never' })`
  - [x] `src/i18n/request.ts` — `getRequestConfig` resolving locale from `requestLocale`, fallback to `defaultLocale`

- [x] Task 3: Create message files (AC: #2, #3)
  - [x] `src/i18n/messages/en.json` — all strings from ALL existing components (see complete key list in Dev Notes)
  - [x] `src/i18n/messages/fr.json` — empty object `{}` (next-intl falls back to en automatically)

- [x] Task 4: Create `src/lib/i18n.ts` — `t()` helper (AC: #5)
  - [x] Implement `t(field: TranslatableField | null | undefined, locale: string): string`
  - [x] Import `TranslatableField` from `@/types/prisma`
  - [x] Never throw — return `''` on null/undefined field

- [x] Task 5: Update `next.config.ts` (AC: #1)
  - [x] Wrap config with `createNextIntlPlugin('./src/i18n/request.ts')`

- [x] Task 6: Update root `layout.tsx` (AC: #4, #2)
  - [x] Make layout `async` Server Component
  - [x] Import `getLocale`, `getMessages` from `next-intl/server`
  - [x] Add `NextIntlClientProvider messages={messages}` wrapping body content
  - [x] Set `lang={locale}` on `<html>` from `getLocale()`
  - [x] Replace hardcoded `metadata` with `generateMetadata()` using `getTranslations('metadata')`

- [x] Task 7: Update `AdminNavSidebar.tsx` (AC: #2)
  - [x] Add `useTranslations('nav')` — client component, inside the component function
  - [x] Move `PRIMARY_NAV` and `ADMIN_NAV` definitions inside component body (they reference `t()`)
  - [x] Replace all hardcoded label strings with `t(key)` calls
  - [x] Replace 'Portfolio navigation' aria-label with `t('portfolioNavigation')`
  - [x] Replace 'More navigation items' aria-label with `t('moreNavigationItems')`
  - [x] Replace 'More' label with `t('more')`
  - [x] Replace 'Portfolio' / 'P' wordmark with `t('portfolio')` / `t('portfolioInitial')`

- [x] Task 8: Update `DemoBadge.tsx` (AC: #2)
  - [x] Add `useTranslations('demo')` — replace 'Demo mode' with `t('badge')`

- [x] Task 9: Update `ThemeToggle.tsx` (AC: #2)
  - [x] Add `useTranslations('theme')` — replace aria-label strings with `t('switchToLight')` / `t('switchToDark')`

- [x] Task 10: Update `src/app/page.tsx` (AC: #2)
  - [x] Use `getTranslations('home')` — replace `<h1>Portfolio</h1>` with `t('title')`

- [x] Task 11: Update `admin/login/page.tsx` (AC: #2)
  - [x] Use `getTranslations('login')` — replace ERROR_MESSAGES object, 'Admin Login' title

- [x] Task 12: Update `admin/login/_components/LoginButtons.tsx` (AC: #2)
  - [x] Add `useTranslations('login')` — replace button text strings

- [x] Task 13: Update tests (AC: #1–#5)
  - [x] `src/test/i18n.test.ts` — new test file covering:
    - `en.json` and `fr.json` exist and are valid JSON
    - `en.json` has required top-level keys (nav, theme, demo, home, login, metadata)
    - `t()` helper: returns en value, falls back from fr to en, returns '' on null, never throws
  - [x] Update `sidebar-nav.test.tsx` — remove source-level string checks for hardcoded labels; add check for `useTranslations` import instead
  - [x] Update `design-tokens.test.ts` if it checks layout.tsx for `lang="en"` literal

## Dev Notes

### next-intl Approach: Without URL Routing

**Do NOT restructure `src/app/` into `[locale]` route groups.** Use `localePrefix: 'never'` — locale determined from `requestLocale` (Accept-Language header) with fallback to `'en'`. URLs stay clean (`/`, `/projects`, etc.). This is the correct approach for this portfolio.

### next-intl API (v3.x)

```ts
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const nextConfig: NextConfig = {}
export default withNextIntl(nextConfig)
```

```ts
// src/i18n/config.ts
export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
```

```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'
export const routing = defineRouting({ locales, defaultLocale, localePrefix: 'never' })
```

```ts
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
```

```tsx
// src/app/layout.tsx (async Server Component)
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return { title: t('title'), description: t('description') }
}

export default async function RootLayout({ children }) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} ...>
      <head>...</head>
      <body ...>
        <NextIntlClientProvider messages={messages}>
          {/* AdminNavSidebar, topbar, PageTransition, children */}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

```tsx
// Client components — inside component function body only
const t = useTranslations('nav') // or 'theme', 'demo', 'login'
```

```tsx
// Server components (async functions)
const t = await getTranslations('home') // or 'login', 'metadata'
```

### Complete `en.json` Key Structure

```json
{
  "metadata": {
    "title": "Portfolio",
    "description": "Developer portfolio"
  },
  "nav": {
    "overview": "Overview",
    "projects": "Projects",
    "experience": "Experience",
    "skills": "Skills",
    "map": "Map",
    "contact": "Contact",
    "admin": "Admin",
    "portfolio": "Portfolio",
    "portfolioInitial": "P",
    "more": "More",
    "moreNavigationItems": "More navigation items",
    "portfolioNavigation": "Portfolio navigation"
  },
  "theme": {
    "switchToLight": "Switch to light mode",
    "switchToDark": "Switch to dark mode"
  },
  "demo": {
    "badge": "Demo mode"
  },
  "home": {
    "title": "Portfolio"
  },
  "login": {
    "title": "Admin Login",
    "signInWithGoogle": "Sign in with Google",
    "signInWithGitHub": "Sign in with GitHub",
    "errors": {
      "unauthorized": "That email address is not authorized to access the admin panel.",
      "oauthError": "OAuth provider error. Please try again.",
      "default": "An error occurred during sign-in. Please try again."
    }
  }
}
```

### `fr.json`
Empty object `{}` — next-intl reads `errorMessages: 'use-default-message'` from config to fall back to `en.json`. Confirm the correct next-intl fallback config for v3.x and set `fallback: 'en'` if needed in `getRequestConfig`.

### `src/lib/i18n.ts` — t() Helper

```ts
import type { TranslatableField } from '@/types/prisma'

export function t(field: TranslatableField | null | undefined, locale: string): string {
  if (!field) return ''
  return field[locale as keyof TranslatableField] ?? field.en ?? ''
}
```

`TranslatableField` is `{ en: string; fr?: string }` from `src/types/prisma.ts`. Do NOT use the Prisma `Json` primitive directly — use `TranslatableField` which is already typed correctly.

### AdminNavSidebar.tsx Refactor

`PRIMARY_NAV` and `ADMIN_NAV` must move inside the component body because their labels come from `t()`. The `NavItemDef` interface stays unchanged — `label: string` is still correct (receives the translated string).

```tsx
export default function AdminNavSidebar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  // ... existing refs/state ...

  const PRIMARY_NAV: NavItemDef[] = [
    { href: '/',           label: t('overview'),   Icon: IconOverview,   exactMatch: true },
    { href: '/projects',   label: t('projects'),   Icon: IconProjects },
    { href: '/experience', label: t('experience'), Icon: IconExperience },
    { href: '/skills',     label: t('skills'),     Icon: IconSkills },
    { href: '/map',        label: t('map'),         Icon: IconMap },
    { href: '/contact',    label: t('contact'),    Icon: IconContact },
  ]
  const ADMIN_NAV: NavItemDef = { href: '/admin', label: t('admin'), Icon: IconAdmin }
  // ... rest of component unchanged ...
}
```

### Existing Test Impact

`sidebar-nav.test.tsx` reads source of `AdminNavSidebar.tsx` and currently checks for hardcoded label strings. After this story, those strings move to `en.json`. Update the test to check for `useTranslations` import rather than literal label strings.

`design-tokens.test.ts` — check if it asserts `lang="en"` literal in layout source. If so, update to check for `lang={locale}` instead.

### Failing Test Pattern to Avoid

Do NOT call `useTranslations()` at module level or outside a component/hook. It must be called inside the component function body. Moving `PRIMARY_NAV` inside the component is mandatory.

### Architecture Compliance

- `src/lib/i18n.ts` location confirmed in architecture doc (architecture.md line 457)
- `src/i18n/config.ts` and `src/i18n/routing.ts` confirmed (architecture.md lines 463–464)
- `t()` helper signature from architecture.md lines 337–341
- `TranslatableField` type from `src/types/prisma.ts` — use this, not raw `Json`
- Next.js App Router: root layout wraps with `NextIntlClientProvider`; no `[locale]` directory needed

### File Locations (exact paths)

```
src/i18n/config.ts          — NEW
src/i18n/routing.ts         — NEW
src/i18n/request.ts         — NEW
src/i18n/messages/en.json   — NEW (was empty dir)
src/i18n/messages/fr.json   — NEW
src/lib/i18n.ts             — NEW
next.config.ts              — MODIFY (add plugin)
src/app/layout.tsx          — MODIFY (async, NextIntlClientProvider, dynamic lang, generateMetadata)
src/components/shared/AdminNavSidebar.tsx  — MODIFY (useTranslations, nav labels inside component)
src/components/shared/DemoBadge.tsx        — MODIFY (useTranslations)
src/components/shared/ThemeToggle.tsx      — MODIFY (useTranslations)
src/app/page.tsx                           — MODIFY (getTranslations)
src/app/admin/login/page.tsx               — MODIFY (getTranslations, error messages)
src/app/admin/login/_components/LoginButtons.tsx — MODIFY (useTranslations)
src/test/i18n.test.ts       — NEW
src/test/sidebar-nav.test.tsx — MODIFY (label string checks → useTranslations import check)
```

### Project Structure Notes

- `src/i18n/messages/` directory already exists (created in Story 1.1) — just add files inside
- No `[locale]` route groups — `localePrefix: 'never'` keeps all existing routes intact
- `next.config.ts` currently has empty config — safe to wrap with plugin

### References

- [Source: epics.md#Story 2.4]
- [Source: architecture.md#i18n — lines 50, 117, 211, 337–341, 462–467, 505, 552]
- [Source: types/prisma.ts — TranslatableField type]
- [Source: ux-design-specification.md#UX-DR17 — lang attribute on html element]
- [Source: epics.md#NFR23 — missing translation keys fall back to English without error]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Installed next-intl 4.9.1 (v4, not v3 — API identical for all used features)
- Used `localePrefix: 'never'` — no `[locale]` URL route restructure; existing app structure preserved
- `fr.json` is empty `{}` — next-intl v4 falls back to `en` automatically for missing keys
- `AdminNavSidebar`: moved PRIMARY_NAV + ADMIN_NAV inside component body (required — `useTranslations` can't be module-level)
- `generateMetadata()` in layout.tsx replaces static `metadata` export — uses `getTranslations('metadata')`
- `NextIntlClientProvider` wraps entire body content with explicit `locale` and `messages` props
- Render tests updated to use `renderWithIntl()` helper wrapping with `NextIntlClientProvider locale="en" messages={enMessages}`
- Pre-existing TS error in `auth-admin.test.ts:43` (unrelated to this story) — zero new TS errors introduced
- 146 tests pass (22 new in i18n.test.ts, all sidebar-nav tests updated and passing)

### File List

- `package.json` — added next-intl 4.9.1 dependency
- `package-lock.json` — updated
- `next.config.ts` — wrapped with createNextIntlPlugin
- `src/i18n/config.ts` — NEW: locales, Locale type, defaultLocale
- `src/i18n/routing.ts` — NEW: defineRouting with localePrefix: 'never'
- `src/i18n/request.ts` — NEW: getRequestConfig with locale fallback
- `src/i18n/messages/en.json` — NEW: all UI strings (6 namespaces)
- `src/i18n/messages/fr.json` — NEW: empty object (en fallback)
- `src/lib/i18n.ts` — NEW: t(field, locale) helper for TranslatableField
- `src/app/layout.tsx` — async Server Component, NextIntlClientProvider, dynamic lang, generateMetadata
- `src/app/page.tsx` — getTranslations('home') replaces hardcoded title
- `src/app/admin/login/page.tsx` — getTranslations('login') replaces error messages and title
- `src/app/admin/login/_components/LoginButtons.tsx` — useTranslations('login') replaces button text
- `src/components/shared/AdminNavSidebar.tsx` — useTranslations('nav'), nav arrays moved inside component
- `src/components/shared/DemoBadge.tsx` — useTranslations('demo')
- `src/components/shared/ThemeToggle.tsx` — useTranslations('theme')
- `src/test/i18n.test.ts` — NEW: 22 tests covering message files, t() helper, config/routing exports
- `src/test/sidebar-nav.test.tsx` — updated: source checks use translation keys, render tests use renderWithIntl()
