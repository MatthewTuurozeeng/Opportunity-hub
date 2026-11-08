import type { Tables } from '@/types/database.types'

import type { ApplicationEventType } from '../constants/eventTypes'

export type ApplicationEvent = Tables<'application_events'>

/** An event with the opportunity it belongs to (null for a standalone event). */
export type EventWithApplication = ApplicationEvent & {
  application: { id: string; opportunity: Pick<Tables<'opportunities'>, 'title' | 'organization'> } | null
}

/** Values sent to the database when creating or updating an event. */
export interface ApplicationEventPayload {
  event_type: ApplicationEventType
  title: string
  starts_at: string
  ends_at: string | null
  is_all_day: boolean
  location: string | null
  description: string | null
}
