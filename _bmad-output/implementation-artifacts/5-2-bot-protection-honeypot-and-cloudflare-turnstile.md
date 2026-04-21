# Story 5.2: Bot Protection — Honeypot & Cloudflare Turnstile

Status: done

## Notes

Honeypot field in ContactForm at position: absolute; left: -9999px, aria-hidden.
Turnstile loads in invisible mode (no user interaction), gracefully skipped if sitekey unset.
API silently returns success for honeypot-populated submissions.
Turnstile server verification via challenges.cloudflare.com (skipped if secret unset in dev).

## File List

- `src/components/contact/ContactForm.tsx` — honeypot + Turnstile integration
- `src/app/api/contact/route.ts` — server-side honeypot + Turnstile checks
- `src/lib/email.ts` — verifyTurnstile() helper
