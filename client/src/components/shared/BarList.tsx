import type { ReactNode } from 'react'

export interface BarListItem {
  key: string
  label: ReactNode
  /** Plain-text label for screen readers and tooltips. */
  textLabel: string
  value: number
}

interface BarListProps {
  items: readonly BarListItem[]
  /** One hue for every bar: bars encode magnitude, not identity. */
  color: string
  /** Accessible name for the list, e.g. "Applications by category". */
  label: string
  /** e.g. (n) => `${n} applications` */
  formatValue?: (value: number) => string
}

/**
 * Horizontal bars on one baseline, each directly labelled with its value.
 * Lighter than a chart library for simple magnitude comparisons.
 */
export function BarList({ items, color, label, formatValue = String }: BarListProps) {
  const maxValue = Math.max(1, ...items.map((item) => item.value))

  return (
    <ul aria-label={label} className="flex flex-col gap-3">
      {items.map((item) => {
        const widthPercent = (item.value / maxValue) * 100

        return (
          <li key={item.key} className="flex flex-col gap-1" title={`${item.textLabel}: ${formatValue(item.value)}`}>
            <div className="flex items-baseline justify-between gap-3 text-body">
              <span className="min-w-0 truncate">{item.label}</span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatValue(item.value)}
              </span>
            </div>
            <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${widthPercent}%`, minWidth: item.value > 0 ? '0.5rem' : 0, backgroundColor: color }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
