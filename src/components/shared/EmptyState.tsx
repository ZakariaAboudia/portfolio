'use client'

import RoughButton from './RoughButton'

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-text-muted text-sm">
      <p>{message}</p>
      {action && (
        <RoughButton variant="primary" onClick={action.onClick}>
          {action.label}
        </RoughButton>
      )}
    </div>
  )
}
