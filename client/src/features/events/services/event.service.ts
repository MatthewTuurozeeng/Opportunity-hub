import { supabase } from '@/lib/supabase'

import type { ApplicationEvent, ApplicationEventPayload, EventWithApplication } from '../types/event.types'

/** Events for one application, earliest first. */
export async function listApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
  const { data, error } = await supabase
    .from('application_events')
    .select('*')
    .eq('application_id', applicationId)
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error('Unable to load the events for this application.')
  }

  return data
}

/**
 * Incomplete events from the start of today onwards, soonest first.
 * Callers drop timed events that already ended earlier today.
 */
export async function listUpcomingEvents(limit: number, now: Date = new Date()): Promise<EventWithApplication[]> {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const { data, error } = await supabase
    .from('application_events')
    .select('*, application:applications(id, opportunity:opportunities!inner(title, organization))')
    .eq('is_completed', false)
    .gte('starts_at', startOfToday.toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error('Unable to load upcoming events.')
  }

  return data
}

/** Events starting in [start, end), with their application, earliest first. */
export async function listEventsBetween(start: Date, end: Date): Promise<EventWithApplication[]> {
  const { data, error } = await supabase
    .from('application_events')
    .select('*, application:applications(id, opportunity:opportunities!inner(title, organization))')
    .gte('starts_at', start.toISOString())
    .lt('starts_at', end.toISOString())
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error('Unable to load events for this month.')
  }

  return data
}

export async function createApplicationEvent(payload: ApplicationEventPayload): Promise<void> {
  const { error } = await supabase.from('application_events').insert(payload)

  if (error) {
    throw new Error('Unable to save the event. Please check the details and try again.')
  }
}

export async function updateApplicationEvent(eventId: string, payload: ApplicationEventPayload): Promise<void> {
  const { error } = await supabase.from('application_events').update(payload).eq('id', eventId)

  if (error) {
    throw new Error('Unable to save your changes. Please try again.')
  }
}

export async function setApplicationEventCompleted(eventId: string, isCompleted: boolean): Promise<void> {
  const { error } = await supabase.from('application_events').update({ is_completed: isCompleted }).eq('id', eventId)

  if (error) {
    throw new Error('Unable to update the event. Please try again.')
  }
}

export async function deleteApplicationEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('application_events').delete().eq('id', eventId)

  if (error) {
    throw new Error('Unable to delete the event. Please try again.')
  }
}
