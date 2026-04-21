import { prisma } from '@/lib/prisma'
import { ratelimitStandard, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse } from '@/types/api'

export async function GET(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(projects)
}
