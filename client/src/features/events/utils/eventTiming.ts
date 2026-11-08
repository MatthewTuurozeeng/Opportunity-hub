import { formatDate, formatTime, getDaysUntil } from '@/lib/dateUtils'

import type { ApplicationEvent } from '../types/event.types'

type EventTiming = Pick<ApplicationEvent, 'starts_at' | 'ends_at' | 'is_all_day'>

/** When the event is over: the end of its day for all-day events, otherwise its end (or start) time. */
export function getEventEnd(event: EventTiming): Date {
  if (event.is_all_day) {
    const start = new Date(event.starts_at)
    return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999)
  }

  return new Date(event.ends_at ?? event.starts_at)
}

/** Upcoming means not yet marked done and not yet over. */
export function isEventUpcoming(event: EventTiming & Pick<ApplicationEvent, 'is_completed'>, now: Date = new Date()) {
  return !event.is_completed && getEventEnd(event).getTime() >= now.getTime()
}

interface SplitEvents<TEvent> {
  /** Soonest first. */
  upcoming: TEvent[]
  /** Most recent first. */
  past: TEvent[]
}

/** Splits events into upcoming and past/completed lists, each in reading order. */
export function splitEvents<TEvent extends EventTiming & Pick<ApplicationEvent, 'is_completed'>>(
  events: readonly TEvent[],
  now: Date = new Date(),
): SplitEvents<TEvent> {
  const byStart = [...events].sort(
    (first, second) => new Date(first.starts_at).getTime() - new Date(second.starts_at).getTime(),
  )

  return {
    upcoming: byStart.filter((event) => isEventUpcoming(event, now)),
    past: byStart.filter((event) => !isEventUpcoming(event, now)).reverse(),
  }
}

/** e.g. "12 Nov 2026 · All day" or "12 Nov 2026 · 10:00 – 11:30". */
export function formatEventTiming(event: EventTiming): string {
  const date = formatDate(event.starts_at)
  if (event.is_all_day) return `${date} · All day`

  const startTime = formatTime(event.starts_at)
  return event.ends_at ? `${date} · ${startTime} – ${formatTime(event.ends_at)}` : `${date} · ${startTime}`
}

/** "Today", "Tomorrow" or "In 5 days" for upcoming events; null for anything further than two weeks out. */
export function describeEventProximity(event: EventTiming, now: Date = new Date()): string | null {
  const daysUntil = getDaysUntil(event.starts_at, now)

  if (daysUntil <= 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  if (daysUntil <= 14) return `In ${daysUntil} days`
  return null
}
