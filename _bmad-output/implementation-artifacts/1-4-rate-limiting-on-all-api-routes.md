# Story 1.4: Rate Limiting on All API Routes

Status: review

## Story

As the system,
I want rate limiting enforced at the top of every API route handler,
So that the guest session cannot be abused, the contact endpoint cannot be flooded, and admin write endpoints are protected from brute-force attempts.

## Acceptance Criteria

1. **Given** the Upstash Ratelimit wrappers at `src/lib/rate-limit.ts`
   **When** any request arrives at any `/api/*` route
   **Then** the IP-based rate limit check runs before any business logic executes

2. **Given** a client exceeding the standard rate limit on a public route
   **When** the limit is breached
   **Then** the response is `429 { "error": "Too many requests", "code": "RATE_LIMITED" }` with no business logic executed

3. **Given** a client hitting `/api/contact` or any `/api/admin/*` write endpoint
   **When** the stricter rate limit is applied
   **Then** the threshold is lower than the standard limit, and the same 429 response shape is returned on breach

4. **Given** the rate limit implementation
   **When** reviewing the code
   **Then** the `ratelimit.limit(ip)` call appears as the first statement in every route handler — no exception, no business logic above it

## Tasks / Subtasks

- [x] Task 1: Add `@upstash/ratelimit` and `@upstash/redis` to package.json (AC: #1)
  - [x] Add as dependencies (required at runtime in production)
  - [x] Note: network blocked locally — install when available; packages needed before production deploy

- [x] Task 2: Create `src/lib/rate-limit.ts` (AC: #1, #2, #3)
  - [x] Export `ratelimitStandard` — 100 req / 60s sliding window, IP-keyed
  - [x] Export `ratelimitStrict` — 20 req / 60s sliding window, IP-keyed (contact + admin writes)
  - [x] When `UPSTASH_REDIS_REST_URL`/`TOKEN` set: use Upstash Redis backend
  - [x] When not set (local dev): use in-memory fallback (allows all; no false blocks in dev)
  - [x] Export `getRateLimitIp(request)` helper to extract client IP from Next.js headers

- [x] Task 3: Create `src/types/api.ts` with shared response types (AC: #2, #3)
  - [x] Define `ApiError` type `{ error: string; code: string }`
  - [x] Export 429 helper used by route handlers

- [x] Task 4: Write unit tests for `src/lib/rate-limit.ts` (AC: #1, #2, #3)
  - [x] Test standard limiter allows requests under threshold (dev fallback)
  - [x] Test strict limiter threshold is lower than standard
  - [x] Test `getRateLimitIp` extracts from `x-forwarded-for`, falls back to `127.0.0.1`
  - [x] Test 429 response shape matches spec

## Dev Notes

### Rate Limit Values

| Limiter | Window | Requests | Used on |
|---|---|---|---|
| `ratelimitStandard` | 60s | 100 | All public `/api/*` routes |
| `ratelimitStrict` | 60s | 20 | `/api/contact`, `/api/admin/*` writes |

### Usage Pattern in Every Route Handler

```ts
import { ratelimitStandard, getRateLimitIp } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) {
    return Response.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
  }
  // business logic here
}
```

### Upstash Production Config

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

new Ratelimit({
  redis: new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }),
  limiter: Ratelimit.slidingWindow(100, '60s'),
  prefix: 'portfolio:rl',
})
```

### Dev Fallback

When Upstash env vars are absent, exports a no-op limiter that always returns `{ success: true }`.
This prevents false rate-limit failures during local development.
**Never deploy to production without `UPSTASH_REDIS_REST_URL` set.**

### Architecture Compliance

- Rate limit check is FIRST in every handler — before auth, before DB queries
- Standard limit for all public GET routes; strict limit for writes and contact
- IP extracted from `x-forwarded-for` header (Vercel sets this); fallback `127.0.0.1` for local dev

### References

- [Source: architecture.md#Process Patterns — rate limiting pattern]
- [Source: architecture.md#Authentication & Security — rate limiting]
- [Source: epics.md — Story 1.4 AC]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `@upstash/ratelimit` + `@upstash/redis` not in npm cache; added to package.json as dependencies (will install when network available). Used `any` cast on dynamic require to avoid TypeScript errors from missing type declarations.

### Completion Notes List

- All 4 tasks complete
- `ratelimitStandard` (100/60s) and `ratelimitStrict` (20/60s) exported with dev no-op fallback
- `getRateLimitIp` extracts from `x-forwarded-for` header, falls back to `127.0.0.1`
- `src/types/api.ts` defines `ApiError`, `rateLimitedResponse()`, `forbiddenResponse()` factory functions
- 11 new tests; 34 total passing; build clean

### File List

- package.json (modified — added @upstash/ratelimit, @upstash/redis)
- src/lib/rate-limit.ts
- src/types/api.ts
- src/test/rate-limit.test.ts

## Change Log

- 2026-04-14: Story 1-4 implemented — rate-limit.ts with Upstash production + no-op dev fallback, API types, 34 tests passing.
