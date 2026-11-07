import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-card-title font-semibold">{title}</h2>
        <p className="text-body text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </section>
  )
}
