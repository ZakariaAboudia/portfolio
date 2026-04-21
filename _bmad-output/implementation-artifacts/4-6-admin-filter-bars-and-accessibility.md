# Story 4.6: Admin Filter Bars & Accessibility

Status: done

## Notes

FilterBar uses URL query string for shareable filter state.
Debounced search (300ms via setTimeout).
Active filters shown as removable pills with "Clear all" link.
Inline form validation on blur with error messages below fields.
AlertDialog for delete confirmation, Dialog for edit forms.

## File List

- `src/components/admin/FilterBar.tsx` — NEW
- `src/app/admin/projects/page.tsx` — MODIFY (FilterBar + server-side filtering)
- `src/app/admin/skills/page.tsx` — MODIFY (FilterBar + server-side filtering)
