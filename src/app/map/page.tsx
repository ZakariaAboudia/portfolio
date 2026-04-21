import { getTranslations } from 'next-intl/server'
import { getMapPins } from '@/lib/map-pins'
import MapWithPinsDynamic from '@/components/portfolio/MapWithPinsDynamic'

export default async function MapPage() {
  const [t, pins] = await Promise.all([
    getTranslations('map'),
    getMapPins(),
  ])

  return (
    <main className="flex flex-col h-[calc(100vh-3.5rem)]">
      <MapWithPinsDynamic
        pins={pins}
        ariaLabel={t('ariaLabel')}
        fallbackMessage={t('fallback')}
        className="flex-1"
      />
    </main>
  )
}
