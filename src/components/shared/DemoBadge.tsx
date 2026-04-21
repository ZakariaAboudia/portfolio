'use client'

import { useTranslations } from 'next-intl'

// Shown in guest sessions. Session check wired in Story 4-1 (requires BetterAuth).
// For now: always visible — will be conditionally rendered once admin auth is in place.
export default function DemoBadge() {
  const t = useTranslations('demo')
  return (
    <span
      aria-live="polite"
      className="
        sketchy
        font-mono text-xs
        text-accent bg-accent-muted
        px-2 py-0.5 rounded
        select-none
      "
    >
      {t('badge')}
    </span>
  )
}
