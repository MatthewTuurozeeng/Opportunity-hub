import { describe, expect, it } from 'vitest'

import type { ApplicationEvent } from '@/features/events/types/event.types'

import type { StatusHistoryEntry } from '../types/application.types'
import { buildApplicationTimeline } from './applicationTimeline'

function statusEntry(id: string, changedAt: string): StatusHistoryEntry {
  return {
    id,
    user_id: 'user-1',
    application_id: 'application-1',
    previous_status: null,
    new_status: 'draft',
    changed_at: changedAt,
    notes: null,
  }
}

function event(id: string, startsAt: string): ApplicationEvent {
  return {
    id,
    user_id: 'user-1',
    application_id: 'application-1',
    event_type: 'interview',
    title: 'Interview',
    description: null,
    location: null,
    starts_at: startsAt,
    ends_at: null,
    is_all_day: false,
    is_completed: false,
    created_at: startsAt,
    updated_at: startsAt,
  }
}

describe('buildApplicationTimeline', () => {
  it('merges status changes, events and the deadline newest first', () => {
    const items = buildApplicationTimeline({
      statusHistory: [statusEntry('created', '2026-10-01T09:00:00Z'), statusEntry('submitted', '2026-10-15T09:00:00Z')],
      events: [event('interview', '2026-11-20T10:00:00Z')],
      deadline: '2026-10-31T23:59:59Z',
    })

    expect(items.map((item) => item.id)).toEqual(['event-interview', 'deadline', 'status-submitted', 'status-created'])
  })

  it('marks future events and deadlines as scheduled', () => {
    const items = buildApplicationTimeline({
      statusHistory: [statusEntry('created', '2026-10-01T09:00:00Z')],
      events: [event('past', '2026-10-20T10:00:00Z'), event('future', '2026-11-20T10:00:00Z')],
      deadline: '2026-11-30T23:59:59Z',
      now: new Date('2026-11-08T12:00:00Z'),
    })

    expect(Object.fromEntries(items.map((item) => [item.id, item.isScheduled]))).toEqual({
      'status-created': false,
      'event-past': false,
      'event-future': true,
      deadline: true,
    })
  })

  it('omits the deadline when there is none', () => {
    const items = buildApplicationTimeline({ statusHistory: [], events: [], deadline: null })
    expect(items).toEqual([])
  })

  it('compares timestamps by time, not by text', () => {
    const items = buildApplicationTimeline({
      statusHistory: [statusEntry('later', '2026-10-01T10:00:00+00:00')],
      events: [event('earlier', '2026-10-01T11:00:00+02:00')],
      deadline: null,
    })

    expect(items.map((item) => item.id)).toEqual(['status-later', 'event-earlier'])
  })
})
