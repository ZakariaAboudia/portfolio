import { prisma } from '@/lib/prisma'
import { ratelimitStrict, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse } from '@/types/api'
import { sendContactEmail, verifyTurnstile } from '@/lib/email'

export async function POST(request: Request) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStrict.limit(ip)
  if (!success) return rateLimitedResponse()

  const body = await request.json()
  const { name, email, message, honeypot, turnstileToken } = body

  // Honeypot: silently return success to bots
  if (honeypot) {
    return Response.json({ success: true })
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  // Email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  // Turnstile verification (if token present and secret configured)
  if (turnstileToken) {
    const valid = await verifyTurnstile(turnstileToken)
    if (!valid) {
      return Response.json({ error: 'Bot check failed', code: 'BOT_DETECTED' }, { status: 400 })
    }
  }

  // Save to Prisma first (never lose a submission even if email fails)
  await prisma.contactMessage.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    },
  })

  // Attempt email delivery
  try {
    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() })
  } catch (err) {
    console.error('[contact] Email delivery failed:', err)
    return Response.json(
      { error: 'Message saved but email delivery failed. We will follow up.', code: 'EMAIL_ERROR' },
      { status: 500 }
    )
  }

  return Response.json({ success: true })
}
