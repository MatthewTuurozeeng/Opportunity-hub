import { supabase } from '@/lib/supabase'

import type { ApplicationStatus } from '../constants/applicationStatuses'
import type { ApplicationPayload, ApplicationRecord, StatusHistoryEntry } from '../types/application.types'

const APPLICATION_SELECT = '*, opportunity:opportunities!inner(*, category:categories(id, name))'

/** PostgreSQL error code for a malformed value, e.g. an invalid UUID in the URL. */
const INVALID_TEXT_REPRESENTATION_CODE = '22P02'

export async function listApplications(): Promise<ApplicationRecord[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load your applications.')
  }

  return data
}

/** Returns null when the application does not exist or the id is malformed. */
export async function getApplication(applicationId: string): Promise<ApplicationRecord | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('id', applicationId)
    .maybeSingle()

  if (error) {
    if (error.code === INVALID_TEXT_REPRESENTATION_CODE) return null
    throw new Error('Unable to load this application.')
  }

  return data
}

export async function listApplicationStatusHistory(applicationId: string): Promise<StatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load the status history.')
  }

  return data
}

/** Creates the opportunity and its application in one transaction. Returns the application id. */
export async function createApplication(payload: ApplicationPayload): Promise<string> {
  const { data, error } = await supabase.rpc('create_opportunity_application', {
    p_opportunity: payload.opportunity,
    p_application: payload.application,
  })

  if (error) {
    throw new Error('Unable to save the application. Please check the details and try again.')
  }

  return data
}

export async function updateApplication(applicationId: string, payload: ApplicationPayload): Promise<void> {
  const { error } = await supabase.rpc('update_opportunity_application', {
    p_application_id: applicationId,
    p_opportunity: payload.opportunity,
    p_application: payload.application,
  })

  if (error) {
    throw new Error('Unable to save your changes. Please try again.')
  }
}

export async function changeApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note: string,
): Promise<void> {
  const { error } = await supabase.rpc('change_application_status', {
    p_application_id: applicationId,
    p_status: status,
    p_note: note.trim() || undefined,
  })

  if (error) {
    throw new Error('Unable to update the status. Please try again.')
  }
}

/** Deletes the opportunity, which also deletes its application and status history. */
export async function deleteApplication(opportunityId: string): Promise<void> {
  const { error } = await supabase.from('opportunities').delete().eq('id', opportunityId)

  if (error) {
    throw new Error('Unable to delete the application. Please try again.')
  }
}
