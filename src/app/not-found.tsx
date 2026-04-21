import Link from 'next/link'
import RoughCard from '@/components/shared/RoughCard'

export default function NotFound() {
  return (
    <main className="p-6 flex flex-col gap-6 max-w-sm">
      <h1 className="text-6xl font-bold font-mono text-accent">404</h1>
      <RoughCard padding="p-4">
        <p className="text-sm text-text-secondary">
          Page not found.
        </p>
      </RoughCard>
      <Link
        href="/"
        className="self-start text-sm font-mono text-accent underline hover:text-text-primary transition-colors"
      >
        ← Back home
      </Link>
    </main>
  )
}
