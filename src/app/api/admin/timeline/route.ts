import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { ratelimitStandard, ratelimitStrict, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse, forbiddenResponse } from '@/types/api'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const entries = await prisma.timelineEntry.findMany({
    orderBy: { startDate: 'desc' },
  })
  return Response.json(entries)
}

export async function POST(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStrict.limit(ip)
  if (!success) return rateLimitedResponse()

  const session = await getAdminSession(request)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { title, description, organization, startDate, endDate, type } = body

  if (!title || !description || !organization || !startDate || !type) {
    return Response.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const entry = await prisma.timelineEntry.create({
    data: {
      title,
      description,
      organization,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      type,
    },
  })

  revalidatePath('/experience')
  return Response.json(entry, { status: 201 })
}
