// Auth module: guest session token helpers + BetterAuth server config.
// Guest token functions are in auth-edge.ts (edge-runtime safe).
// BetterAuth functions require `better-auth` package; degrade gracefully if absent.

export { issueGuestToken, verifyGuestToken } from '@/lib/auth-edge'

// ── BetterAuth server instance ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _betterAuth: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBetterAuth(): any {
  if (_betterAuth) return _betterAuth
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { betterAuth } = require('better-auth')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prismaAdapter } = require('better-auth/adapters/prisma')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prisma } = require('@/lib/prisma')

    _betterAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: 'postgresql' }),
      secret: process.env.BETTER_AUTH_SECRET!,
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
    })
    return _betterAuth
  } catch {
    return null
  }
}

/** BetterAuth handler — used by the /api/auth/[...betterauth] route */
export const authHandler = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get handler(): any {
    return getBetterAuth()?.handler ?? null
  },
}

// Returns the authenticated admin session for a request, or null if none.
export async function getAdminSession(request: Request): Promise<{
  user: { email: string; name: string; id: string }
} | null> {
  try {
    const auth = getBetterAuth()
    if (!auth) return null
    const session = await auth.api.getSession({ headers: request.headers })
    return session ?? null
  } catch {
    return null
  }
}
