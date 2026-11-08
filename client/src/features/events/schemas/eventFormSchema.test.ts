import { describe, expect, it } from 'vitest'

import type { ApplicationEvent } from '../types/event.types'
import { EMPTY_EVENT_FORM_VALUES, eventFormSchema, type EventFormValues, toEventFormValues, toEventPayload } from './eventFormSchema'

function buildValues(overrides: Partial<EventFormValues> = {}): EventFormValues {
  return { ...EMPTY_EVENT_FORM_VALUES, date: '2026-11-20', startTime: '10:00', ...overrides }
}

function getErrorPaths(values: EventFormValues): string[] {
  const result = eventFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('eventFormSchema', () => {
  it('accepts a timed event', () => {
    expect(getErrorPaths(buildValues({ endTime: '11:30' }))).toEqual([])
  })

  it('requires a date', () => {
    expect(getErrorPaths(buildValues({ date: '' }))).toContain('date')
  })

  it('requires a start time unless the event is all day', () => {
    expect(getErrorPaths(buildValues({ startTime: '' }))).toEqual(['startTime'])
    expect(getErrorPaths(buildValues({ startTime: '', isAllDay: true }))).toEqual([])
  })

  it('rejects an end time that is not after the start time', () => {
    expect(getErrorPaths(buildValues({ endTime: '10:00' }))).toEqual(['endTime'])
    expect(getErrorPaths(buildValues({ endTime: '09:00' }))).toEqual(['endTime'])
  })

  it('ignores leftover times on all-day events', () => {
    expect(getErrorPaths(buildValues({ isAllDay: true, startTime: '12:00', endTime: '08:00' }))).toEqual([])
  })
})

describe('toEventPayload', () => {
  it('stores a standalone event without an application', () => {
    expect(toEventPayload(buildValues()).application_id).toBeNull()
    expect(toEventPayload(buildValues({ applicationId: 'application-1' })).application_id).toBe('application-1')
  })

  it('falls back to the event type label when the title is blank', () => {
    expect(toEventPayload(buildValues({ eventType: 'assessment', title: '  ' })).title).toBe('Assessment')
  })

  it('stores local midnight and no end for all-day events', () => {
    const payload = toEventPayload(buildValues({ isAllDay: true, endTime: '12:00' }))
    const startsAt = new Date(payload.starts_at)

    expect(payload.is_all_day).toBe(true)
    expect(payload.ends_at).toBeNull()
    expect([startsAt.getDate(), startsAt.getHours(), startsAt.getMinutes()]).toEqual([20, 0, 0])
  })

  it('combines the date with the start and end times', () => {
    const payload = toEventPayload(buildValues({ startTime: '09:15', endTime: '10:45', location: '  Room 4 ' }))

    expect(new Date(payload.starts_at).getHours()).toBe(9)
    expect(new Date(payload.ends_at!).getMinutes()).toBe(45)
    expect(payload.location).toBe('Room 4')
    expect(payload.description).toBeNull()
  })
})

describe('toEventFormValues', () => {
  it('round-trips a timed event', () => {
    const values = buildValues({ applicationId: 'application-1', title: 'Panel interview', startTime: '14:00', endTime: '15:00', location: 'Online' })
    const payload = toEventPayload(values)
    const event = { ...payload, id: 'event-1', is_completed: false } as ApplicationEvent

    expect(toEventFormValues(event)).toEqual(values)
  })
})
