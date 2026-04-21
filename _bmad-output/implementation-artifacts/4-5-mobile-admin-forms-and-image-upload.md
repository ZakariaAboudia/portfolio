# Story 4.5: Mobile Admin Forms & Image Upload

Status: done

## Notes

All admin forms use full-width stacked layout, min-h-[44px] touch targets.
TagInput uses scrollable horizontal pill row for tech stack.
Save button disabled until required fields valid (sticky bottom).
Image upload route uses @vercel/blob put() server-side.

## File List

- `src/app/api/admin/images/route.ts` — NEW (POST upload + DELETE)
- `src/components/admin/TagInput.tsx` — NEW (mobile-friendly pill row)
- Admin forms: full-width stacked, 44px min touch targets
