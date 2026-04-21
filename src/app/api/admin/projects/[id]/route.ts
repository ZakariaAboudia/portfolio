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

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.body !== undefined && { body: body.body }),
      ...(body.techStack !== undefined && { techStack: body.techStack }),
      ...(body.clientRegion !== undefined && { clientRegion: body.clientRegion }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.published !== undefined && { published: body.published }),
    },
  })

  revalidatePath('/projects')
  revalidatePath('/')
  revalidatePath(`/projects/${project.slug}`)
  return Response.json(project)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAdmin(request)
  if (guard) return guard

  const { id } = await params
  await prisma.project.delete({ where: { id } })

  revalidatePath('/projects')
  revalidatePath('/')
  return Response.json({ success: true })
}
