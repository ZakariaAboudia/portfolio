import { prisma } from '@/lib/prisma'
import { getRegionCoords } from '@/lib/region-coords'

export type MapPinProject = {
  slug: string
  title: string
}

export type MapPin = {
  region: string
  lng: number
  lat: number
  colorTier: 'accent' | 'success' | 'muted'
  seed: number
  projects: MapPinProject[]
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
    select: { clientRegion: true, createdAt: true, slug: true, title: true },
    orderBy: { createdAt: 'desc' },
  })

  const regionMap = new Map<string, { mostRecent: Date; projects: MapPinProject[] }>()
  for (const p of projects) {
    if (!p.clientRegion) continue
    const title = (p.title as Record<string, string>).en ?? Object.values(p.title as Record<string, string>)[0]
    const entry = regionMap.get(p.clientRegion)
    if (!entry) {
      regionMap.set(p.clientRegion, { mostRecent: p.createdAt, projects: [{ slug: p.slug, title }] })
    } else {
      entry.projects.push({ slug: p.slug, title })
      if (p.createdAt > entry.mostRecent) entry.mostRecent = p.createdAt
    }
  }

  const pins: MapPin[] = []
  for (const [region, { mostRecent, projects: regionProjects }] of regionMap) {
    const coords = getRegionCoords(region)
    if (!coords) continue
    pins.push({
      region,
      lng: coords[0],
      lat: coords[1],
      colorTier: getColorTier(mostRecent),
      seed: regionSeed(region),
      projects: regionProjects,
    })
  }

  return pins
}
