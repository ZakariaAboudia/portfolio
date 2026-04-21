'use client'

import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'

export function LoginButtons() {
  const t = useTranslations('login')

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() =>
          authClient.signIn.social({ provider: 'google', callbackURL: '/admin' })
        }
        type="button"
        className="w-full min-h-[44px] px-4 py-2 text-sm font-medium text-text-primary bg-bg-elevated hover:bg-bg-subtle transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ border: '1px solid var(--border-default)' }}
      >
        {t('signInWithGoogle')}
      </button>
      <button
        onClick={() =>
          authClient.signIn.social({ provider: 'github', callbackURL: '/admin' })
        }
        type="button"
        className="w-full min-h-[44px] px-4 py-2 text-sm font-medium text-text-primary bg-bg-elevated hover:bg-bg-subtle transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ border: '1px solid var(--border-default)' }}
      >
        {t('signInWithGitHub')}
      </button>
    </div>
  )
}
