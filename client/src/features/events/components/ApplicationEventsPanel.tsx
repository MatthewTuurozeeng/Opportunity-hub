import { CalendarPlus, CalendarRange } from 'lucide-react'
import { type ReactNode, useMemo } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'

import { useEventActions } from '../hooks/useEventActions'
import { useApplicationEvents } from '../hooks/useEventQueries'
import type { ApplicationEvent } from '../types/event.types'
import { splitEvents } from '../utils/eventTiming'
import { EventListItem } from './EventListItem'

interface EventGroupProps {
  title: string
  events: ApplicationEvent[]
  renderEvent: (event: ApplicationEvent) => ReactNode
}

function EventGroup({ title, events, renderEvent }: EventGroupProps) {
  const headingId = `events-${title.toLowerCase().replace(/\W+/g, '-')}`

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="border-b border-border bg-muted/40 px-4 py-2 text-supporting font-medium text-muted-foreground">
        {title} <span className="font-normal">({events.length})</span>
      </h3>
      <ul className="divide-y divide-border">{events.map(renderEvent)}</ul>
    </section>
  )
}

interface ApplicationEventsPanelProps {
  applicationId: string
}

/** Deadlines, interviews, assessments and reminders for one application. */
export function ApplicationEventsPanel({ applicationId }: ApplicationEventsPanelProps) {
  const { data: events, isLoading, error, refetch } = useApplicationEvents(applicationId)
  const actions = useEventActions({ fixedApplicationId: applicationId })

  const { upcoming, past } = useMemo(() => splitEvents(events ?? []), [events])

  const addButton = (
    <Button onClick={() => actions.openNewEvent()}>
      <CalendarPlus aria-hidden="true" />
      Add event
    </Button>
  )

  function renderEvent(event: ApplicationEvent) {
    return (
      <EventListItem
        key={event.id}
        event={event}
        isUpdating={actions.isUpdating(event.id)}
        onEdit={actions.openEditEvent}
        onDelete={actions.requestDeleteEvent}
        onToggleCompleted={actions.toggleCompleted}
      />
    )
  }

  function renderContent() {
    if (isLoading) return <LoadingState label="Loading events…" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!events?.length) {
      return (
        <EmptyState
          icon={CalendarRange}
          title="No events yet"
          description="Add interviews, assessments, follow-up reminders and other important dates for this application."
          action={addButton}
        />
      )
    }

    return (
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border p-4">
          <h2 className="text-section-heading font-semibold">Events</h2>
          {addButton}
        </header>
        {upcoming.length > 0 ? (
          <EventGroup title="Upcoming" events={upcoming} renderEvent={renderEvent} />
        ) : (
          <p className="border-b border-border px-4 py-3 text-body text-muted-foreground">Nothing upcoming.</p>
        )}
        {past.length > 0 && <EventGroup title="Past and completed" events={past} renderEvent={renderEvent} />}
      </section>
    )
  }

  return (
    <>
      {renderContent()}
      {actions.dialogs}
    </>
  )
}
