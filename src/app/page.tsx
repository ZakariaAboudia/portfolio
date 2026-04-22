import { getLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import PageHeading from '@/components/shared/PageHeading'
import StatCard from '@/components/portfolio/StatCard'
import OverviewProjectsList from '@/components/portfolio/OverviewProjectsList'
import MapWithPinsDynamic from '@/components/portfolio/MapWithPinsDynamic'
import { getOverviewStats, getRecentProjects, getAllProjectsList } from '@/lib/overview-stats'
import { getMapPins } from '@/lib/map-pins'

export default async function Home() {
  const [locale, t, stats, recentProjects, mapPins, allProjects] = await Promise.all([
    getLocale(),
    getTranslations('overview'),
    getOverviewStats(),
    getRecentProjects(5),
    getMapPins(),
    getAllProjectsList(await getLocale()),
  ])

  return (
    <main className="p-6 flex flex-col gap-6">
      <PageHeading>{t('title')}</PageHeading>

      {/* Annotation-style stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4 border-y border-border-subtle">
        <StatCard label={t('statProjects')} value={stats.projects} ariaLabel={`${stats.projects} ${t('statProjects')}`} />
        <StatCard label={t('statCountries')} value={stats.countries} ariaLabel={`${stats.countries} ${t('statCountries')}`} />
        <StatCard label={t('statTechnologies')} value={stats.technologies} ariaLabel={`${stats.technologies} ${t('statTechnologies')}`} />
        <StatCard label={t('statYearsActive')} value={stats.yearsActive} ariaLabel={`${stats.yearsActive} ${t('statYearsActive')}`} />
      </div>

      {/* 2-col row — stacks on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OverviewProjectsList
          projects={recentProjects}
          locale={locale}
          heading={t('recentProjects')}
          emptyMessage={t('emptyProjects')}
        />
        <MapWithPinsDynamic
            pins={mapPins}
            projects={allProjects}
            ariaLabel="World map showing project locations"
            fallbackMessage="Map unavailable — check back soon."
            className="min-h-[200px]"
          />
      </div>
    </main>
  )
}
