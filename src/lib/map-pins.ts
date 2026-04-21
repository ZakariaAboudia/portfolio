import { prisma } from '@/lib/prisma'
import { getRegionCoords } from '@/lib/region-coords'

export type MapPin = {
  region: string
  lng: number
  lat: number
  colorTier: 'accent' | 'success' | 'muted'
  seed: number
}

function getColorTier(mostRecentDate: Date): 'accent' | 'success' | 'muted' {
  const now = new Date()
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25
  const ageYears = (now.getTime() - mostRecentDate.getTime()) / msPerYear
  if (ageYears < 2) return 'accent'
  if (ageYears < 4) return 'success'
  return 'muted'
}

function regionSeed(region: string): number {
  return region.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

export async function getMapPins(): Promise<MapPin[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { clientRegion: true, createdAt: true },
  })

  const regionMap = new Map<string, Date>()
  for (const p of projects) {
    if (!p.clientRegion) continue
    const existing = regionMap.get(p.clientRegion)
    if (!existing || p.createdAt > existing) {
      regionMap.set(p.clientRegion, p.createdAt)
    }
  }

  const pins: MapPin[] = []
  for (const [region, mostRecentDate] of regionMap) {
    const coords = getRegionCoords(region)
    if (!coords) continue
    pins.push({
      region,
      lng: coords[0],
      lat: coords[1],
      colorTier: getColorTier(mostRecentDate),
      seed: regionSeed(region),
    })
  }

  return pins
}
