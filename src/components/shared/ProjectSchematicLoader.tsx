'use client'

import { useEffect, useState } from 'react'
import ProjectSchematic from './ProjectSchematic'
import type { SchematicData } from './ProjectSchematic'

interface Props {
  projectId: string
  seed?: number
  className?: string
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: SchematicData }
  | { status: 'error'; message: string }

export default function ProjectSchematicLoader({ projectId, seed, className }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Try cached first
        const get = await fetch(`/api/projects/${projectId}/schematic`)
        if (!cancelled && get.ok) {
          const data = await get.json()
          setState({ status: 'ready', data })
          return
        }

        // Generate + cache
        const post = await fetch(`/api/projects/${projectId}/schematic`, { method: 'POST' })
        if (!cancelled) {
          if (post.ok) {
            const data = await post.json()
            setState({ status: 'ready', data })
          } else {
            const err = await post.json().catch(() => ({}))
            setState({ status: 'error', message: err.error ?? 'Generation failed' })
          }
        }
      } catch (err) {
        if (!cancelled) {
          setState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' })
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  if (state.status === 'loading') {
    return (
      <div className="w-full flex flex-col gap-1 font-mono text-xs" style={{ color: 'var(--accent)', opacity: 0.7 }}>
        <span>&gt; PARSING_PROJECT_STRUCTURE...</span>
        <span>&gt; GENERATING_SCHEMATIC...</span>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="w-full font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        &gt; schematic unavailable
      </div>
    )
  }

  return <ProjectSchematic data={state.data} seed={seed} className={`${className} h-full`} />
}
