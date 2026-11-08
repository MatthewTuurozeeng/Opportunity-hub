import { cn } from '@/lib/utils'

import { type ApplicationEventType, EVENT_TYPE_DETAILS } from '../constants/eventTypes'

interface EventTypeIconProps {
  eventType: ApplicationEventType
  className?: string
}

/** Decorative icon chip for an event type. Always pair it with the type's text label. */
export function EventTypeIcon({ eventType, className }: EventTypeIconProps) {
  const { icon: Icon, iconClassName } = EVENT_TYPE_DETAILS[eventType]

  return (
    <span
      aria-hidden="true"
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', iconClassName, className)}
    >
      <Icon className="size-4" />
    </span>
  )
}
