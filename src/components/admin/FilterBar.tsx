'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface FilterBarProps {
  placeholder?: string
  showRegionFilter?: boolean
  regionOptions?: string[]
}

function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  const timer = useCallback(
    (() => {
      let t: ReturnType<typeof setTimeout> | null = null
      return (...args: Parameters<T>) => {
        if (t) clearTimeout(t)
        t = setTimeout(() => fn(...args), delay)
      }
    })(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, delay]
  )
  return timer as T
}

export default function FilterBar({ placeholder = 'Search...', showRegionFilter, regionOptions = [] }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [region, setRegion] = useState(searchParams.get('region') ?? '')

  function buildUrl(newSearch: string, newRegion: string) {
    const params = new URLSearchParams()
    if (newSearch) params.set('q', newSearch)
    if (newRegion) params.set('region', newRegion)
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ''}`
  }

  const debouncedNav = useDebounce((newSearch: string, newRegion: string) => {
    router.push(buildUrl(newSearch, newRegion))
  }, 300)

  function handleSearch(value: string) {
    setSearch(value)
    debouncedNav(value, region)
  }

  function handleRegion(value: string) {
    setRegion(value)
    router.push(buildUrl(search, value))
  }

  function clearAll() {
    setSearch('')
    setRegion('')
    router.push(pathname)
  }

  const hasFilters = !!search || !!region

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
        />
        {showRegionFilter && (
          <select
            value={region}
            onChange={e => handleRegion(e.target.value)}
            className="px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
          >
            <option value="">All regions</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </div>

      {hasFilters && (
        <div className="flex gap-2 flex-wrap items-center">
          {search && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-accent-muted text-accent rounded">
              &ldquo;{search}&rdquo;
              <button onClick={() => handleSearch('')} aria-label="Remove search filter" className="hover:text-error">×</button>
            </span>
          )}
          {region && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-accent-muted text-accent rounded">
              {region}
              <button onClick={() => handleRegion('')} aria-label="Remove region filter" className="hover:text-error">×</button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs font-mono text-text-muted hover:text-text-primary underline ml-1">
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
