# Story 4.4: Translatable Content Fields

Status: done

## Notes

LocaleTabPanel component provides EN/FR tab toggle in all admin forms.
ProjectForm and TimelineForm both include LocaleTabPanel with EN/FR fields.
API routes accept `title: { en: string; fr?: string }` JSON format.
Public pages call `t(field, locale)` helper (src/lib/i18n.ts) to extract locale.

## File List

- `src/components/admin/LocaleTabPanel.tsx` — NEW
- `src/components/admin/ProjectForm.tsx` — uses LocaleTabPanel
- `src/components/admin/TimelineForm.tsx` — uses LocaleTabPanel
