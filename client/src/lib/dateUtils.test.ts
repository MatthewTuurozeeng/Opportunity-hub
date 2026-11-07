import { describe, expect, it } from 'vitest'

import { fromDateInputValue, getDaysUntil, getTodayDateInputValue, toDateInputValue } from './dateUtils'

describe('toDateInputValue', () => {
  it('returns an empty string for missing or invalid values', () => {
    expect(toDateInputValue(null)).toBe('')
    expect(toDateInputValue(undefined)).toBe('')
    expect(toDateInputValue('not-a-date')).toBe('')
  })

  it('round-trips with fromDateInputValue', () => {
    expect(toDateInputValue(fromDateInputValue('2026-12-01'))).toBe('2026-12-01')
    expect(toDateInputValue(fromDateInputValue('2026-12-01', { endOfDay: true }))).toBe('2026-12-01')
  })
})

describe('fromDateInputValue', () => {
  it('returns null for empty or malformed input', () => {
    expect(fromDateInputValue('')).toBeNull()
    expect(fromDateInputValue('12/01/2026')).toBeNull()
  })

  it('uses local midnight by default and 23:59:59 for end of day', () => {
    const startOfDay = new Date(fromDateInputValue('2026-03-15')!)
    const endOfDay = new Date(fromDateInputValue('2026-03-15', { endOfDay: true })!)

    expect([startOfDay.getHours(), startOfDay.getMinutes()]).toEqual([0, 0])
    expect([endOfDay.getHours(), endOfDay.getMinutes(), endOfDay.getSeconds()]).toEqual([23, 59, 59])
  })
})

describe('getDaysUntil', () => {
  const now = new Date(2026, 10, 7, 15, 30)

  it('counts calendar days regardless of time of day', () => {
    expect(getDaysUntil(new Date(2026, 10, 7, 23, 59).toISOString(), now)).toBe(0)
    expect(getDaysUntil(new Date(2026, 10, 8, 0, 1).toISOString(), now)).toBe(1)
    expect(getDaysUntil(new Date(2026, 10, 14).toISOString(), now)).toBe(7)
  })

  it('is negative for past dates', () => {
    expect(getDaysUntil(new Date(2026, 10, 5).toISOString(), now)).toBe(-2)
  })
})

describe('getTodayDateInputValue', () => {
  it('formats the given date as YYYY-MM-DD', () => {
    expect(getTodayDateInputValue(new Date(2026, 0, 9, 12))).toBe('2026-01-09')
  })
})
