import { CircleCheck, MapPin, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import { EVENT_TYPE_DETAILS } from '../constants/eventTypes'
import type { ApplicationEvent } from '../types/event.types'
import { describeEventProximity, formatEventTiming, isEventUpcoming } from '../utils/eventTiming'
import { EventTypeIcon } from './EventTypeIcon'

interface EventListItemProps {
  event: ApplicationEvent
  /** Shows a link to the event's application (e.g. on the calendar). */
  application?: { id: string; title: string } | null
  isUpdating: boolean
  onEdit: (event: ApplicationEvent) => void
  onDelete: (event: ApplicationEvent) => void
  onToggleCompleted: (event: ApplicationEvent) => void
}

export function EventListItem({ event, application, isUpdating, onEdit, onDelete, onToggleCompleted }: EventListItemProps) {
  const isUpcoming = isEventUpcoming(event)
  const proximity = isUpcoming ? describeEventProximity(event) : null
  const typeLabel = EVENT_TYPE_DETAILS[event.event_type].label

  return (
    <li className="flex items-start gap-3 p-4">
      <EventTypeIcon eventType={event.event_type} className={cn(!isUpcoming && 'opacity-60')} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('font-medium break-words text-heading', event.is_completed && 'text-muted-foreground')}>
            {event.title}
          </p>
          {event.is_completed && (
            <Badge variant="outline" className="text-success-green">
              <CircleCheck aria-hidden="true" />
              Done
            </Badge>
          )}
          {proximity && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
              {proximity}
            </Badge>
          )}
        </div>
        <p className="text-supporting text-muted-foreground">
          {event.title !== typeLabel && <>{typeLabel} · </>}
          <time dateTime={event.starts_at}>{formatEventTiming(event)}</time>
        </p>
        {application && (
          <p className="text-supporting">
            <Link
              to={buildApplicationDetailPath(application.id)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {application.title}
            </Link>
          </p>
        )}
        {event.location && (
          <p className="flex items-center gap-1 text-supporting text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            <span className="sr-only">Location: </span>
            <span className="break-all">{event.location}</span>
          </p>
        )}
        {event.description && <p className="mt-1 text-body whitespace-pre-line">{event.description}</p>}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={isUpdating} aria-label={`Actions for ${event.title}`} />}
        >
          <MoreHorizontal aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onToggleCompleted(event)}>
            {event.is_completed ? <RotateCcw aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
            {event.is_completed ? 'Mark as not done' : 'Mark as done'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(event)}>
            <Pencil aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(event)}>
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
