'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@/components/shared/Skeleton'
import type { MapPin } from '@/lib/map-pins'

interface MapWithPinsDynamicProps {
  pins: MapPin[]
  projects?: { id: string, slug: string, titleStr: string, clientRegion: string | null }[]
  ariaLabel: string
  fallbackMessage: string
  className?: string
}

export default dynamic(() => import('./RoughWorldMap'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})
