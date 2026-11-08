import { describe, expect, it } from 'vitest'

import type { EventWithApplication } from '@/features/events/types/event.types'

import {
  addMonths,
  buildMonthGrid,
  getGridRange,
  groupCalendarItemsByDay,
  parseMonthParam,
  toDayKey,
  toMonthParam,
} from './calendarUtils'

describe('month params', () => {
  const now = new Date(2026, 10, 8)

  it('round-trips a month through the URL', () => {
    expect(toMonthParam(parseMonthParam('2027-02', now))).toBe('2027-02')
  })

  it('falls back to the current month for missing or invalid values', () => {
    expect(toMonthParam(parseMonthParam(null, now))).toBe('2026-11')
    expect(toMonthParam(parseMonthParam('2026-13', now))).toBe('2026-11')
    expect(toMonthParam(parseMonthParam('nonsense', now))).toBe('2026-11')
  })

  it('moves across years', () => {
    expect(toMonthParam(addMonths(new Date(2026, 11, 1), 1))).toBe('2027-01')
    expect(toMonthParam(addMonths(new Date(2026, 0, 1), -1))).toBe('2025-12')
  })
})

describe('buildMonthGrid', () => {
  it('starts on Monday and covers whole weeks', () => {
    // November 2026 starts on a Sunday and has 30 days.
    const grid = buildMonthGrid(new Date(2026, 10, 1), new Date(2026, 10, 8))

    expect(grid).toHaveLength(6)
    expect(grid.every((week) => week.length === 7)).toBe(true)
    expect(grid[0][0].key).toBe('2026-10-26')
    expect(grid[0][6]).toMatchObject({ key: '2026-11-01', isCurrentMonth: true })
    expect(grid[5][6].key).toBe('2026-12-06')
  })

  it('marks today', () => {
    const grid = buildMonthGrid(new Date(2026, 10, 1), new Date(2026, 10, 8))
    expect(grid.flat().filter((day) => day.isToday).map((day) => day.key)).toEqual(['2026-11-08'])
  })

  it('uses only the weeks it needs', () => {
    // February 2027 starts on a Monday and has 28 days.
    expect(buildMonthGrid(new Date(2027, 1, 1))).toHaveLength(4)
  })

  it('reports an exclusive end for fetching', () => {
    const { start, end } = getGridRange(buildMonthGrid(new Date(2026, 10, 1)))
    expect([toDayKey(start), toDayKey(end)]).toEqual(['2026-10-26', '2026-12-07'])
  })
})

describe('groupCalendarItemsByDay', () => {
  function event(id: string, startsAt: Date, isAllDay = false): EventWithApplication {
    return {
      id,
      user_id: 'user-1',
      application_id: null,
      event_type: 'interview',
      title: id,
      description: null,
      location: null,
      starts_at: startsAt.toISOString(),
      ends_at: null,
      is_all_day: isAllDay,
      is_completed: false,
      created_at: startsAt.toISOString(),
      updated_at: startsAt.toISOString(),
      application: null,
    }
  }

  it('groups by local day with all-day items first, then by time', () => {
    const itemsByDay = groupCalendarItemsByDay(
      [
        event('afternoon', new Date(2026, 10, 10, 15)),
        event('morning', new Date(2026, 10, 10, 9)),
        event('all-day', new Date(2026, 10, 10), true),
        event('other-day', new Date(2026, 10, 11, 9)),
      ],
      [
        { id: 'app', opportunity: { title: 'Grant', organization: 'Org', deadline: new Date(2026, 10, 10, 23, 59, 59).toISOString() } },
        { id: 'no-deadline', opportunity: { title: 'None', organization: 'Org', deadline: null } },
      ],
    )

    expect(itemsByDay.get('2026-11-10')?.map((item) => item.id)).toEqual([
      'event-all-day',
      'deadline-app',
      'event-morning',
      'event-afternoon',
    ])
    expect(itemsByDay.get('2026-11-11')?.map((item) => item.id)).toEqual(['event-other-day'])
    expect(itemsByDay.size).toBe(2)
  })
})
