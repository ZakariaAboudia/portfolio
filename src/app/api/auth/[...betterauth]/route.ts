/**
 * BetterAuth OAuth route handler.
 * Handles all auth flows: OAuth callbacks, session management, sign-out.
 *
 * Requires `better-auth` package to be installed and OAuth provider env vars set.
 * Email allowlist enforced in middleware (src/middleware.ts) — only ADMIN_EMAIL can write.
 */
import { authHandler } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _handler: { GET: any; POST: any } | null = null

function getHandler() {
  if (_handler) return _handler
  try {
    const h = authHandler.handler
    if (!h) return null
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toNextJsHandler } = require('better-auth/next-js')
    _handler = toNextJsHandler(h)
    return _handler!
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const h = getHandler()
  if (!h) return Response.json({ error: 'Auth not configured' }, { status: 503 })
  return h.GET(request)
}

export async function POST(request: Request) {
  const h = getHandler()
  if (!h) return Response.json({ error: 'Auth not configured' }, { status: 503 })
  return h.POST(request)
}
