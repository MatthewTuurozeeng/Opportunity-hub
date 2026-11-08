import { CalendarClock, History } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Badge } from '@/components/ui/badge'
import { EventTypeIcon } from '@/features/events/components/EventTypeIcon'
import { EVENT_TYPE_DETAILS } from '@/features/events/constants/eventTypes'
import { useApplicationEvents } from '@/features/events/hooks/useEventQueries'
import { formatEventTiming } from '@/features/events/utils/eventTiming'
import { formatDate, formatDateTime } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

import { APPLICATION_STATUS_DETAILS } from '../constants/applicationStatuses'
import { useApplicationStatusHistory } from '../hooks/useApplicationQueries'
import type { ApplicationRecord, StatusHistoryEntry } from '../types/application.types'
import { type ApplicationTimelineItem, buildApplicationTimeline } from '../utils/applicationTimeline'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'

function StatusChangeContent({ entry }: { entry: StatusHistoryEntry }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {entry.previous_status ? (
          <>
            <ApplicationStatusBadge status={entry.previous_status} />
            <span className="text-muted-foreground" aria-hidden="true">
              →
            </span>
            <span className="sr-only">changed to</span>
          </>
        ) : (
          <span className="text-body text-muted-foreground">Created as</span>
        )}
        <ApplicationStatusBadge status={entry.new_status} />
      </div>
      <p className="mt-1 text-supporting text-muted-foreground">
        <time dateTime={entry.changed_at}>{formatDateTime(entry.changed_at)}</time>
        <span className="sr-only">: {APPLICATION_STATUS_DETAILS[entry.new_status].description}</span>
      </p>
      {entry.notes && <p className="mt-2 rounded-md bg-muted px-3 py-2 text-body whitespace-pre-line">{entry.notes}</p>}
    </>
  )
}

function ScheduledBadge() {
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
      Scheduled
    </Badge>
  )
}

function TimelineItemContent({ item }: { item: ApplicationTimelineItem }) {
  switch (item.kind) {
    case 'status':
      return <StatusChangeContent entry={item.entry} />

    case 'event': {
      const { event } = item
      return (
        <div className="flex items-start gap-3">
          <EventTypeIcon eventType={event.event_type} className="size-7" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium break-words text-heading">{event.title}</p>
              {item.isScheduled && <ScheduledBadge />}
            </div>
            <p className="text-supporting text-muted-foreground">
              {EVENT_TYPE_DETAILS[event.event_type].label} ·{' '}
              <time dateTime={event.starts_at}>{formatEventTiming(event)}</time>
            </p>
          </div>
        </div>
      )
    }

    case 'deadline':
      return (
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700"
          >
            <CalendarClock className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-heading">Application deadline</p>
              {item.isScheduled && <ScheduledBadge />}
            </div>
            <p className="text-supporting text-muted-foreground">
              <time dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time>
            </p>
          </div>
        </div>
      )
  }
}

interface ApplicationActivityTimelineProps {
  application: ApplicationRecord
}

/** Status changes, events and the deadline for one application, newest first. */
export function ApplicationActivityTimeline({ application }: ApplicationActivityTimelineProps) {
  const statusHistory = useApplicationStatusHistory(application.id)
  const events = useApplicationEvents(application.id)

  if (statusHistory.isLoading || events.isLoading) return <LoadingState label="Loading timeline…" />

  const error = statusHistory.error ?? events.error
  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => {
          if (statusHistory.error) statusHistory.refetch()
          if (events.error) events.refetch()
        }}
      />
    )
  }

  const items = buildApplicationTimeline({
    statusHistory: statusHistory.data ?? [],
    events: events.data ?? [],
    deadline: application.opportunity.deadline,
  })

  if (!items.length) {
    return <EmptyState icon={History} title="No activity yet" description="Status changes and events will appear here." />
  }

  return (
    <ol className="relative flex flex-col gap-5 border-l border-border pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-1.5 -left-[1.8rem] size-2.5 rounded-full border-2 border-card',
              item.kind === 'status' ? 'bg-primary' : 'bg-golden-yellow',
            )}
          />
          <TimelineItemContent item={item} />
        </li>
      ))}
    </ol>
  )
}
