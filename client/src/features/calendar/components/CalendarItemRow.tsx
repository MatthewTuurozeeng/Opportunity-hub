import { CalendarClock } from 'lucide-react'
import { Link } from 'react-router'

import { EventListItem } from '@/features/events/components/EventListItem'
import type { ApplicationEvent } from '@/features/events/types/event.types'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import type { CalendarItem } from '../utils/calendarUtils'

export interface CalendarEventHandlers {
  isUpdating: (eventId: string) => boolean
  onEdit: (event: ApplicationEvent) => void
  onDelete: (event: ApplicationEvent) => void
  onToggleCompleted: (event: ApplicationEvent) => void
}

interface CalendarItemRowProps {
  item: CalendarItem
  handlers: CalendarEventHandlers
}

/** One calendar entry: an event with its actions, or an application deadline. */
export function CalendarItemRow({ item, handlers }: CalendarItemRowProps) {
  if (item.kind === 'deadline') {
    return (
      <li className="flex items-start gap-3 p-4">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700"
        >
          <CalendarClock className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            to={buildApplicationDetailPath(item.applicationId)}
            className="font-medium break-words text-heading underline-offset-4 hover:text-primary hover:underline"
          >
            {item.title}
          </Link>
          <p className="text-supporting text-muted-foreground">Application deadline · {item.organization}</p>
        </div>
      </li>
    )
  }

  const { event } = item
  return (
    <EventListItem
      event={event}
      application={event.application ? { id: event.application.id, title: event.application.opportunity.title } : null}
      isUpdating={handlers.isUpdating(event.id)}
      onEdit={handlers.onEdit}
      onDelete={handlers.onDelete}
      onToggleCompleted={handlers.onToggleCompleted}
    />
  )
}
