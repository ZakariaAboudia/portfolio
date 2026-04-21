# Story 1.3: Guest Session Security Boundary

Status: review

## Story

As a visitor,
I want to access the admin panel without credentials,
So that I can explore the portfolio's admin architecture as a read-only guest.

## Acceptance Criteria

1. **Given** a visitor navigating to any `/admin/*` route without any session
   **When** `src/middleware.ts` processes the request
   **Then** a cryptographically signed guest token is issued and set as an `httpOnly` cookie
   **And** the visitor is allowed to proceed to the admin page (no redirect to a login wall)

2. **Given** a guest session making a `POST`, `PATCH`, or `DELETE` request to any `/api/admin/*` route
   **When** the middleware evaluates the request
   **Then** the response is `403 { "error": "Forbidden", "code": "FORBIDDEN" }` — no write operation reaches the database

3. **Given** a guest token cookie
   **When** `verifyGuestToken()` in `src/lib/auth.ts` evaluates it
   **Then** the function returns `false` for any token not signed with the server secret, or expired, or structurally invalid

4. **Given** a guest session cookie and an admin session cookie simultaneously (manipulation attempt)
   **When** any `/api/admin/*` write endpoint is called
   **Then** the write is still blocked — guest token presence overrides, escalation is architecturally prevented

## Tasks / Subtasks

- [x] Task 1: Add `BETTER_AUTH_SECRET` to `.env.local` and `.env.example` (AC: #1, #3)
  - [x] Generate a 32+ char random secret for local dev
  - [x] Verify `.env.example` already documents this var (it does from Story 1.1)

- [x] Task 2: Create `src/lib/auth.ts` with guest token helpers (AC: #3)
  - [x] Implement `issueGuestToken()` — HMAC-SHA256 signed, 24h expiry, Web Crypto API
  - [x] Implement `verifyGuestToken(token)` — verify signature, check expiry, check type field
  - [x] Use Web Crypto API only (edge-runtime compatible, no external deps)

- [x] Task 3: Create `src/middleware.ts` (AC: #1, #2, #4)
  - [x] Match `/admin/:path*` and `/api/admin/:path*` routes
  - [x] For `/admin/*` page routes: issue guest token if missing/invalid; allow through
  - [x] For `/api/admin/*` write methods (POST/PATCH/DELETE): if guest token present → 403
  - [x] Structurally reserve auth check slot for Story 1.5 (comment placeholder)
  - [x] Export `config.matcher`

- [x] Task 4: Write unit tests for `src/lib/auth.ts` (AC: #3)
  - [x] Test `issueGuestToken` produces a two-part dot-separated token
  - [x] Test `verifyGuestToken` returns true for freshly issued token
  - [x] Test `verifyGuestToken` returns false for tampered signature
  - [x] Test `verifyGuestToken` returns false for expired token
  - [x] Test `verifyGuestToken` returns false for malformed token

## Dev Notes

### Token Format

```
base64url(JSON.stringify(payload)) + "." + base64url(HMAC-SHA256(secret, payload))
```

Payload shape:
```json
{ "type": "guest", "iat": 1234567890000, "exp": 1234654290000, "jti": "<uuid>" }
```

### Web Crypto — edge-runtime compatible

Use `crypto.subtle` exclusively (available in Node 22 and Vercel Edge Runtime).
No `jsonwebtoken`, `jose`, or other external packages.

### Middleware Logic

```
/admin/* (GET/page):
  has valid guest token? → NextResponse.next()
  no valid guest token?  → issue token, set httpOnly cookie, NextResponse.next()

/api/admin/* POST|PATCH|DELETE:
  has valid guest token? → 403 FORBIDDEN  (guest cannot write)
  no guest token?        → 403 FORBIDDEN  (Story 1.5 adds admin session check here)
```

### Cookie Settings

```ts
{ httpOnly: true, secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', maxAge: 60 * 60 * 24, path: '/' }
```

### Architecture Compliance

- Middleware must use only `next/server` (no Prisma, no auth client)
- `verifyGuestToken` returns `boolean` — caller never sees error details
- No secrets logged or exposed in response bodies
- Story 1.5 adds admin session check AFTER the guest token check (ordering critical)

### References

- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Process Patterns — guest session check]
- [Source: epics.md — Story 1.3 AC]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- TypeScript 5.9.3 `ArrayBuffer` gained new properties (`resizable`, `resize`, etc.) that `SharedArrayBuffer` lacks; `Uint8Array.buffer` typed as `ArrayBuffer | SharedArrayBuffer` caused `crypto.subtle.verify` type error. Fixed by having `base64urlDecode` return plain `ArrayBuffer` (via `.buffer.slice()`).

### Completion Notes List

- All 4 tasks complete
- `src/lib/auth.ts`: `issueGuestToken` + `verifyGuestToken` using Web Crypto API only, edge-runtime safe
- `src/middleware.ts`: issues guest token cookie on `/admin/*`, blocks writes on `/api/admin/*` with Story 1.5 placeholder comment
- 9 new tests covering token issuance, verification, tampering, expiry, malformed input
- `next build` passes; middleware registered (shown as `ƒ Proxy (Middleware)` in build output)

### File List

- .env.local (modified — added BETTER_AUTH_SECRET)
- src/lib/auth.ts
- src/middleware.ts
- src/test/auth.test.ts

## Change Log

- 2026-04-14: Story 1-3 implemented — guest session middleware with HMAC-SHA256 signed tokens, write blocking on /api/admin/*, Story 1.5 placeholder in middleware.
