/**
 * Email delivery via Resend.
 * Requires RESEND_API_KEY env var in production.
 * In dev without the key, logs to console instead.
 */

interface ContactEmailPayload {
  name: string
  email: string
  message: string
}

export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not set — contact message logged:', payload)
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) throw new Error('ADMIN_EMAIL not configured')

  const { error } = await resend.emails.send({
    from: 'Portfolio Contact <noreply@portfolio.dev>',
    to: adminEmail,
    subject: `New message from ${payload.name}`,
    text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    html: `<p><strong>From:</strong> ${payload.name} &lt;${payload.email}&gt;</p><p>${payload.message.replace(/\n/g, '<br>')}</p>`,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET
  if (!secret) return true // graceful degradation in dev

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
