# Story 3.4: Interactive Map with Anonymized Client Pins

Status: review

## Story

As a visitor curious about the developer's international experience,
I want to explore an interactive map showing where projects were delivered,
So that I can understand their geographic reach without exposing confidential client details.

## Acceptance Criteria

1. **Given** the map panel on the Overview page and any dedicated map page
   **When** Mapbox GL JS initialises (loaded via `next/dynamic` — never at module level)
   **Then** project pins render using custom Rough.js SVG path markers (hand-drawn pin shape) positioned via the Mapbox `Marker` API
   **And** pin colors reflect project status: `--accent` for active clients, `--success` for completed, `--text-muted` for older

2. **Given** a visitor hovering or clicking a map pin
   **When** the interaction triggers
   **Then** a Radix `Tooltip` displays the sector and region label — never the client name
   **And** the pin scales to 1.15 on hover

3. **Given** Mapbox GL JS failing to initialise (network error, API key issue)
   **When** the map container would otherwise be blank
   **Then** a fallback `RoughCard` renders with a graceful message

4. **Given** a screen reader user navigating the map
   **When** they reach the map element
   **Then** a visually-hidden structured list of all regions is present as a text alternative
   **And** the map container has `role="img"` with an `aria-label`

5. **Given** a visitor with `prefers-reduced-motion`
   **When** map pin transitions would animate
   **Then** transitions are suppressed — pins render statically

## Tasks / Subtasks

- [x] Task 1: Install packages
  - [x] `npm install react-map-gl @radix-ui/react-tooltip`
  - [x] `mapbox-gl` already installed (v3.22.0)

- [x] Task 2: Create region → coordinates lookup (AC: #1)
  - [x] `src/lib/region-coords.ts` — exports `getRegionCoords(region: string): [number, number] | null`
  - [x] Lookup table of ~20 common regions/countries → `[lng, lat]` pairs
  - [x] Returns `null` if region not in lookup (pin skipped)
  - [x] Example entries: `'Netherlands': [4.9, 52.37]`, `'France': [2.35, 48.85]`, `'United States': [-98, 38.9]`, `'United Kingdom': [-0.12, 51.5]`, `'Germany': [13.4, 52.5]`, `'Belgium': [4.35, 50.85]`, `'Canada': [-75, 45.4]`, `'Australia': [151.2, -33.87]`, `'Singapore': [103.82, 1.35]`, `'Japan': [139.69, 35.68]`, `'India': [77.2, 28.6]`, `'Brazil': [-47.9, -15.78]`

- [x] Task 3: Create pin data helper (AC: #1)
  - [x] `src/lib/map-pins.ts` — `getMapPins()` server function
  - [x] Query: `prisma.project.findMany({ where: { published: true }, select: { clientRegion: true, createdAt: true } })`
  - [x] Group by `clientRegion`, compute color tier per region based on most recent project's `createdAt`:
    - < 2 years → `'accent'`
    - 2–4 years → `'success'`
    - 4+ years → `'muted'`
  - [x] Filter out regions with no coords in lookup
  - [x] Return `Array<{ region: string; lng: number; lat: number; colorTier: 'accent' | 'success' | 'muted'; seed: number }>`
  - [x] `seed`: stable per-region (e.g. `region.split('').reduce((a,c) => a + c.charCodeAt(0), 0)`)

- [x] Task 4: Create `RoughPin` marker component (AC: #1, #5)
  - [x] `src/components/portfolio/RoughPin.tsx` — `'use client'`
  - [x] Props: `colorTier: 'accent' | 'success' | 'muted'`, `seed: number`, `reducedMotion: boolean`
  - [x] SVG 24×36, uses rough.js (dynamic import in `useEffect`) to draw pin path:
    `M12,2 C6.5,2 2,6.5 2,12 C2,20 12,34 12,34 C12,34 22,20 22,12 C22,6.5 17.5,2 12,2 Z`
  - [x] Color map: `accent` → CSS var `var(--accent)`, `success` → `var(--success)`, `muted` → `var(--text-muted)`
  - [x] Rough.js options: `{ fill: color, fillStyle: 'solid', stroke: color, roughness: 0.8, bowing: 0.5, seed }`
  - [x] Fallback (rough.js load failure): plain SVG `<circle cx="12" cy="12" r="10" fill={color} />`
  - [x] Scale on hover via parent button's CSS: NOT in this component — handled in MapWithPins

- [x] Task 5: Create `MapWithPins` client component (AC: #1–#5)
  - [x] `src/components/portfolio/MapWithPins.tsx` — `'use client'`
  - [x] Props: `pins: MapPin[]`, `ariaLabel: string`, `fallbackMessage: string`, `className?: string`
  - [x] Import pattern: `import { Map, Marker } from 'react-map-gl/mapbox'` (react-map-gl v8 uses this subpath)
  - [x] Import CSS: `import 'mapbox-gl/dist/mapbox-gl.css'`
  - [x] `NEXT_PUBLIC_MAPBOX_TOKEN` from `process.env` — if missing, show fallback immediately
  - [x] Wrap in try/catch + `onError` handler → show `<RoughCard>` fallback on failure
  - [x] Map config: `mapStyle="mapbox://styles/mapbox/dark-v11"`, `initialViewState={{ longitude: 10, latitude: 30, zoom: 1.5 }}`
  - [x] Each pin: `<Marker longitude={pin.lng} latitude={pin.lat}>` with inner `<Tooltip.Root>`
  - [x] `prefers-reduced-motion`: inline `useState`+`useEffect`
  - [x] Screen reader: visually-hidden `<ul>` below map div listing all pin regions
  - [x] Map container: `<div role="img" aria-label={ariaLabel}>` wrapping `<Map>`
  - [x] `<Tooltip.Provider>` wraps all markers

- [x] Task 6: Create dynamic export wrapper (AC: #1, #3)
  - [x] `src/components/portfolio/MapWithPinsDynamic.tsx` — Server-safe wrapper
  - [x] `export default dynamic(() => import('./MapWithPins'), { ssr: false, loading: () => <SkeletonCard /> })`
  - [x] This is the component imported by pages — never import `MapWithPins` directly

- [x] Task 7: Create `/map` page and update Overview (AC: #1–#5)
  - [x] `src/app/map/page.tsx` — async Server Component
  - [x] Fetches `getMapPins()` + `getTranslations('map')`
  - [x] Passes pins to `<MapWithPinsDynamic>`
  - [x] Full-width map: `className="h-[calc(100vh-3.5rem)]"` (fills content area below topbar)
  - [x] i18n: add `"map"` namespace to `en.json`: `{ "title": "Map", "ariaLabel": "World map showing project locations", "fallback": "Map unavailable — check back soon.", "empty": "No project locations yet." }`
  - [x] Update `src/app/page.tsx`: replace `<MapPlaceholder>` with `<MapWithPinsDynamic>` using same pin data
  - [x] Overview map panel: `className="min-h-[200px]"`

- [x] Task 8: Tests (AC: #1–#5)
  - [x] `src/test/map.test.ts` — source checks:
    - `region-coords.ts` exists, contains at least 10 region entries, exports `getRegionCoords`
    - `map-pins.ts` exists, contains `getMapPins`, `colorTier`, `published: true`
    - `RoughPin.tsx` exists, contains `roughjs` dynamic import, `var(--accent)`, `var(--success)`, `reducedMotion`
    - `MapWithPins.tsx` exists, contains `role="img"`, `visually-hidden` or `sr-only`, `Tooltip`, `react-map-gl`, `prefers-reduced-motion`
    - `MapWithPinsDynamic.tsx` exists, contains `ssr: false`
    - `map/page.tsx` exists, contains `getMapPins`
    - `en.json` has `map.ariaLabel`, `map.fallback`
  - [x] Unit test `getRegionCoords`: known region returns coords, unknown returns null

## Dev Notes

### react-map-gl v8 Import Path

react-map-gl v8 uses subpath imports for Mapbox GL JS:
```ts
import { Map, Marker } from 'react-map-gl/mapbox'
```
NOT `from 'react-map-gl'` (that's for MapLibre). Always use the `/mapbox` subpath.

### Mapbox CSS

Must import `mapbox-gl/dist/mapbox-gl.css` in the `MapWithPins` client component:
```ts
import 'mapbox-gl/dist/mapbox-gl.css'
```
This only works in client components — CSS imports in server components have limitations.

### Fallback Logic

Two fallback scenarios:
1. **No token**: `if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN)` → render fallback immediately (no map attempt)
2. **Map init error**: `onError` prop on `<Map>` component + `useState(error)` → render fallback `<RoughCard>` replacing map

```tsx
const [mapError, setMapError] = useState(false)
if (mapError || !token) return <RoughCard ...><p>{fallbackMessage}</p></RoughCard>
<Map onError={() => setMapError(true)} ... />
```

### `prefers-reduced-motion` Hook

Inline in `MapWithPins.tsx`:
```ts
const [reducedMotion, setReducedMotion] = useState(false)
useEffect(() => {
  setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}, [])
```
`useState(false)` default — safe for SSR (no hydration mismatch since component is `ssr: false`).

### Screen Reader List

```tsx
<ul className="sr-only" aria-label="Project locations list">
  {pins.map(p => <li key={p.region}>{p.region}</li>)}
</ul>
```
Place OUTSIDE the `role="img"` div (elements inside `role="img"` are hidden from AT).

### Radix Tooltip Provider

`Tooltip.Provider` must wrap all `Tooltip.Root` instances. Put it at the top of `MapWithPins` render, outside the `Map` component:

```tsx
<Tooltip.Provider delayDuration={200}>
  <div role="img" aria-label={ariaLabel}>
    <Map ...>
      {pins.map(pin => <Marker ...><Tooltip.Root>...</Tooltip.Root></Marker>)}
    </Map>
  </div>
  <ul className="sr-only">...</ul>
</Tooltip.Provider>
```

### Pin Color CSS Values

Read CSS variables at render time — safe in client component:
```ts
const COLOR_MAP = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  muted: 'var(--text-muted)',
}
```

### Overview Page Map Panel Height

The 2-col row on overview page has `min-h-[200px]` on the map panel. The `MapWithPinsDynamic` needs `className="min-h-[200px]"` passed through so the map container has height.

### Map Style

Use `mapbox://styles/mapbox/dark-v11` — matches warm dark palette. No custom style required.

### File Locations

```
src/lib/region-coords.ts                        — NEW
src/lib/map-pins.ts                             — NEW
src/components/portfolio/RoughPin.tsx           — NEW
src/components/portfolio/MapWithPins.tsx        — NEW
src/components/portfolio/MapWithPinsDynamic.tsx — NEW
src/app/map/page.tsx                            — NEW
src/app/page.tsx                                — MODIFY (replace MapPlaceholder)
src/i18n/messages/en.json                       — MODIFY (map namespace)
src/test/map.test.ts                            — NEW
```

### Story 3-3 Learnings Applied

- Parallel `Promise.all` for all server data
- `EmptyState` (no action) for public empty states
- Source-level tests primary pattern; avoid DB mocking
- `'use client'` components with dynamic import pattern: create a separate `*Dynamic.tsx` wrapper

### References

- [Source: epics.md#Story 3.4 + UX-DR8]
- [Source: architecture.md — next/dynamic, Mapbox isolation, never module-level import]
- [Source: src/components/shared/RoughCard.tsx — fallback card pattern]
- [Source: src/components/shared/Skeleton.tsx — SkeletonCard for loading state]
- [Source: src/components/portfolio/RoughPin.tsx — rough.js dynamic import pattern from RoughButton]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- `region-coords.ts`: 20-entry lookup table, `getRegionCoords` returns `[lng, lat] | null`
- `map-pins.ts`: `getMapPins()` groups by clientRegion, picks most-recent project per region for colorTier, stable seed via charCode sum
- `RoughPin.tsx`: `'use client'`, roughjs `path()` dynamic import in `useEffect`, fallback circle SVG on failure, `as any` cast needed for roughjs path typings
- `MapWithPins.tsx`: `react-map-gl/mapbox` subpath, Radix Tooltip.Provider, `role="img"`, `sr-only` list outside img div, inline `prefers-reduced-motion` hook, RoughCard fallback on no-token or map error
- `MapWithPinsDynamic.tsx`: `next/dynamic({ ssr: false, loading: SkeletonCard })`
- `map/page.tsx`: parallel fetch getMapPins + getTranslations, full-height map layout
- `en.json`: `map` namespace added (title, ariaLabel, fallback, empty)
- `page.tsx`: MapPlaceholder replaced with MapWithPinsDynamic, getMapPins added to parallel fetch
- `overview.test.ts`: MapPlaceholder check updated to MapWithPinsDynamic
- 30 new tests in `map.test.ts`; 318 total passing

### File List

- `src/lib/region-coords.ts` — NEW
- `src/lib/map-pins.ts` — NEW
- `src/components/portfolio/RoughPin.tsx` — NEW
- `src/components/portfolio/MapWithPins.tsx` — NEW
- `src/components/portfolio/MapWithPinsDynamic.tsx` — NEW
- `src/app/map/page.tsx` — NEW
- `src/app/page.tsx` — MODIFY (MapPlaceholder → MapWithPinsDynamic, getMapPins added)
- `src/i18n/messages/en.json` — MODIFY (map namespace)
- `src/test/map.test.ts` — NEW (30 tests)
- `src/test/overview.test.ts` — MODIFY (MapPlaceholder → MapWithPinsDynamic check)
