'use client'

import { useToastContext, type ToastType } from '@/components/shared/ToastProvider'

export interface ToastConfig {
  type: ToastType
  onRetry?: () => void
}

export function useToast() {
  const { addToast } = useToastContext()
  return { addToast }
}
