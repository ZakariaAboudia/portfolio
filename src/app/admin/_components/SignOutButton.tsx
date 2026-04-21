'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      type="button"
      className="text-xs font-mono text-text-muted hover:text-text-primary underline transition-colors"
    >
      Sign out
    </button>
  )
}
