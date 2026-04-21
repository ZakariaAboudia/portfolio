import { describe, it, expect, beforeAll } from 'vitest'
import { issueGuestToken, verifyGuestToken } from '@/lib/auth'

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET = 'test-secret-that-is-at-least-32-characters-long'
})

describe('issueGuestToken', () => {
  it('returns a two-part dot-separated token', async () => {
    const token = await issueGuestToken()
    const parts = token.split('.')
    expect(parts).toHaveLength(2)
    expect(parts[0].length).toBeGreaterThan(0)
    expect(parts[1].length).toBeGreaterThan(0)
  })

  it('produces unique tokens on each call', async () => {
    const t1 = await issueGuestToken()
    const t2 = await issueGuestToken()
    expect(t1).not.toBe(t2)
  })
})

describe('verifyGuestToken', () => {
  it('returns true for a freshly issued token', async () => {
    const token = await issueGuestToken()
    expect(await verifyGuestToken(token)).toBe(true)
  })

  it('returns false for a tampered signature', async () => {
    const token = await issueGuestToken()
    const [payload] = token.split('.')
    const tampered = `${payload}.invalidsignatureXXXXXXXX`
    expect(await verifyGuestToken(tampered)).toBe(false)
  })

  it('returns false for a tampered payload', async () => {
    const token = await issueGuestToken()
    const [, sig] = token.split('.')
    const fakePayload = btoa(JSON.stringify({ type: 'guest', exp: Date.now() + 99999999 }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(await verifyGuestToken(`${fakePayload}.${sig}`)).toBe(false)
  })

  it('returns false for a malformed token (no dot)', async () => {
    expect(await verifyGuestToken('nodottoken')).toBe(false)
  })

  it('returns false for an empty string', async () => {
    expect(await verifyGuestToken('')).toBe(false)
  })

  it('returns false for a token with wrong type field', async () => {
    // Manually craft a valid-signed token with type !== "guest"
    const secret = process.env.BETTER_AUTH_SECRET!
    const payload = JSON.stringify({ type: 'admin', exp: Date.now() + 99999, iat: Date.now(), jti: 'x' })
    const payloadBytes = new TextEncoder().encode(payload)
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, payloadBytes)
    const encode = (b: Uint8Array) =>
      btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const token = `${encode(payloadBytes)}.${encode(new Uint8Array(sig))}`
    expect(await verifyGuestToken(token)).toBe(false)
  })

  it('returns false for an expired token', async () => {
    const secret = process.env.BETTER_AUTH_SECRET!
    const payload = JSON.stringify({ type: 'guest', exp: Date.now() - 1000, iat: Date.now() - 2000, jti: 'x' })
    const payloadBytes = new TextEncoder().encode(payload)
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, payloadBytes)
    const encode = (b: Uint8Array) =>
      btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const token = `${encode(payloadBytes)}.${encode(new Uint8Array(sig))}`
    expect(await verifyGuestToken(token)).toBe(false)
  })
})
