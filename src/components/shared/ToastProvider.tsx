'use client'

import * as Toast from '@radix-ui/react-toast'
import { createContext, useContext, useState, useCallback } from 'react'

export type ToastType =
  | 'save-success'
  | 'delete-success'
  | 'save-error'
  | 'demo-blocked'
  | 'network-error'

interface ToastConfig {
  type: ToastType
  onRetry?: () => void
}

interface ToastItem extends ToastConfig {
  id: string
}

interface ToastContextValue {
  addToast: (config: ToastConfig) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_MESSAGES: Record<ToastType, { title: string; description?: string; persistent: boolean; isError: boolean }> = {
  'save-success': { title: 'Project saved', persistent: false, isError: false },
  'delete-success': { title: 'Project deleted', persistent: false, isError: false },
  'save-error': { title: 'Failed to save', description: 'Retry', persistent: true, isError: true },
  'demo-blocked': { title: 'Changes are disabled in demo mode', persistent: false, isError: false },
  'network-error': { title: 'Network error — please try again', persistent: true, isError: true },
}

let _toastIdCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([])

  const addToast = useCallback((config: ToastConfig) => {
    const id = String(++_toastIdCounter)
    setQueue(prev => [...prev, { ...config, id }])
  }, [])

  const dismissFirst = useCallback(() => {
    setQueue(prev => prev.slice(1))
  }, [])

  const active = queue[0] ?? null
  const meta = active ? TOAST_MESSAGES[active.type] : null

  return (
    <ToastContext.Provider value={{ addToast }}>
      <Toast.Provider swipeDirection="right" duration={meta?.persistent ? Infinity : 4000}>
        {children}
        {active && meta && (
          <Toast.Root
            key={active.id}
            defaultOpen
            onOpenChange={open => { if (!open) dismissFirst() }}
            className={[
              'bg-bg-elevated rounded px-4 py-3 text-sm text-text-primary',
              'border',
              meta.isError ? 'border-error' : 'border-border-default',
              'shadow-lg',
            ].join(' ')}
          >
            <Toast.Title className={meta.isError ? 'text-error font-medium' : 'font-medium'}>
              {meta.title}
            </Toast.Title>
            {meta.description && active.onRetry && (
              <Toast.Action altText="Retry" asChild>
                <button
                  onClick={active.onRetry}
                  className="text-accent underline text-xs mt-1 block"
                >
                  {meta.description}
                </button>
              </Toast.Action>
            )}
          </Toast.Root>
        )}
        <Toast.Viewport className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider')
  return ctx
}
