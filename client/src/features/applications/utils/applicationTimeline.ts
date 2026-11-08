import type { ApplicationEvent } from '@/features/events/types/event.types'
import { isEventUpcoming } from '@/features/events/utils/eventTiming'

import type { StatusHistoryEntry } from '../types/application.types'

interface TimelineItemBase {
  id: string
  occurredAt: string
  /** Still ahead: an upcoming event or a deadline that has not passed. */
  isScheduled: boolean
}

export type ApplicationTimelineItem =
  | (TimelineItemBase & { kind: 'status'; entry: StatusHistoryEntry })
  | (TimelineItemBase & { kind: 'event'; event: ApplicationEvent })
  | (TimelineItemBase & { kind: 'deadline' })

interface BuildApplicationTimelineInput {
  statusHistory: readonly StatusHistoryEntry[]
  events: readonly ApplicationEvent[]
  /** The opportunity's application deadline, if it has one. */
  deadline: string | null
  now?: Date
}

/**
 * Merges status changes, events and the application deadline into one
 * chronological list, newest first.
 */
export function buildApplicationTimeline({
  statusHistory,
  events,
  deadline,
  now = new Date(),
}: BuildApplicationTimelineInput): ApplicationTimelineItem[] {
  const items: ApplicationTimelineItem[] = [
    ...statusHistory.map((entry) => ({
      kind: 'status' as const,
      id: `status-${entry.id}`,
      occurredAt: entry.changed_at,
      isScheduled: false,
      entry,
    })),
    ...events.map((event) => ({
      kind: 'event' as const,
      id: `event-${event.id}`,
      occurredAt: event.starts_at,
      isScheduled: isEventUpcoming(event, now),
      event,
    })),
  ]

  if (deadline) {
    items.push({
      kind: 'deadline',
      id: 'deadline',
      occurredAt: deadline,
      isScheduled: new Date(deadline).getTime() >= now.getTime(),
    })
  }

  // Array.prototype.sort is stable, so items at the same moment keep the order above.
  return items.sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime())
}
