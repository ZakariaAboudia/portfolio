import { getLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import TimelineEntryCard from '@/components/portfolio/TimelineEntryCard'
import EmptyState from '@/components/shared/EmptyState'
import PageHeading from '@/components/shared/PageHeading'

export default async function ExperiencePage() {
  const [locale, t, entries] = await Promise.all([
    getLocale(),
    getTranslations('experience'),
    prisma.timelineEntry.findMany({ orderBy: { startDate: 'desc' } }),
  ])

  return (
    <main className="p-6 flex flex-col gap-6">
      <PageHeading>{t('title')}</PageHeading>
      {entries.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <div className="flex flex-col gap-8">
          {entries.map(entry => (
            <TimelineEntryCard
              key={entry.id}
              entry={entry}
              locale={locale}
              presentLabel={t('present')}
            />
          ))}
        </div>
      )}
    </main>
  )
}
