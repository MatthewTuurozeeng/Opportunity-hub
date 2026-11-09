import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApplications } from '@/features/applications/hooks/useApplicationQueries'
import { useEventActions } from '@/features/events/hooks/useEventActions'
import { useEventsBetween } from '@/features/events/hooks/useEventQueries'

import { type CalendarEventHandlers, CalendarItemRow } from '../components/CalendarItemRow'
import { MonthGrid } from '../components/MonthGrid'
import {
  addMonths,
  buildMonthGrid,
  type CalendarItem,
  getGridRange,
  groupCalendarItemsByDay,
  isSameMonth,
  parseMonthParam,
  startOfMonth,
  toDayKey,
  toMonthParam,
} from '../utils/calendarUtils'

const MONTH_SEARCH_PARAM = 'month'

const monthTitleFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const dayTitleFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

/** Today when it is in the month, otherwise the 1st. */
function getDefaultDayKey(month: Date, now: Date): string {
  return toDayKey(isSameMonth(month, now) ? now : month)
}

function ItemList({ items, handlers }: { items: readonly CalendarItem[]; handlers: CalendarEventHandlers }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <CalendarItemRow key={item.id} item={item} handlers={handlers} />
      ))}
    </ul>
  )
}

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // "Now" is fixed for the page's lifetime so renders stay pure.
  const [nowTime] = useState(() => Date.now())
  const now = new Date(nowTime)
  const month = parseMonthParam(searchParams.get(MONTH_SEARCH_PARAM), now)
  const monthKey = toMonthParam(month)
  const [chosenDayKey, setChosenDayKey] = useState<string | null>(null)

  // The React Compiler memoizes these; the event query key is built from strings, so it stays stable.
  const grid = buildMonthGrid(month, now)
  const { start, end } = getGridRange(grid)

  const events = useEventsBetween(start, end)
  const applications = useApplications()
  const actions = useEventActions()

  const itemsByDay = useMemo(
    () => groupCalendarItemsByDay(events.data ?? [], applications.data ?? []),
    [events.data, applications.data],
  )

  // Keep the selection inside the month shown (e.g. after the back button changes the month).
  const selectedDayKey =
    chosenDayKey && chosenDayKey.startsWith(monthKey) ? chosenDayKey : getDefaultDayKey(month, now)
  const selectedDay = grid.flat().find((day) => day.key === selectedDayKey)
  const selectedItems = itemsByDay.get(selectedDayKey) ?? []

  const agendaDays = grid
    .flat()
    .filter((day) => day.isCurrentMonth && itemsByDay.has(day.key))
    .map((day) => ({ day, items: itemsByDay.get(day.key) ?? [] }))

  const handlers: CalendarEventHandlers = {
    isUpdating: actions.isUpdating,
    onEdit: actions.openEditEvent,
    onDelete: actions.requestDeleteEvent,
    onToggleCompleted: actions.toggleCompleted,
  }

  function showMonth(nextMonth: Date, dayKey?: string) {
    setSearchParams(
      (params) => {
        const nextParams = new URLSearchParams(params)
        if (isSameMonth(nextMonth, now)) nextParams.delete(MONTH_SEARCH_PARAM)
        else nextParams.set(MONTH_SEARCH_PARAM, toMonthParam(nextMonth))
        return nextParams
      },
      { replace: false },
    )
    setChosenDayKey(dayKey ?? getDefaultDayKey(nextMonth, now))
  }

  function selectDay(date: Date) {
    if (isSameMonth(date, month)) setChosenDayKey(toDayKey(date))
    else showMonth(startOfMonth(date), toDayKey(date))
  }

  function renderBody() {
    if (events.isLoading || applications.isLoading) return <LoadingState label="Loading calendar…" />

    const error = events.error ?? applications.error
    if (error) {
      return (
        <ErrorState
          message={error.message}
          onRetry={() => {
            if (events.error) events.refetch()
            if (applications.error) applications.refetch()
          }}
        />
      )
    }

    return (
      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="grid items-start gap-4 pt-4 xl:grid-cols-[1fr_22rem]">
          <MonthGrid grid={grid} itemsByDay={itemsByDay} selectedDayKey={selectedDayKey} onSelectDay={selectDay} />

          <section aria-live="polite" className="overflow-hidden rounded-lg border border-border bg-card">
            <header className="flex items-center justify-between gap-3 border-b border-border p-4">
              <h2 className="text-card-title font-semibold">
                {selectedDay ? dayTitleFormatter.format(selectedDay.date) : 'Selected day'}
              </h2>
              <Button variant="outline" size="sm" onClick={() => actions.openNewEvent(selectedDayKey)}>
                <CalendarPlus aria-hidden="true" />
                Add
              </Button>
            </header>
            {selectedItems.length ? (
              <ItemList items={selectedItems} handlers={handlers} />
            ) : (
              <p className="p-4 text-body text-muted-foreground">Nothing scheduled.</p>
            )}
          </section>
        </TabsContent>

        <TabsContent value="agenda" className="pt-4">
          {agendaDays.length ? (
            <div className="flex flex-col gap-4">
              {agendaDays.map(({ day, items }) => (
                <section key={day.key} className="overflow-hidden rounded-lg border border-border bg-card">
                  <h2 className="border-b border-border bg-muted/40 px-4 py-2 text-supporting font-semibold">
                    <time dateTime={day.key}>{dayTitleFormatter.format(day.date)}</time>
                    {day.isToday && <span className="font-normal text-muted-foreground"> · Today</span>}
                  </h2>
                  <ItemList items={items} handlers={handlers} />
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={`Nothing scheduled in ${monthTitleFormatter.format(month)}`}
              description="Events and application deadlines for this month will be listed here in date order."
            />
          )}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <>
      <PageHeader
        title="Calendar & Timeline"
        description="View important dates."
        actions={
          <Button size="lg" onClick={() => actions.openNewEvent(selectedDayKey)}>
            <CalendarPlus aria-hidden="true" />
            Add event
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => showMonth(addMonths(month, -1))} aria-label="Previous month">
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => showMonth(addMonths(month, 1))} aria-label="Next month">
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          onClick={() => showMonth(startOfMonth(now), toDayKey(now))}
          disabled={isSameMonth(month, now) && selectedDayKey === toDayKey(now)}
        >
          Today
        </Button>
        <h2 aria-live="polite" className="ml-2 text-section-heading font-semibold">
          {monthTitleFormatter.format(month)}
        </h2>
        {events.isFetching && !events.isLoading && (
          <span className="text-supporting text-muted-foreground" role="status">
            Updating…
          </span>
        )}
      </div>

      {renderBody()}
      {actions.dialogs}
    </>
  )
}
