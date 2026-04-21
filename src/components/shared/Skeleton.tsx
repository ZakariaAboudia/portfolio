'use client'

interface SkeletonProps {
  width?: string
  height?: string
  className?: string
  lines?: number
}

export default function Skeleton({ width, height, className = '', lines = 1 }: SkeletonProps) {
  const bar = (
    <div
      className={`bg-bg-subtle rounded motion-safe:animate-pulse ${className}`}
      style={{ width, height: height ?? '1rem' }}
    />
  )

  return (
    <div aria-busy="true" className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i}>{bar}</div>
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      className={`bg-bg-subtle rounded motion-safe:animate-pulse w-full h-32 ${className}`}
    />
  )
}
