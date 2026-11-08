import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string | number
  /** Short context under the value, e.g. "3 of 5 decided". */
  detail?: string
  icon: LucideIcon
  /** Tinted chip behind the icon. */
  iconClassName?: string
}

/** One headline number with its label. */
export function StatTile({ label, value, detail, icon: Icon, iconClassName }: StatTileProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-supporting font-medium text-muted-foreground">{label}</dt>
        <dd className="text-2xl leading-8 font-semibold tracking-tight text-heading tabular-nums">{value}</dd>
        {detail && <dd className="text-supporting text-muted-foreground">{detail}</dd>}
      </div>
      <span
        aria-hidden="true"
        className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-primary', iconClassName)}
      >
        <Icon className="size-4" />
      </span>
    </div>
  )
}
