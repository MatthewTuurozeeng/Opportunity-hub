import { CircleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-card px-6 py-10 text-center"
    >
      <CircleAlert className="size-6 text-destructive" aria-hidden="true" />
      <p className="text-body">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </section>
  )
}
