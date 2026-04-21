import { NextRequest, NextResponse } from 'next/server'
import { issueGuestToken, verifyGuestToken } from '@/lib/auth'

export async function middleware(request: NextRequest): Promise<NextResponse | Response> {
  const { pathname } = request.nextUrl
  const guestToken = request.cookies.get('guest-token')?.value
  const loginSlug = process.env.ADMIN_LOGIN_SLUG

  // ── Login URL obscuring ────────────────────────────────────────────────────
  // If ADMIN_LOGIN_SLUG is set, only /admin/[slug] serves the login page.
  // Direct access to /admin/login returns 404.
  if (loginSlug) {
    if (pathname === `/admin/${loginSlug}`) {
      // Rewrite to actual login page without changing the visible URL
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.rewrite(url)
    }
    if (pathname === '/admin/login') {
      return new Response(null, { status: 404 })
    }
  }

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

  // Admin API write auth is enforced in route handlers (Node.js runtime).
  // Middleware (edge runtime) cannot use pg/BetterAuth for session checks.

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

// Note: ADMIN_LOGIN_SLUG env var makes /admin/login a 404.
// Login is only accessible at /admin/[ADMIN_LOGIN_SLUG].
// Keep this value private — share only with yourself.
