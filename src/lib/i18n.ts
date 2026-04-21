import type { TranslatableField } from '@/types/prisma'

export function t(field: TranslatableField | null | undefined, locale: string): string {
  if (!field) return ''
  return field[locale as keyof TranslatableField] ?? field.en ?? ''
}
