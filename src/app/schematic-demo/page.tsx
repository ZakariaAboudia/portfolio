import ProjectSchematic from '@/components/shared/ProjectSchematic'
import type { SchematicData } from '@/components/shared/ProjectSchematic'

const demo: SchematicData = {
  nodes: [
    { id: 'browser',  label: 'Browser',    x: 60,  y: 60  },
    { id: 'nextjs',   label: 'Next.js',    x: 200, y: 60,  accent: true },
    { id: 'api',      label: 'API Routes', x: 340, y: 60  },
    { id: 'auth',     label: 'BetterAuth', x: 110, y: 175 },
    { id: 'prisma',   label: 'Prisma',     x: 280, y: 175 },
    { id: 'redis',    label: 'Redis',      x: 110, y: 285 },
    { id: 'postgres', label: 'PostgreSQL', x: 280, y: 285, accent: true },
  ],
  edges: [
    { from: 'browser',  to: 'nextjs',   label: 'RSC' },
    { from: 'nextjs',   to: 'api',      label: 'fetch' },
    { from: 'nextjs',   to: 'auth',     label: 'session' },
    { from: 'api',      to: 'prisma',   label: 'query' },
    { from: 'auth',     to: 'redis',    label: 'cache' },
    { from: 'prisma',   to: 'postgres', label: 'SQL' },
  ],
}

export default function SchematicDemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg flex flex-col gap-6">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">— architecture schematic demo</p>
        <div className="border border-border-subtle p-4" style={{ background: 'var(--bg-elevated)' }}>
          <ProjectSchematic data={demo} seed={7331} />
        </div>
        <p className="font-mono text-xs text-text-muted opacity-50">
          rough.js SVG · generated once · cached to project
        </p>
      </div>
    </div>
  )
}
