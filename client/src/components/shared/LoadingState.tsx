import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingStateProps {
  label?: string
  className?: string
}

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center gap-2 py-12 text-body text-muted-foreground', className)}
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  )
}
