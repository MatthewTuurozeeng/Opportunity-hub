// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { buildMonthGrid, type CalendarItem, toDayKey } from '../utils/calendarUtils'
import { MonthGrid } from './MonthGrid'

const grid = buildMonthGrid(new Date(2026, 10, 1), new Date(2026, 10, 8))

/** The same date wording the grid uses, so the test passes in any locale. */
const fullDayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function dayName(day: number): string {
  return fullDayFormatter.format(new Date(2026, 10, day))
}

const deadline: CalendarItem = {
  kind: 'deadline',
  id: 'deadline-1',
  occursAt: new Date(2026, 10, 12, 23, 59).toISOString(),
  isAllDay: true,
  applicationId: 'application-1',
  title: 'Data Fellowship',
  organization: 'Acme',
}

function renderGrid(selectedDayKey = '2026-11-08') {
  const onSelectDay = vi.fn()
  render(
    <MonthGrid
      grid={grid}
      itemsByDay={new Map([['2026-11-12', [deadline]]])}
      selectedDayKey={selectedDayKey}
      onSelectDay={onSelectDay}
    />,
  )
  return { onSelectDay, user: userEvent.setup() }
}

function selectedKeyFrom(onSelectDay: ReturnType<typeof vi.fn>): string {
  return toDayKey(onSelectDay.mock.calls.at(-1)?.[0] as Date)
}

describe('MonthGrid', () => {
  it('gives only the selected day a tab stop and marks today', () => {
    renderGrid()

    const focusable = screen.getAllByRole('button').filter((button) => button.tabIndex === 0)
    expect(focusable).toHaveLength(1)
    expect(focusable[0]).toHaveAttribute('aria-pressed', 'true')
    expect(focusable[0]).toHaveAttribute('aria-current', 'date')
  })

  it('describes each day with its number of items', () => {
    renderGrid()
    expect(screen.getByRole('button', { name: `${dayName(12)}: 1 item` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `${dayName(13)}: nothing scheduled` })).toBeInTheDocument()
  })

  it('moves between days with the arrow keys, Home and End', async () => {
    const { onSelectDay, user } = renderGrid()
    screen.getByRole('button', { pressed: true }).focus()

    await user.keyboard('{ArrowRight}')
    expect(selectedKeyFrom(onSelectDay)).toBe('2026-11-09')

    await user.keyboard('{ArrowDown}')
    expect(selectedKeyFrom(onSelectDay)).toBe('2026-11-15')

    await user.keyboard('{ArrowUp}')
    expect(selectedKeyFrom(onSelectDay)).toBe('2026-11-01')

    // 8 November 2026 is a Sunday, the last day of a Monday-first week.
    await user.keyboard('{Home}')
    expect(selectedKeyFrom(onSelectDay)).toBe('2026-11-02')
  })

  it('selects a day on click', async () => {
    const { onSelectDay, user } = renderGrid()
    await user.click(screen.getByRole('button', { name: `${dayName(12)}: 1 item` }))
    expect(selectedKeyFrom(onSelectDay)).toBe('2026-11-12')
  })
})
