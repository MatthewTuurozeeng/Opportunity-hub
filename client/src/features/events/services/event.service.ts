import { supabase } from '@/lib/supabase'

import type { ApplicationEvent, ApplicationEventPayload } from '../types/event.types'

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

export async function createApplicationEvent(applicationId: string, payload: ApplicationEventPayload): Promise<void> {
  const { error } = await supabase.from('application_events').insert({ ...payload, application_id: applicationId })

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
