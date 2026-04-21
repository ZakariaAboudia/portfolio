import { getTranslations } from 'next-intl/server'
import { LoginButtons } from './_components/LoginButtons'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const t = await getTranslations('login')
  const { error } = await searchParams

  const errorMessageMap: Record<string, string> = {
    unauthorized: t('errors.unauthorized'),
    oauth_error: t('errors.oauthError'),
  }
  const errorMessage = error
    ? (errorMessageMap[error] ?? t('errors.default'))
    : null

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <div className="w-full max-w-xs flex flex-col gap-6">
        {/* Wordmark */}
        <div className="text-center">
          <span className="font-mono text-xs tracking-widest uppercase text-text-muted">
            Admin
          </span>
        </div>

        {/* Error */}
        {errorMessage && (
          <p
            role="alert"
            aria-live="polite"
            className="text-xs font-mono text-error text-center px-3 py-2 bg-bg-elevated rounded"
            style={{ border: '1px solid var(--error)' }}
          >
            {errorMessage}
          </p>
        )}

        {/* Login buttons */}
        <LoginButtons />

        {/* No link back, no portfolio branding */}
      </div>
    </div>
  )
}
