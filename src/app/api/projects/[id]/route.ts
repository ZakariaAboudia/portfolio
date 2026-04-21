import { prisma } from '@/lib/prisma'
import { ratelimitStandard, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse } from '@/types/api'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })

  if (!project || !project.published) {
    return Response.json(
      { error: 'Not found', code: 'PROJECT_NOT_FOUND' },
      { status: 404 }
    )
  }

  return Response.json(project)
}
