# Story 2.1: CSS Design Token System & Typography

Status: review

## Story

As a visitor,
I want the portfolio to have a consistent warm visual identity distinct from standard SaaS templates,
So that the hand-drawn aesthetic registers as a deliberate design choice within the first 200ms of page load.

## Acceptance Criteria

1. **Given** the Tailwind and global CSS configuration
   **When** any page renders
   **Then** all colors are served via CSS custom properties matching the dark palette spec (`--bg-base: #1a1814`, `--accent: #e8a020`, and all tokens) and light palette (`--bg-base: #f5f0e8`, `--accent: #c87010`, and all tokens)
   **And** anti-pattern values (`#09090b`, `#18181b`, `#3b82f6`, `#ffffff`, `#000000`) do not appear in the stylesheet

2. **Given** the typography configuration
   **When** any text renders
   **Then** Space Grotesk is the primary UI typeface and JetBrains Mono is used for monospace contexts
   **And** Inter does not appear in any font stack

3. **Given** the type scale
   **When** reviewing Tailwind configuration
   **Then** custom scale: `text-xs` (11px) → `text-3xl` (36px) with specified weights and line heights
   **And** no font-weight below 400 is used anywhere in the UI

## Tasks / Subtasks

- [x] Task 1: Load fonts via `next/font/google` in root layout (AC: #2)
  - [x] Load Space Grotesk (weights 400, 500, 600, 700) and JetBrains Mono (weights 400, 500)
  - [x] Expose as CSS variables `--font-ui` and `--font-mono`
  - [x] Remove any Inter/Geist reference from layout and globals.css

- [x] Task 2: Define CSS custom property design tokens in `src/app/globals.css` (AC: #1)
  - [x] Dark palette `:root` tokens (default — dark-first)
  - [x] Light palette `.light` class tokens
  - [x] Media query `prefers-color-scheme: light` also applies light tokens

- [x] Task 3: Define Tailwind v4 `@theme` in globals.css — color utilities + type scale (AC: #1, #3)
  - [x] Map Tailwind color utilities to CSS custom properties
  - [x] Override font-size scale: text-xs (11px) through text-3xl (36px) per spec
  - [x] Set font-sans/mono to CSS variable references

- [x] Task 4: Update root `layout.tsx` — apply fonts, dark-mode class strategy (AC: #2)
  - [x] Apply font CSS variables to `<html>` element via next/font variables
  - [x] Set `dark` class on `<html>` (dark-first default)
  - [x] Removed Geist fonts from scaffold

- [x] Task 5: Write tests verifying token structure (AC: #1, #2, #3)
  - [x] Verify globals.css contains all required tokens
  - [x] Verify no anti-pattern color values in globals.css
  - [x] Verify type scale entries (text-xs through text-3xl)

## Dev Notes

### Dark Palette (`:root` default)

```css
--bg-base: #1a1814;
--bg-surface: #242018;
--bg-elevated: #2e2a22;
--bg-subtle: #332e25;
--text-primary: #f5f0e8;
--text-secondary: #a89f8c;
--text-muted: #6b6257;
--accent: #e8a020;
--accent-hover: #f0b030;
--accent-muted: #3d2d0a;
--border-default: #3a342a;
--border-subtle: #2a2520;
--success: #4a9465;
--error: #c45c3a;
--font-ui: var(--font-space-grotesk), system-ui, sans-serif;
--font-mono: var(--font-jetbrains-mono), monospace;
```

### Light Palette (`.light` class + `prefers-color-scheme: light`)

```css
--bg-base: #f5f0e8;
--bg-surface: #ede8de;
--bg-elevated: #e4ddd2;
--bg-subtle: #dbd3c6;
--text-primary: #1a1814;
--text-secondary: #5c5248;
--text-muted: #9c9080;
--accent: #c87010;
--accent-hover: #b86010;
--accent-muted: #f5e4c0;
--border-default: #ccc4b4;
--border-subtle: #ddd6c8;
--success: #2d7a4f;
--error: #b44020;
```

### Type Scale

| Tailwind class | Size | Weight | Line Height |
|---|---|---|---|
| text-xs | 11px / 0.6875rem | 400 | 1.5 |
| text-sm | 13px / 0.8125rem | 400–500 | 1.5 |
| text-base | 15px / 0.9375rem | 400 | 1.6 |
| text-lg | 18px / 1.125rem | 500–600 | 1.4 |
| text-xl | 22px / 1.375rem | 600 | 1.3 |
| text-2xl | 28px / 1.75rem | 700 | 1.2 |
| text-3xl | 36px / 2.25rem | 700 | 1.15 |

### Tailwind Color Utilities Mapping

```ts
colors: {
  'bg-base': 'var(--bg-base)',
  'bg-surface': 'var(--bg-surface)',
  'bg-elevated': 'var(--bg-elevated)',
  'bg-subtle': 'var(--bg-subtle)',
  'text-primary': 'var(--text-primary)',   // used as bg-text-primary for bg, text-text-primary confusing
  // Use semantic names: accent, border-default, etc.
  accent: 'var(--accent)',
  'accent-hover': 'var(--accent-hover)',
  'accent-muted': 'var(--accent-muted)',
  'border-default': 'var(--border-default)',
  'border-subtle': 'var(--border-subtle)',
  success: 'var(--success)',
  error: 'var(--error)',
}
```

### Tailwind v4 Note

Tailwind v4 uses `@theme` in CSS instead of `tailwind.config.ts`. Create `tailwind.config.ts` only if Tailwind v4 supports it, otherwise define custom scale via `@theme` in globals.css.

### References

- [Source: ux-design-specification.md#Color System]
- [Source: ux-design-specification.md#Typography System]
- [Source: ux-design-specification.md#Type Scale]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Tailwind v4 `@theme inline` used (no tailwind.config.ts)
- `.light` class + `@media (prefers-color-scheme: light)` combined selector for light palette
- `--font-ui`/`--font-mono` defined in `:root`, referenced in `@theme inline`
- Dark-first: `dark` class on `<html>` in layout.tsx
- 27 design token tests all pass; total 72 tests passing
- Build clean with `NODE_ENV=production npx next build`

### File List

- `src/app/globals.css` — full rewrite: design tokens + Tailwind v4 @theme
- `src/app/layout.tsx` — Space Grotesk + JetBrains Mono via next/font/google, dark class
- `src/test/design-tokens.test.ts` — 27 tests covering tokens, anti-patterns, typography, type scale
