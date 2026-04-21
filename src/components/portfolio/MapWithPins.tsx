'use client'

import { useState, useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Map, Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import RoughCard from '@/components/shared/RoughCard'
import RoughPin from '@/components/portfolio/RoughPin'
import type { MapPin } from '@/lib/map-pins'

interface MapWithPinsProps {
  pins: MapPin[]
  ariaLabel: string
  fallbackMessage: string
  className?: string
}

export default function MapWithPins({ pins, ariaLabel, fallbackMessage, className = '' }: MapWithPinsProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const [mapError, setMapError] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  if (mapError || !token) {
    return (
      <RoughCard className={`flex items-center justify-center min-h-[200px] ${className}`} padding="p-6">
        <p className="text-text-muted text-sm text-center">{fallbackMessage}</p>
      </RoughCard>
    )
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div role="img" aria-label={ariaLabel} className={`relative ${className}`}>
        <Map
          mapboxAccessToken={token}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          initialViewState={{ longitude: 10, latitude: 30, zoom: 1.5 }}
          style={{ width: '100%', height: '100%' }}
          onError={() => setMapError(true)}
        >
          {pins.map(pin => (
            <Marker key={pin.region} longitude={pin.lng} latitude={pin.lat}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    aria-label={pin.region}
                    className={reducedMotion ? '' : 'hover:scale-[1.15] transition-transform'}
                  >
                    <RoughPin colorTier={pin.colorTier} seed={pin.seed} reducedMotion={reducedMotion} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-bg-elevated border border-border-default text-text-primary text-xs px-2 py-1 rounded z-50"
                    sideOffset={4}
                  >
                    {pin.region}
                    <Tooltip.Arrow className="fill-border-default" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Marker>
          ))}
        </Map>
      </div>
      <ul className="sr-only" aria-label="Project locations list">
        {pins.map(p => (
          <li key={p.region}>{p.region}</li>
        ))}
      </ul>
    </Tooltip.Provider>
  )
}
