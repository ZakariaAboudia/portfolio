'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import RoughCard from '@/components/shared/RoughCard'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main className="p-6 flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold font-mono text-text-primary">Something went wrong</h1>
      <RoughCard padding="p-4">
        <p className="text-sm text-text-secondary">
          An unexpected error occurred. The issue has been reported automatically.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-text-muted mt-2">Error ID: {error.digest}</p>
        )}
      </RoughCard>
      <button
        onClick={reset}
        className="self-start min-h-[44px] px-4 py-2 text-sm font-medium text-accent hover:bg-accent-muted transition-colors"
        style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
      >
        Try again
      </button>
    </main>
  )
}
