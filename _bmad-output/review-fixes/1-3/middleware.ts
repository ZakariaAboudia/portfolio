import { NextRequest, NextResponse } from 'next/server'
import { issueGuestToken, verifyGuestToken } from '@/lib/auth-edge'

const WRITE_METHODS = new Set(['POST', 'PATCH', 'DELETE'])

export async function middleware(request: NextRequest): Promise<NextResponse | Response> {
  const { pathname } = request.nextUrl
  const guestToken = request.cookies.get('guest-token')?.value

  // ── Admin page routes: issue guest token if missing/invalid ────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    const tokenValid = guestToken ? await verifyGuestToken(guestToken) : false
    if (!tokenValid) {
      const token = await issueGuestToken()
      const response = NextResponse.next()
      response.cookies.set('guest-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return response
    }
    return NextResponse.next()
  }

  // ── Admin API write routes ─────────────────────────────────────────────────
  // All writes blocked at middleware layer. Guest token presence explicitly
  // prevents escalation. Story 1.5 adds admin session verification inside each
  // API route handler (Node.js runtime) — those handlers must call getAdminSession()
  // and return 403 if no valid session.
  if (pathname.startsWith('/api/admin') && WRITE_METHODS.has(request.method)) {
    return Response.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
