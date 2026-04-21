/**
 * Shared API response types.
 * All API routes use these shapes for consistency.
 */

/** Standard error response shape: { error: string; code: string } */
export type ApiError = {
  error: string
  code: string
}

/** Returns a fresh 429 Too Many Requests response */
export function rateLimitedResponse(): Response {
  return Response.json(
    { error: 'Too many requests', code: 'RATE_LIMITED' } satisfies ApiError,
    { status: 429 }
  )
}

/** Returns a fresh 403 Forbidden response */
export function forbiddenResponse(): Response {
  return Response.json(
    { error: 'Forbidden', code: 'FORBIDDEN' } satisfies ApiError,
    { status: 403 }
  )
}
