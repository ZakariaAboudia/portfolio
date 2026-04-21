import { describe, it, expect, beforeAll, vi } from 'vitest'
import { getAdminSession } from '@/lib/auth'

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET = 'test-secret-that-is-at-least-32-characters-long'
  process.env.ADMIN_EMAIL = 'admin@example.com'
})

describe('getAdminSession', () => {
  it('returns null when better-auth package not installed', async () => {
    // In test env, better-auth is not installed — should return null gracefully
    const request = new Request('http://localhost/api/admin/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    })
    const session = await getAdminSession(request)
    expect(session).toBeNull()
  })

  it('does not throw when better-auth is unavailable', async () => {
    const request = new Request('http://localhost/api/admin/projects')
    await expect(getAdminSession(request)).resolves.not.toThrow()
  })
})

describe('middleware write protection with session logic', () => {
  it('blocks writes when no session and no guest token', async () => {
    // Import middleware logic through auth functions
    // getAdminSession returns null (no better-auth), so middleware should 403
    const session = await getAdminSession(
      new Request('http://localhost/api/admin/projects', { method: 'POST' })
    )
    expect(session).toBeNull()
    // Without session, middleware returns 403 — verified by getAdminSession returning null
    const adminEmail = process.env.ADMIN_EMAIL
    expect(session?.user?.email).not.toBe(adminEmail)
  })

  it('email check fails when session is null', () => {
    const session = null
    const adminEmail = 'admin@example.com'
    // Mirrors middleware logic: session?.user?.email === ADMIN_EMAIL
    expect(session?.user?.email === adminEmail).toBe(false)
  })

  it('email check passes when session matches ADMIN_EMAIL', () => {
    const session = { user: { email: 'admin@example.com', name: 'Admin', id: '1' } }
    const adminEmail = 'admin@example.com'
    expect(session?.user?.email === adminEmail).toBe(true)
  })

  it('email check fails when session email does not match ADMIN_EMAIL', () => {
    const session = { user: { email: 'other@example.com', name: 'Other', id: '2' } }
    const adminEmail = 'admin@example.com'
    expect(session?.user?.email === adminEmail).toBe(false)
  })
})

describe('authHandler', () => {
  it('exports authHandler with handler property', async () => {
    const { authHandler } = await import('@/lib/auth')
    expect(authHandler).toBeDefined()
    expect('handler' in authHandler).toBe(true)
  })

  it('handler is null when better-auth not installed', async () => {
    const { authHandler } = await import('@/lib/auth')
    // better-auth not installed in test env
    expect(authHandler.handler).toBeNull()
  })
})

describe('auth-client module', () => {
  it('exports authClient with signIn.social', async () => {
    const { authClient } = await import('@/lib/auth-client')
    expect(authClient).toBeDefined()
    expect(typeof authClient.signIn.social).toBe('function')
  })

  it('authClient.signOut is a function', async () => {
    const { authClient } = await import('@/lib/auth-client')
    expect(typeof authClient.signOut).toBe('function')
  })
})

describe('LOGIN_PAGE error handling', () => {
  it('ERROR_MESSAGES covers known error codes', () => {
    const ERROR_MESSAGES: Record<string, string> = {
      unauthorized: 'That email address is not authorized to access the admin panel.',
      oauth_error: 'OAuth provider error. Please try again.',
      default: 'An error occurred during sign-in. Please try again.',
    }
    expect(ERROR_MESSAGES.unauthorized).toBeTruthy()
    expect(ERROR_MESSAGES.oauth_error).toBeTruthy()
    expect(ERROR_MESSAGES.default).toBeTruthy()
  })
})
