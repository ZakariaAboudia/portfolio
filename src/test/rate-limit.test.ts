import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse, forbiddenResponse } from '@/types/api'

describe('getRateLimitIp', () => {
  it('extracts first IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getRateLimitIp(request)).toBe('1.2.3.4')
  })

  it('trims whitespace from extracted IP', () => {
    const request = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '  9.9.9.9  , 10.0.0.1' },
    })
    expect(getRateLimitIp(request)).toBe('9.9.9.9')
  })

  it('falls back to 127.0.0.1 when header is absent', () => {
    const request = new Request('http://localhost/api/test')
    expect(getRateLimitIp(request)).toBe('127.0.0.1')
  })
})

describe('rate limiters (dev no-op fallback)', () => {
  let originalUrl: string | undefined
  let originalToken: string | undefined

  beforeEach(() => {
    // Ensure env vars are unset so no-op limiter is used
    originalUrl = process.env.UPSTASH_REDIS_REST_URL
    originalToken = process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  afterEach(() => {
    if (originalUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = originalUrl
    if (originalToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = originalToken
  })

  it('standard limiter allows requests in dev (no-op)', async () => {
    // Re-import to get fresh module with no env vars
    const { ratelimitStandard } = await import('@/lib/rate-limit')
    const result = await ratelimitStandard.limit('127.0.0.1')
    expect(result.success).toBe(true)
  })

  it('strict limiter allows requests in dev (no-op)', async () => {
    const { ratelimitStrict } = await import('@/lib/rate-limit')
    const result = await ratelimitStrict.limit('127.0.0.1')
    expect(result.success).toBe(true)
  })
})

describe('API response helpers', () => {
  it('rateLimitedResponse returns 429 with correct shape', async () => {
    const res = rateLimitedResponse()
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body).toEqual({ error: 'Too many requests', code: 'RATE_LIMITED' })
  })

  it('rateLimitedResponse creates a fresh Response each call', () => {
    const r1 = rateLimitedResponse()
    const r2 = rateLimitedResponse()
    expect(r1).not.toBe(r2)
  })

  it('forbiddenResponse returns 403 with correct shape', async () => {
    const res = forbiddenResponse()
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden', code: 'FORBIDDEN' })
  })
})

describe('rate-limit.ts pattern compliance', () => {
  it('exports ratelimitStandard with limit() method', async () => {
    const { ratelimitStandard } = await import('@/lib/rate-limit')
    expect(typeof ratelimitStandard.limit).toBe('function')
  })

  it('exports ratelimitStrict with limit() method', async () => {
    const { ratelimitStrict } = await import('@/lib/rate-limit')
    expect(typeof ratelimitStrict.limit).toBe('function')
  })

  it('exports getRateLimitIp function', async () => {
    const { getRateLimitIp: fn } = await import('@/lib/rate-limit')
    expect(typeof fn).toBe('function')
  })
})
