'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@/components/shared/Skeleton'

export default dynamic(() => import('./MapWithPins'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})
