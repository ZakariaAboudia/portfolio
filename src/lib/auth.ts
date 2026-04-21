/**
 * Auth module: guest session token helpers + BetterAuth server config.
 *
 * Guest token functions use Web Crypto API only — edge-runtime compatible, no deps.
 * BetterAuth functions require `better-auth` package; degrade gracefully if absent.
 */

// ── BetterAuth server instance ────────────────────────────────────────────────
// Lazily initialized so missing package doesn't break the module at import time.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _betterAuth: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBetterAuth(): any {
  if (_betterAuth) return _betterAuth
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { betterAuth } = require('better-auth')
    // Prisma 7 requires driver adapter — incompatible with BetterAuth's prismaAdapter.
    // Pass a pg.Pool directly; BetterAuth has built-in Kysely/pg support.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })

    _betterAuth = betterAuth({
      database: pool,
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
      trustedOrigins: [process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'],
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
  } catch (e) {
    console.error('[auth] getBetterAuth init failed:', e)
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

/**
 * Returns the authenticated session for a request, or null if none.
 * Verifies the session via BetterAuth; returns null if BetterAuth is not configured.
 */
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

// ── Guest session token helpers ───────────────────────────────────────────────

const GUEST_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not configured')
  return secret
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function base64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((str.length + 3) % 4)
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

/**
 * Issues a cryptographically signed guest token.
 * Token format: base64url(payload).base64url(hmac)
 */
export async function issueGuestToken(): Promise<string> {
  const payload = JSON.stringify({
    type: 'guest',
    iat: Date.now(),
    exp: Date.now() + GUEST_TOKEN_EXPIRY_MS,
    jti: crypto.randomUUID(),
  })
  const payloadBytes = new TextEncoder().encode(payload)
  const key = await importHmacKey(getSecret())
  const sig = await crypto.subtle.sign('HMAC', key, payloadBytes)
  return `${base64urlEncode(payloadBytes)}.${base64urlEncode(new Uint8Array(sig))}`
}

/**
 * Verifies a guest token.
 * Returns false for any invalid, expired, tampered, or structurally incorrect token.
 * Never throws — callers can safely use as boolean predicate.
 */
export async function verifyGuestToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return false

    const [payloadEncoded, sigEncoded] = parts
    const payloadBytes = base64urlDecode(payloadEncoded)
    const sigBytes = base64urlDecode(sigEncoded)

    const key = await importHmacKey(getSecret())
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes)
    if (!valid) return false

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      type?: string
      exp?: number
    }
    if (payload.type !== 'guest') return false
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false

    return true
  } catch {
    return false
  }
}
