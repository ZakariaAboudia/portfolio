'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function SystemTelemetry() {
  const t = useTranslations ? useTranslations('nav') : (key: string) => key
  const [latency, setLatency] = useState(24)

  // Subtle flutter in latency to make it feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        // Random walk between 18 and 38
        const change = Math.floor(Math.random() * 5) - 2
        const next = prev + change
        return Math.max(18, Math.min(38, next))
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="shrink-0 px-4 py-4 border-t border-border-subtle flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-text-muted select-none">
      <div className="flex items-center justify-between">
        <span>API Status</span>
        <div className="flex items-center gap-1.5 text-accent">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
          </span>
          <span>Online</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Latency</span>
        <span className="text-text-primary">{latency}ms</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Last Deploy</span>
        <span className="text-text-primary">2h ago</span>
      </div>
    </div>
  )
}
