export type { Project, Skill, TimelineEntry, ContactMessage, User, Session, Account, Verification, EntryType } from '@prisma/client'

// Shape: { en: string; fr?: string } — t(field, locale) in src/lib/i18n.ts extracts active locale
export type TranslatableField = {
  en: string
  fr?: string
}
