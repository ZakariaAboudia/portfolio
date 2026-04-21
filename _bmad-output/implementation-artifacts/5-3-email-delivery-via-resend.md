# Story 5.3: Email Delivery via Resend

Status: done

## Notes

Resend loaded dynamically (import('resend')) to avoid bundling when key absent.
ContactMessage always saved to Prisma BEFORE Resend call.
Email delivery failure returns 500 with error code 'EMAIL_ERROR', form preserved.
GET /api/admin/contact-messages (admin-only) provides fallback inbox.

## File List

- `src/lib/email.ts` — NEW (sendContactEmail + verifyTurnstile)
- `src/app/api/contact/route.ts` — NEW (POST handler with full pipeline)
- `src/app/api/admin/contact-messages/route.ts` — NEW (admin inbox GET)
