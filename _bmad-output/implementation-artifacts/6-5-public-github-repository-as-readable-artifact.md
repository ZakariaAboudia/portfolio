# Story 6.5: Public GitHub Repository as Readable Artifact

Status: done

## Notes

GitHub link already implemented in AdminNavSidebar.tsx:
- process.env.NEXT_PUBLIC_GITHUB_URL controls visibility
- Link renders in sidebar bottom area when env var is set
- Opens in new tab with rel="noopener noreferrer"
- aria-label for accessibility

## File List

- `src/components/shared/AdminNavSidebar.tsx` — already includes GitHub link
