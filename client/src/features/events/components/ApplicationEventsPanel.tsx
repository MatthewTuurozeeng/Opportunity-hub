import { CalendarPlus, CalendarRange } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'

import { useDeleteApplicationEvent, useSetApplicationEventCompleted } from '../hooks/useEventMutations'
import { useApplicationEvents } from '../hooks/useEventQueries'
import type { ApplicationEvent } from '../types/event.types'
import { splitEvents } from '../utils/eventTiming'
import { EventFormDialog } from './EventFormDialog'
import { EventListItem } from './EventListItem'

interface FormDialogState {
  /** Remounts the dialog per opening so the form starts fresh. */
  key: number
  event?: ApplicationEvent
}

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
  const setCompleted = useSetApplicationEventCompleted()
  const deleteEvent = useDeleteApplicationEvent()
  const [formDialog, setFormDialog] = useState<FormDialogState | null>(null)
  const [eventToDelete, setEventToDelete] = useState<ApplicationEvent | null>(null)

  const { upcoming, past } = useMemo(() => splitEvents(events ?? []), [events])

  function handleToggleCompleted(event: ApplicationEvent) {
    const isCompleted = !event.is_completed
    setCompleted.mutate(
      { eventId: event.id, isCompleted },
      {
        onSuccess: () => toast.success(isCompleted ? 'Event marked as done.' : 'Event marked as not done.'),
        onError: (updateError) => toast.error(updateError.message),
      },
    )
  }

  function handleConfirmDelete() {
    if (!eventToDelete) return

    deleteEvent.mutate(eventToDelete.id, {
      onSuccess: () => {
        toast.success('Event deleted.')
        setEventToDelete(null)
      },
      onError: (deleteError) => {
        toast.error(deleteError.message)
        setEventToDelete(null)
      },
    })
  }

  const addButton = (
    <Button onClick={() => setFormDialog({ key: Date.now() })}>
      <CalendarPlus aria-hidden="true" />
      Add event
    </Button>
  )

  function renderEvent(event: ApplicationEvent) {
    return (
      <EventListItem
        key={event.id}
        event={event}
        isUpdating={setCompleted.isPending && setCompleted.variables?.eventId === event.id}
        onEdit={(eventToEdit) => setFormDialog({ key: Date.now(), event: eventToEdit })}
        onDelete={setEventToDelete}
        onToggleCompleted={handleToggleCompleted}
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

      {formDialog && (
        <EventFormDialog
          key={formDialog.key}
          applicationId={applicationId}
          event={formDialog.event}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setFormDialog(null)}
        />
      )}

      <ConfirmDialog
        isOpen={eventToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setEventToDelete(null)}
        title="Delete this event?"
        description={`"${eventToDelete?.title ?? ''}" will be permanently removed from this application.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteEvent.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
