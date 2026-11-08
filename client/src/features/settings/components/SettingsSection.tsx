import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: ReactNode
  /** Actions shown in a footer bar, e.g. a Save button. */
  footer?: ReactNode
  /** Visually marks irreversible actions. */
  tone?: 'default' | 'danger'
  children?: ReactNode
  className?: string
}

/** One settings card: a heading, short explanation, content and an optional action footer. */
export function SettingsSection({ title, description, footer, tone = 'default', children, className }: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border bg-card',
        tone === 'danger' ? 'border-destructive/30' : 'border-border',
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-section-heading font-semibold">{title}</h2>
          {description && <div className="max-w-2xl text-body text-muted-foreground">{description}</div>}
        </header>
        {children}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  )
}
