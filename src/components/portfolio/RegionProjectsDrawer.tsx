'use client'

import React from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import RoughCard from '@/components/shared/RoughCard'
import { PenScratchOverlay } from '@/components/portfolio/PenScratchOverlay'

interface ProjectData {
  id: string
  slug: string
  titleStr: string
  clientRegion: string | null
}

interface RegionProjectsDrawerProps {
  region: string | null
  projects: ProjectData[]
  isOpen: boolean
  onClose: () => void
}

export default function RegionProjectsDrawer({ region, projects, isOpen, onClose }: RegionProjectsDrawerProps) {
  const filteredProjects = projects.filter(p => p.clientRegion === region)

  return (
    <>
      <PenScratchOverlay open={isOpen} />
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[32]" style={{ background: 'transparent' }} />
        <Dialog.Content className="fixed top-2 right-2 bottom-2 w-[300px] sm:w-[400px] z-50 outline-none flex flex-col translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.2,1.3,0.3,1)] data-[state=closed]:translate-x-[120%] data-[state=open]:translate-x-0">
          <RoughCard className="h-full w-full bg-bg-surface flex flex-col shadow-[10px_10px_0px_rgba(0,0,0,0.1)]" padding="p-6" style={{ transform: 'rotate(-1deg)' }}>
            <div className="flex items-center justify-between border-b border-border-default pb-4 mb-4 border-dashed">
              <Dialog.Title className="font-mono text-sm uppercase tracking-widest text-text-primary sketchy">
                Field Data: {region}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Close drawer" className="text-text-muted hover:text-text-primary transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {filteredProjects.length === 0 ? (
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest text-center mt-8">
                  No catalogs found
                </p>
              ) : (
                <ul className="flex flex-col gap-3 relative z-10 before:absolute before:-inset-2 before:-z-10 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjYmJiNCIvPgo8L3N2Zz4=')] before:opacity-[0.05]">
                  {filteredProjects.map((project, i) => (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="group flex flex-col border border-border-default bg-bg-elevated hover:bg-bg-subtle transition-colors p-3 rounded-sm relative overflow-hidden"
                      >
                        {/* Slightly crooked sketchy border effect */}
                        <div className="absolute inset-0 border border-border-subtle bg-transparent opacity-50 transform rotate-[1deg] scale-[1.02] pointer-events-none rounded-sm"></div>
                        
                        <div className="flex items-center justify-between mb-1 relative z-10">
                          <span className="font-mono text-xs text-accent">[{String(i + 1).padStart(2, '0')}]</span>
                          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">catalogued</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors relative z-10">
                          {project.titleStr}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </RoughCard>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  )
}
