import type { Tables } from '@/types/database.types'

import type { ApplicationEventType } from '../constants/eventTypes'

export type ApplicationEvent = Tables<'application_events'>

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
