# Story 4.2: Project Admin CRUD

Status: done

## File List

- `src/app/api/admin/projects/route.ts` — NEW (GET + POST)
- `src/app/api/admin/projects/[id]/route.ts` — NEW (PATCH + DELETE)
- `src/app/admin/projects/page.tsx` — NEW (admin list with FilterBar)
- `src/app/admin/projects/_components/ProjectList.tsx` — NEW (client component)
- `src/components/admin/ProjectForm.tsx` — NEW (form with LocaleTabPanel + TagInput)
- `src/components/admin/LocaleTabPanel.tsx` — NEW (EN/FR tab toggle)
- `src/components/admin/TagInput.tsx` — NEW (pill-based tag input)
- `src/components/admin/FilterBar.tsx` — NEW (debounced search + region filter)
- `src/test/admin-projects.test.ts` — NEW
