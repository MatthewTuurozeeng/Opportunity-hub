import { describe, expect, it } from 'vitest'

import type { ApplicationStatus } from '@/features/applications/constants/applicationStatuses'
import type { EventWithApplication } from '@/features/events/types/event.types'

import { buildUpcomingItems, type DeadlineSource } from './upcomingItems'

const now = new Date(2026, 10, 8, 12)

function event(id: string, startsAt: Date, overrides: Partial<EventWithApplication> = {}): EventWithApplication {
  return {
    id,
    user_id: 'user-1',
    application_id: 'application-1',
    event_type: 'interview',
    title: 'Interview',
    description: null,
    location: null,
    starts_at: startsAt.toISOString(),
    ends_at: null,
    is_all_day: false,
    is_completed: false,
    created_at: startsAt.toISOString(),
    updated_at: startsAt.toISOString(),
    application: { id: 'application-1', opportunity: { title: 'Fellowship', organization: 'Acme' } },
    ...overrides,
  }
}

function application(id: string, status: ApplicationStatus, deadline: Date | null): DeadlineSource {
  return { id, status, opportunity: { title: id, organization: 'Org', deadline: deadline?.toISOString() ?? null } }
}

describe('buildUpcomingItems', () => {
  it('merges upcoming events and draft deadlines, soonest first', () => {
    const items = buildUpcomingItems(
      [event('interview', new Date(2026, 10, 12, 10)), event('earlier-today', new Date(2026, 10, 8, 9))],
      [
        application('draft-soon', 'draft', new Date(2026, 10, 10, 23, 59)),
        application('submitted', 'submitted', new Date(2026, 10, 9)),
        application('draft-passed', 'draft', new Date(2026, 10, 1)),
        application('draft-no-deadline', 'draft', null),
      ],
      { limit: 10, now },
    )

    expect(items.map((item) => item.id)).toEqual(['deadline-draft-soon', 'event-interview'])
  })

  it('keeps all-day events for today and respects the limit', () => {
    const items = buildUpcomingItems(
      [
        event('today', new Date(2026, 10, 8), { is_all_day: true }),
        event('tomorrow', new Date(2026, 10, 9, 9)),
        event('later', new Date(2026, 10, 20, 9)),
      ],
      [],
      { limit: 2, now },
    )

    expect(items.map((item) => item.id)).toEqual(['event-today', 'event-tomorrow'])
  })
})
