import { getLocale, getTranslations } from 'next-intl/server'
import { getMapPins } from '@/lib/map-pins'
import { getAllProjectsList } from '@/lib/overview-stats'
import MapWithPinsDynamic from '@/components/portfolio/MapWithPinsDynamic'

export default async function MapPage() {
  const locale = await getLocale()
  const [t, pins, allProjects] = await Promise.all([
    getTranslations('map'),
    getMapPins(),
    getAllProjectsList(locale)
  ])

  return (
    <main className="flex flex-col h-[calc(100vh-3.5rem)]">
      <MapWithPinsDynamic
        pins={pins}
        projects={allProjects}
        ariaLabel={t('ariaLabel')}
        fallbackMessage={t('fallback')}
        className="flex-1"
      />
    </main>
  )
}
