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

  const entry = await prisma.timelineEntry.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.organization !== undefined && { organization: body.organization }),
      ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.type !== undefined && { type: body.type }),
    },
  })

  revalidatePath('/experience')
  return Response.json(entry)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAdmin(request)
  if (guard) return guard

  const { id } = await params
  await prisma.timelineEntry.delete({ where: { id } })

  revalidatePath('/experience')
  return Response.json({ success: true })
}
