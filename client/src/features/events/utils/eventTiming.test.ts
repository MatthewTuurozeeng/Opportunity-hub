import { describe, expect, it } from 'vitest'

import { describeEventProximity, getEventEnd, isEventUpcoming, splitEvents } from './eventTiming'

const now = new Date(2026, 10, 8, 12, 0)

function buildEvent(id: string, startsAt: Date, overrides: { ends_at?: string | null; is_all_day?: boolean; is_completed?: boolean } = {}) {
  return { id, starts_at: startsAt.toISOString(), ends_at: null, is_all_day: false, is_completed: false, ...overrides }
}

describe('getEventEnd', () => {
  it('uses the end of the day for all-day events', () => {
    const end = getEventEnd(buildEvent('a', new Date(2026, 10, 8), { is_all_day: true }))
    expect([end.getDate(), end.getHours(), end.getMinutes()]).toEqual([8, 23, 59])
  })

  it('uses the end time, falling back to the start time', () => {
    const start = new Date(2026, 10, 8, 9)
    const end = new Date(2026, 10, 8, 13)

    expect(getEventEnd(buildEvent('a', start)).getTime()).toBe(start.getTime())
    expect(getEventEnd(buildEvent('a', start, { ends_at: end.toISOString() })).getTime()).toBe(end.getTime())
  })
})

describe('isEventUpcoming', () => {
  it('treats an all-day event today as upcoming', () => {
    expect(isEventUpcoming(buildEvent('a', new Date(2026, 10, 8), { is_all_day: true }), now)).toBe(true)
  })

  it('treats an event in progress as upcoming', () => {
    const event = buildEvent('a', new Date(2026, 10, 8, 11), { ends_at: new Date(2026, 10, 8, 13).toISOString() })
    expect(isEventUpcoming(event, now)).toBe(true)
  })

  it('is false for finished or completed events', () => {
    expect(isEventUpcoming(buildEvent('a', new Date(2026, 10, 8, 9)), now)).toBe(false)
    expect(isEventUpcoming(buildEvent('a', new Date(2026, 10, 9), { is_completed: true }), now)).toBe(false)
  })
})

describe('splitEvents', () => {
  it('orders upcoming soonest first and past most recent first', () => {
    const events = [
      buildEvent('far-future', new Date(2026, 11, 1)),
      buildEvent('old', new Date(2026, 9, 1)),
      buildEvent('soon', new Date(2026, 10, 9)),
      buildEvent('recent', new Date(2026, 10, 7)),
      buildEvent('done-future', new Date(2026, 10, 10), { is_completed: true }),
    ]

    const { upcoming, past } = splitEvents(events, now)

    expect(upcoming.map((event) => event.id)).toEqual(['soon', 'far-future'])
    expect(past.map((event) => event.id)).toEqual(['done-future', 'recent', 'old'])
  })
})

describe('describeEventProximity', () => {
  it('describes events in the next two weeks', () => {
    expect(describeEventProximity(buildEvent('a', new Date(2026, 10, 8, 18)), now)).toBe('Today')
    expect(describeEventProximity(buildEvent('a', new Date(2026, 10, 9, 8)), now)).toBe('Tomorrow')
    expect(describeEventProximity(buildEvent('a', new Date(2026, 10, 13)), now)).toBe('In 5 days')
    expect(describeEventProximity(buildEvent('a', new Date(2026, 11, 1)), now)).toBeNull()
  })
})
