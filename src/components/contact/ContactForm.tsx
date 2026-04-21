'use client'

import { useState, useEffect, useRef } from 'react'
import * as Label from '@radix-ui/react-label'

interface FormState {
  name: string
  email: string
  message: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileToken = useRef<string>('')

  // Load Turnstile script
  useEffect(() => {
    if (typeof window === 'undefined') return
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) return

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (!turnstileRef.current || !window.turnstile) return
      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => { turnstileToken.current = token },
        'error-callback': () => { turnstileToken.current = '' },
        size: 'invisible',
      })
    }

    return () => { document.head.removeChild(script) }
  }, [])

  function validate(field: keyof FormState): string {
    if (field === 'name' && !form.name.trim()) return 'Name is required'
    if (field === 'email') {
      if (!form.email.trim()) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address'
    }
    if (field === 'message' && !form.message.trim()) return 'Message is required'
    return ''
  }

  function onBlur(field: keyof FormState) {
    const err = validate(field)
    setErrors(prev => ({ ...prev, [field]: err || undefined }))
  }

  const isValid =
    !!form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    !!form.message.trim() &&
    Object.values(errors).every(e => !e)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || status === 'loading') return

    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          honeypot: '',
          turnstileToken: turnstileToken.current || undefined,
        }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setErrorMsg(data.error ?? 'Something went wrong — please try again.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="py-8 text-center text-text-primary"
        style={{ animation: 'fadeIn 0.3s ease-in' }}
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-medium">Message sent.</p>
        <p className="text-sm text-text-secondary mt-1">Expect a reply within 2 days.</p>
      </div>
    )
  }

  const loading = status === 'loading'
  const fieldStyle = { border: '1px solid var(--border-default)', borderRadius: 4 }
  const errorFieldStyle = { border: '1px solid var(--error)', borderRadius: 4 }
  const inputClass = 'w-full px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sketchy" noValidate>
      {/* Honeypot — off-screen, never visible to real users */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Turnstile invisible widget container */}
      <div ref={turnstileRef} />

      <div>
        <Label.Root htmlFor="cf-name" className="block text-xs font-mono text-text-muted mb-1">Name *</Label.Root>
        <input
          id="cf-name"
          type="text"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          onBlur={() => onBlur('name')}
          disabled={loading}
          className={inputClass}
          style={errors.name ? errorFieldStyle : fieldStyle}
          autoComplete="name"
          aria-describedby={errors.name ? 'cf-name-err' : undefined}
        />
        {errors.name && <p id="cf-name-err" className="text-xs font-mono text-error mt-0.5" role="alert">{errors.name}</p>}
      </div>

      <div>
        <Label.Root htmlFor="cf-email" className="block text-xs font-mono text-text-muted mb-1">Email *</Label.Root>
        <input
          id="cf-email"
          type="email"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          onBlur={() => onBlur('email')}
          disabled={loading}
          className={inputClass}
          style={errors.email ? errorFieldStyle : fieldStyle}
          autoComplete="email"
          aria-describedby={errors.email ? 'cf-email-err' : undefined}
        />
        {errors.email && <p id="cf-email-err" className="text-xs font-mono text-error mt-0.5" role="alert">{errors.email}</p>}
      </div>

      <div>
        <Label.Root htmlFor="cf-message" className="block text-xs font-mono text-text-muted mb-1">Message *</Label.Root>
        <textarea
          id="cf-message"
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          onBlur={() => onBlur('message')}
          disabled={loading}
          rows={5}
          className={`${inputClass} resize-y`}
          style={errors.message ? errorFieldStyle : fieldStyle}
          aria-describedby={errors.message ? 'cf-message-err' : undefined}
        />
        {errors.message && <p id="cf-message-err" className="text-xs font-mono text-error mt-0.5" role="alert">{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p className="text-sm text-error font-mono" role="alert">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || loading}
        aria-busy={loading}
        className="min-h-[44px] px-6 py-2 text-sm font-medium text-accent hover:bg-accent-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
        style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
            Sending…
          </span>
        ) : 'Send message'}
      </button>
    </form>
  )
}

// Augment window for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
    }
  }
}
