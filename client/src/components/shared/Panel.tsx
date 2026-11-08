import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  description?: string
  /** e.g. a "View all" link. */
  action?: ReactNode
  className?: string
  children: ReactNode
}

/** A titled content section on a white card. */
export function Panel({ title, description, action, className, children }: PanelProps) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-lg border border-border bg-card p-5', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-section-heading font-semibold">{title}</h2>
          {description && <p className="text-supporting text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
