import { prisma } from '@/lib/prisma'
import PageHeading from '@/components/shared/PageHeading'
import RoughCard from '@/components/shared/RoughCard'
import Link from 'next/link'
import { getAdminSessionServer, isAdminSession } from '@/lib/auth-server'
import { SignOutButton } from './_components/SignOutButton'

export default async function AdminDashboardPage() {
  const [session, projectCount, skillCount, timelineCount] = await Promise.all([
    getAdminSessionServer(),
    prisma.project.count(),
    prisma.skill.count(),
    prisma.timelineEntry.count(),
  ])

  const authed = isAdminSession(session)

  const counts = [
    { label: 'Projects', value: projectCount, href: '/admin/projects' },
    { label: 'Skills', value: skillCount, href: '/admin/skills' },
    { label: 'Timeline entries', value: timelineCount, href: '/admin/timeline' },
  ]

  return (
    <main className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeading>Admin</PageHeading>
        {authed && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">{session!.user.email}</span>
            <SignOutButton />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {counts.map(({ label, value, href }) => (
          <Link key={href} href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            <RoughCard padding="p-4" className="hover:bg-bg-elevated transition-colors">
              <p className="text-3xl font-bold font-mono text-text-primary">{value}</p>
              <p className="text-xs font-mono text-text-muted mt-1">{label}</p>
            </RoughCard>
          </Link>
        ))}
      </div>

      <nav aria-label="Admin sections" className="flex flex-col gap-2">
        {[
          { href: '/admin/projects', label: 'Manage Projects' },
          { href: '/admin/skills', label: 'Manage Skills' },
          { href: '/admin/timeline', label: 'Manage Timeline' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-text-secondary hover:text-text-primary font-mono underline"
          >
            {label} →
          </Link>
        ))}
      </nav>
    </main>
  )
}
