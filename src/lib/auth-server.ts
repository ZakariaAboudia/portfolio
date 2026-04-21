import { headers } from 'next/headers'
import { getAdminSession } from '@/lib/auth'

/**
 * Server Component variant of getAdminSession.
 * Uses next/headers — only call from Server Components, never from edge middleware.
 */
export async function getAdminSessionServer(): Promise<{
  user: { email: string; name: string; id: string }
} | null> {
  try {
    const headersList = await headers()
    const req = new Request('http://localhost', { headers: headersList })
    return getAdminSession(req)
  } catch {
    return null
  }
}

export function isAdminSession(
  session: { user: { email: string } } | null
): boolean {
  return !!(session?.user?.email && session.user.email === process.env.ADMIN_EMAIL)
}
