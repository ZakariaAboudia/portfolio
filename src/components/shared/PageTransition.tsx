'use client'

import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="page-fade-in flex-1 flex flex-col">
      {children}
    </div>
  )
}
