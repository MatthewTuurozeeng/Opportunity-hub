import type { EventWithApplication } from '@/features/events/types/event.types'

const MONTH_PARAM_PATTERN = /^(\d{4})-(\d{2})$/
const DAYS_PER_WEEK = 7

/** Monday first. */
export const WEEK_STARTS_ON = 1

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

/** Local calendar day as "YYYY-MM-DD". */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(month: Date, count: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + count, 1)
}

export function addDays(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count)
}

export function isSameMonth(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth()
}

/** "YYYY-MM" for the URL. */
export function toMonthParam(month: Date): string {
  return `${month.getFullYear()}-${padTwoDigits(month.getMonth() + 1)}`
}

/** Reads "YYYY-MM" from the URL, falling back to the current month. */
export function parseMonthParam(value: string | null, now: Date = new Date()): Date {
  const match = value ? MONTH_PARAM_PATTERN.exec(value) : null
  if (!match) return startOfMonth(now)

  const [, year, month] = match.map(Number)
  return month >= 1 && month <= 12 ? new Date(year, month - 1, 1) : startOfMonth(now)
}

export interface CalendarDay {
  date: Date
  key: string
  isCurrentMonth: boolean
  isToday: boolean
}

/** Whole weeks covering the month, starting on WEEK_STARTS_ON. */
export function buildMonthGrid(month: Date, now: Date = new Date()): CalendarDay[][] {
  const firstOfMonth = startOfMonth(month)
  const leadingDays = (firstOfMonth.getDay() - WEEK_STARTS_ON + DAYS_PER_WEEK) % DAYS_PER_WEEK
  const gridStart = addDays(firstOfMonth, -leadingDays)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const weekCount = Math.ceil((leadingDays + daysInMonth) / DAYS_PER_WEEK)
  const todayKey = toDayKey(now)

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
      const date = addDays(gridStart, weekIndex * DAYS_PER_WEEK + dayIndex)
      const key = toDayKey(date)
      return { date, key, isCurrentMonth: isSameMonth(date, month), isToday: key === todayKey }
    }),
  )
}

/** The grid's first day and the day after its last (exclusive end), for fetching events. */
export function getGridRange(grid: readonly CalendarDay[][]): { start: Date; end: Date } {
  const lastWeek = grid[grid.length - 1]
  return { start: grid[0][0].date, end: addDays(lastWeek[lastWeek.length - 1].date, 1) }
}

export type CalendarItem =
  | { kind: 'event'; id: string; occursAt: string; isAllDay: boolean; event: EventWithApplication }
  | {
      kind: 'deadline'
      id: string
      occursAt: string
      isAllDay: true
      applicationId: string
      title: string
      organization: string
    }

export interface CalendarDeadlineSource {
  id: string
  opportunity: { title: string; organization: string; deadline: string | null }
}

/** All-day items (deadlines, all-day events) first, then by time. */
function compareCalendarItems(first: CalendarItem, second: CalendarItem): number {
  if (first.isAllDay !== second.isAllDay) return first.isAllDay ? -1 : 1
  return new Date(first.occursAt).getTime() - new Date(second.occursAt).getTime()
}

/** Events and application deadlines grouped by local day key, each day in display order. */
export function groupCalendarItemsByDay(
  events: readonly EventWithApplication[],
  applications: readonly CalendarDeadlineSource[],
): Map<string, CalendarItem[]> {
  const itemsByDay = new Map<string, CalendarItem[]>()

  function add(item: CalendarItem) {
    const key = toDayKey(new Date(item.occursAt))
    itemsByDay.set(key, [...(itemsByDay.get(key) ?? []), item])
  }

  for (const event of events) {
    add({ kind: 'event', id: `event-${event.id}`, occursAt: event.starts_at, isAllDay: event.is_all_day, event })
  }

  for (const application of applications) {
    const { deadline, title, organization } = application.opportunity
    if (!deadline) continue
    add({
      kind: 'deadline',
      id: `deadline-${application.id}`,
      occursAt: deadline,
      isAllDay: true,
      applicationId: application.id,
      title,
      organization,
    })
  }

  for (const items of itemsByDay.values()) {
    items.sort(compareCalendarItems)
  }

  return itemsByDay
}
