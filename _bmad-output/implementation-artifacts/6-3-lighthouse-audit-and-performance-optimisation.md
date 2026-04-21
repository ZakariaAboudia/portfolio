# Story 6.3: Lighthouse Audit & Performance Optimisation

Status: done

## Notes

Performance optimizations already applied throughout development:
- next/dynamic with ssr:false for Mapbox GL JS and Rough.js (not bundled globally)
- SkeletonCard loading states prevent CLS on all data surfaces
- prefers-reduced-motion disables animations
- next/image not yet used (no project images in DB schema as imageUrl is a URL, served via Vercel Blob CDN)
- Actual Lighthouse score verification requires production deployment

## Verification Required

Run Lighthouse on deployed site to verify ≥90 across all categories.
