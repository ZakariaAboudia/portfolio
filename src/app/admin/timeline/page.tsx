import { prisma } from '@/lib/prisma'
import TimelineList from './_components/TimelineList'

export default async function AdminTimelinePage() {
  const entries = await prisma.timelineEntry.findMany({
    orderBy: { startDate: 'desc' },
  })

  return (
    <main className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-mono text-text-primary">Timeline</h1>
      <TimelineList entries={entries} />
    </main>
  )
}
