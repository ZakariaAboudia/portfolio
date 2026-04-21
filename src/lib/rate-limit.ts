/**
 * Rate limiting wrappers.
 *
 * Production: requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * Development (no env vars): no-op fallback — all requests allowed.
 *
 * NEVER deploy to production without UPSTASH_REDIS_REST_URL configured.
 *
 * Usage in every route handler (rate limit check MUST be first):
 *   const ip = getRateLimitIp(request)
 *   const { success } = await ratelimitStandard.limit(ip)
 *   if (!success) return Response.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
 */

export interface RateLimitResult {
  success: boolean
}

export interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>
}

// ── In-memory no-op limiter for local dev ─────────────────────────────────────

const noopLimiter: RateLimiter = {
  async limit(): Promise<RateLimitResult> {
    return { success: true }
  },
}

// ── Upstash-backed limiter factory ────────────────────────────────────────────

function createUpstashLimiter(requestsPerWindow: number, windowSeconds: number): RateLimiter {
  // Dynamic require — packages (@upstash/ratelimit, @upstash/redis) must be installed in production
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const { Ratelimit } = require('@upstash/ratelimit') as any
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const { Redis } = require('@upstash/redis') as any

  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(requestsPerWindow, `${windowSeconds} s`),
    prefix: 'portfolio:rl',
    analytics: true,
  }) as RateLimiter
}

// ── Resolve limiter based on environment ──────────────────────────────────────

function resolveLimiter(requestsPerWindow: number, windowSeconds: number): RateLimiter {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashLimiter(requestsPerWindow, windowSeconds)
  }
  return noopLimiter
}

/**
 * Standard limiter — 100 requests per 60 seconds.
 * Use on all public `/api/*` routes.
 */
export const ratelimitStandard: RateLimiter = resolveLimiter(100, 60)

/**
 * Strict limiter — 20 requests per 60 seconds.
 * Use on `/api/contact` and all `/api/admin/*` write endpoints.
 */
export const ratelimitStrict: RateLimiter = resolveLimiter(20, 60)

// ── IP extraction helper ──────────────────────────────────────────────────────

/**
 * Extracts client IP from request headers.
 * Uses x-forwarded-for (set by Vercel/proxies); falls back to 127.0.0.1 for local dev.
 */
export function getRateLimitIp(request: Request): string {
  const forwarded = (request.headers as Headers).get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}
