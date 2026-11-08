import type { ApplicationStatus } from '@/features/applications/constants/applicationStatuses'
import type { EventWithApplication } from '@/features/events/types/event.types'
import { isEventUpcoming } from '@/features/events/utils/eventTiming'

export type UpcomingItem =
  | { kind: 'event'; id: string; occursAt: string; event: EventWithApplication }
  | {
      kind: 'deadline'
      id: string
      occursAt: string
      applicationId: string
      title: string
      organization: string
    }

/** The fields needed to find upcoming application deadlines. */
export interface DeadlineSource {
  id: string
  status: ApplicationStatus
  opportunity: { title: string; organization: string; deadline: string | null }
}

/**
 * Upcoming events plus deadlines of applications still being prepared (drafts),
 * soonest first. Submitted applications' deadlines no longer need attention.
 */
export function buildUpcomingItems(
  events: readonly EventWithApplication[],
  applications: readonly DeadlineSource[],
  { limit, now = new Date() }: { limit: number; now?: Date },
): UpcomingItem[] {
  const items: UpcomingItem[] = events
    .filter((event) => isEventUpcoming(event, now))
    .map((event) => ({ kind: 'event', id: `event-${event.id}`, occursAt: event.starts_at, event }))

  for (const application of applications) {
    const { deadline } = application.opportunity
    if (application.status !== 'draft' || !deadline || new Date(deadline).getTime() < now.getTime()) continue

    items.push({
      kind: 'deadline',
      id: `deadline-${application.id}`,
      occursAt: deadline,
      applicationId: application.id,
      title: application.opportunity.title,
      organization: application.opportunity.organization,
    })
  }

  return items
    .sort((first, second) => new Date(first.occursAt).getTime() - new Date(second.occursAt).getTime())
    .slice(0, limit)
}
