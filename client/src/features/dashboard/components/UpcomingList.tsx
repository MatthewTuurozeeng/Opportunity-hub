import { CalendarCheck, CalendarClock } from 'lucide-react'
import { Link } from 'react-router'

import { EventTypeIcon } from '@/features/events/components/EventTypeIcon'
import { EVENT_TYPE_DETAILS } from '@/features/events/constants/eventTypes'
import { describeEventProximity, formatEventTiming } from '@/features/events/utils/eventTiming'
import { formatDate } from '@/lib/dateUtils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import type { UpcomingItem } from '../utils/upcomingItems'

const LINK_CLASS_NAME = 'font-medium text-heading underline-offset-4 hover:text-primary hover:underline'

function ProximityLabel({ occursAt }: { occursAt: string }) {
  const proximity = describeEventProximity({ starts_at: occursAt, ends_at: null, is_all_day: true })
  if (!proximity) return null
  return <span className="text-supporting font-medium text-amber-700">{proximity}</span>
}

function UpcomingRow({ item }: { item: UpcomingItem }) {
  if (item.kind === 'deadline') {
    return (
      <li className="flex items-start gap-3 py-3">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700"
        >
          <CalendarClock className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link to={buildApplicationDetailPath(item.applicationId)} className={LINK_CLASS_NAME}>
            {item.title}
          </Link>
          <p className="text-supporting text-muted-foreground">
            Application deadline · <time dateTime={item.occursAt}>{formatDate(item.occursAt)}</time>
          </p>
        </div>
        <ProximityLabel occursAt={item.occursAt} />
      </li>
    )
  }

  const { event } = item
  const opportunity = event.application?.opportunity

  return (
    <li className="flex items-start gap-3 py-3">
      <EventTypeIcon eventType={event.event_type} className="size-8" />
      <div className="flex min-w-0 flex-1 flex-col">
        {event.application ? (
          <Link to={buildApplicationDetailPath(event.application.id)} className={LINK_CLASS_NAME}>
            {event.title}
          </Link>
        ) : (
          <p className="font-medium text-heading">{event.title}</p>
        )}
        <p className="text-supporting text-muted-foreground">
          {EVENT_TYPE_DETAILS[event.event_type].label}
          {opportunity && <> · {opportunity.title}</>}
        </p>
        <p className="text-supporting text-muted-foreground">
          <time dateTime={event.starts_at}>{formatEventTiming(event)}</time>
        </p>
      </div>
      <ProximityLabel occursAt={event.starts_at} />
    </li>
  )
}

interface UpcomingListProps {
  items: readonly UpcomingItem[]
}

export function UpcomingList({ items }: UpcomingListProps) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CalendarCheck className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-body text-muted-foreground">
          Nothing coming up. Add interviews and reminders from an application's Timeline tab.
        </p>
      </div>
    )
  }

  return (
    <ul className="-my-3 divide-y divide-border">
      {items.map((item) => (
        <UpcomingRow key={item.id} item={item} />
      ))}
    </ul>
  )
}
