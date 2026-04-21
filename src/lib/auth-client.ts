/**
 * BetterAuth browser client.
 * Used in Client Components for sign-in / sign-out actions.
 * Requires `better-auth` package; throws at runtime if absent.
 */

// Dynamic import pattern — allows module to load even if better-auth not yet installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any {
  if (_client) return _client
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAuthClient } = require('better-auth/react')
    _client = createAuthClient({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    })
    return _client
  } catch {
    throw new Error(
      'better-auth package not installed. Run: npm install better-auth'
    )
  }
}

export const authClient = {
  signIn: {
    social: (opts: { provider: 'google' | 'github'; callbackURL?: string }) =>
      getClient().signIn.social(opts),
  },
  signOut: () => getClient().signOut(),
  useSession: () => getClient().useSession(),
}
