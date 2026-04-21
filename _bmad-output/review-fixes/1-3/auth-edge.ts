// Edge-runtime-safe guest token helpers — Web Crypto API only, no external deps.
// Imported by middleware; must not import anything outside next/server or built-ins.

const GUEST_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

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
  let binary = ''
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((str.length + 3) % 4)
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

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

// Returns false for any invalid, expired, tampered, or structurally incorrect token.
// Never throws — safe to use as boolean predicate.
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
