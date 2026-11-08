import { describe, expect, it } from 'vitest'

import {
  fromDateInputValue,
  fromDateTimeInputValues,
  getDaysUntil,
  getTodayDateInputValue,
  toDateInputValue,
  toTimeInputValue,
} from './dateUtils'

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

describe('fromDateTimeInputValues', () => {
  it('combines a date and a time in local time', () => {
    const date = new Date(fromDateTimeInputValues('2026-11-20', '14:05')!)

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 20])
    expect([date.getHours(), date.getMinutes()]).toEqual([14, 5])
  })

  it('returns null when the date or time is missing or malformed', () => {
    expect(fromDateTimeInputValues('', '10:00')).toBeNull()
    expect(fromDateTimeInputValues('2026-11-20', '')).toBeNull()
    expect(fromDateTimeInputValues('2026-11-20', '24:00')).toBeNull()
    expect(fromDateTimeInputValues('2026-11-20', '9:00')).toBeNull()
  })
})

describe('toTimeInputValue', () => {
  it('returns an empty string for missing or invalid values', () => {
    expect(toTimeInputValue(null)).toBe('')
    expect(toTimeInputValue('not-a-date')).toBe('')
  })

  it('round-trips with fromDateTimeInputValues', () => {
    expect(toTimeInputValue(fromDateTimeInputValues('2026-11-20', '09:30'))).toBe('09:30')
  })
})
