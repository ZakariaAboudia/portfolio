import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { ratelimitStandard, ratelimitStrict, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse, forbiddenResponse } from '@/types/api'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(projects)
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
  const { slug, title, description, body: bodyField, techStack, clientRegion, imageUrl, published } = body

  if (!slug || !title || !description) {
    return Response.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      slug,
      title,
      description,
      body: bodyField ?? null,
      techStack: techStack ?? [],
      clientRegion: clientRegion ?? null,
      imageUrl: imageUrl ?? null,
      published: published ?? false,
    },
  })

  revalidatePath('/projects')
  revalidatePath('/')
  return Response.json(project, { status: 201 })
}
