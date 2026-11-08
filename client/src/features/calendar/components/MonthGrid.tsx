import { type KeyboardEvent, useEffect, useRef } from 'react'

import { EVENT_TYPE_DETAILS } from '@/features/events/constants/eventTypes'
import { cn } from '@/lib/utils'

import { addDays, type CalendarDay, type CalendarItem, WEEK_STARTS_ON } from '../utils/calendarUtils'

/** How many items a day cell lists before "+N more" (wider screens only). */
const VISIBLE_ITEMS_PER_DAY = 2

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const fullDayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** Weekday names in grid order, starting on WEEK_STARTS_ON. 4 Jan 1970 was a Sunday. */
const WEEKDAY_LABELS = Array.from({ length: 7 }, (_, index) =>
  weekdayFormatter.format(new Date(1970, 0, 4 + WEEK_STARTS_ON + index)),
)

const KEY_TO_DAY_OFFSET: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

function ItemChip({ item }: { item: CalendarItem }) {
  if (item.kind === 'deadline') {
    return (
      <span className="block truncate rounded-sm bg-amber-50 px-1.5 py-0.5 text-[11px] leading-4 font-medium text-amber-800">
        Deadline: {item.title}
      </span>
    )
  }

  const { event } = item
  return (
    <span
      className={cn(
        'block truncate rounded-sm px-1.5 py-0.5 text-[11px] leading-4 font-medium',
        EVENT_TYPE_DETAILS[event.event_type].iconClassName,
        event.is_completed && 'line-through opacity-60',
      )}
    >
      {event.title}
    </span>
  )
}

function describeDay(day: CalendarDay, itemCount: number): string {
  const count = itemCount === 0 ? 'nothing scheduled' : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
  return `${fullDayFormatter.format(day.date)}${day.isToday ? ' (today)' : ''}: ${count}`
}

interface MonthGridProps {
  grid: readonly CalendarDay[][]
  itemsByDay: ReadonlyMap<string, CalendarItem[]>
  selectedDayKey: string
  onSelectDay: (date: Date) => void
}

/**
 * Month view. Days are buttons with one tab stop (the selected day);
 * arrow keys move between days, Home/End to the start or end of the week.
 */
export function MonthGrid({ grid, itemsByDay, selectedDayKey, onSelectDay }: MonthGridProps) {
  const dayButtonsRef = useRef(new Map<string, HTMLButtonElement>())
  const shouldFocusSelectedRef = useRef(false)

  // After keyboard navigation (possibly into another month), move focus to the new day.
  useEffect(() => {
    if (!shouldFocusSelectedRef.current) return
    shouldFocusSelectedRef.current = false
    dayButtonsRef.current.get(selectedDayKey)?.focus()
  }, [selectedDayKey, grid])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: CalendarDay) {
    let target: Date | null = null
    const dayOfWeek = (day.date.getDay() - WEEK_STARTS_ON + 7) % 7

    if (event.key in KEY_TO_DAY_OFFSET) target = addDays(day.date, KEY_TO_DAY_OFFSET[event.key])
    else if (event.key === 'Home') target = addDays(day.date, -dayOfWeek)
    else if (event.key === 'End') target = addDays(day.date, 6 - dayOfWeek)
    if (!target) return

    event.preventDefault()
    shouldFocusSelectedRef.current = true
    onSelectDay(target)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div aria-hidden="true" className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2 text-center text-supporting font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.flat().map((day) => {
          const items = itemsByDay.get(day.key) ?? []
          const isSelected = day.key === selectedDayKey
          const hiddenCount = items.length - VISIBLE_ITEMS_PER_DAY

          return (
            <button
              key={day.key}
              ref={(element) => {
                if (element) dayButtonsRef.current.set(day.key, element)
                else dayButtonsRef.current.delete(day.key)
              }}
              type="button"
              tabIndex={isSelected ? 0 : -1}
              aria-pressed={isSelected}
              aria-current={day.isToday ? 'date' : undefined}
              aria-label={describeDay(day, items.length)}
              onClick={() => onSelectDay(day.date)}
              onKeyDown={(event) => handleKeyDown(event, day)}
              className={cn(
                'flex min-h-14 min-w-0 flex-col gap-1 border-r border-b border-border p-1.5 text-left transition-colors outline-none [&:nth-child(7n)]:border-r-0 md:min-h-24',
                'hover:bg-muted/60 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                !day.isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                isSelected && 'bg-secondary hover:bg-secondary',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-supporting font-medium tabular-nums',
                  day.isToday && 'bg-primary text-primary-foreground',
                )}
              >
                {day.date.getDate()}
              </span>

              {/* Small screens: one dot per day with items. */}
              {items.length > 0 && (
                <span aria-hidden="true" className="mx-auto size-1.5 rounded-full bg-primary md:hidden" />
              )}

              {/* Wider screens: the first items by name. */}
              <span aria-hidden="true" className="hidden min-w-0 flex-col gap-0.5 md:flex">
                {items.slice(0, VISIBLE_ITEMS_PER_DAY).map((item) => (
                  <ItemChip key={item.id} item={item} />
                ))}
                {hiddenCount > 0 && (
                  <span className="px-1.5 text-[11px] leading-4 font-medium text-muted-foreground">+{hiddenCount} more</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
