import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { ratelimitStrict, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse, forbiddenResponse } from '@/types/api'
import { revalidatePath } from 'next/cache'

async function checkAdmin(request: Request): Promise<Response | null> {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStrict.limit(ip)
  if (!success) return rateLimitedResponse()

  const session = await getAdminSession(request)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return forbiddenResponse()
  }
  return null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAdmin(request)
  if (guard) return guard

  const { id } = await params
  const body = await request.json()

  const skill = await prisma.skill.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.level !== undefined && { level: Math.min(5, Math.max(1, body.level)) }),
    },
  })

  revalidatePath('/skills')
  return Response.json(skill)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAdmin(request)
  if (guard) return guard

  const { id } = await params
  await prisma.skill.delete({ where: { id } })

  revalidatePath('/skills')
  return Response.json({ success: true })
}
