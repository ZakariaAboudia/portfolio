import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { ratelimitStandard, ratelimitStrict, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse, forbiddenResponse } from '@/types/api'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { level: 'desc' }],
  })
  return Response.json(skills)
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
  const { name, category, level } = body

  if (!name || !category || typeof level !== 'number') {
    return Response.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const skill = await prisma.skill.create({
    data: { name, category, level: Math.min(5, Math.max(1, level)) },
  })

  revalidatePath('/skills')
  return Response.json(skill, { status: 201 })
}
