import { getAdminSession } from '@/lib/auth'
import { ratelimitStrict, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse, forbiddenResponse } from '@/types/api'
import { put, del } from '@vercel/blob'

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

export async function POST(request: Request) {
  const guard = await checkAdmin(request)
  if (guard) return guard

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: 'No file provided', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const filename = (file as File).name ?? `upload-${Date.now()}`
  const blob = await put(`projects/${filename}`, file, { access: 'public' })

  return Response.json({ url: blob.url }, { status: 201 })
}

export async function DELETE(request: Request) {
  const guard = await checkAdmin(request)
  if (guard) return guard

  const { url } = await request.json()
  if (!url) {
    return Response.json({ error: 'No URL provided', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  await del(url)
  return Response.json({ success: true })
}
