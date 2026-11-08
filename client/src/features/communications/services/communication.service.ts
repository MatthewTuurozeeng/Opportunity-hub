import { supabase } from '@/lib/supabase'

import type { CommunicationPayload, CommunicationRecord } from '../types/communication.types'

const COMMUNICATION_SELECT = `
  *,
  application:applications!inner(id, opportunity:opportunities!inner(title, organization)),
  attachment:documents!communications_attachment_document_id_user_id_fkey(id, name, file_name, storage_path, mime_type, version)
`

/** Every communication, newest first. */
export async function listCommunications(): Promise<CommunicationRecord[]> {
  const { data, error } = await supabase
    .from('communications')
    .select(COMMUNICATION_SELECT)
    .order('communicated_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load your communications.')
  }

  return data
}

/** Communications for one application, newest first. */
export async function listApplicationCommunications(applicationId: string): Promise<CommunicationRecord[]> {
  const { data, error } = await supabase
    .from('communications')
    .select(COMMUNICATION_SELECT)
    .eq('application_id', applicationId)
    .order('communicated_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load the communications for this application.')
  }

  return data
}

export async function createCommunication(payload: CommunicationPayload): Promise<void> {
  const { error } = await supabase.from('communications').insert(payload)

  if (error) {
    throw new Error('Unable to save the communication. Please check the details and try again.')
  }
}

export async function updateCommunication(communicationId: string, payload: CommunicationPayload): Promise<void> {
  const { error } = await supabase.from('communications').update(payload).eq('id', communicationId)

  if (error) {
    throw new Error('Unable to save your changes. Please try again.')
  }
}

export async function deleteCommunication(communicationId: string): Promise<void> {
  const { error } = await supabase.from('communications').delete().eq('id', communicationId)

  if (error) {
    throw new Error('Unable to delete the communication. Please try again.')
  }
}
