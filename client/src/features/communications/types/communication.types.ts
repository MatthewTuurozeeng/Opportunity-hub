import type { Tables } from '@/types/database.types'

import type { CommunicationDirection, CommunicationType } from '../constants/communicationTypes'

export type CommunicationAttachment = Pick<
  Tables<'documents'>,
  'id' | 'name' | 'file_name' | 'storage_path' | 'mime_type' | 'version'
>

/** A communication joined with its application's opportunity and its attachment. */
export type CommunicationRecord = Tables<'communications'> & {
  application: {
    id: string
    opportunity: Pick<Tables<'opportunities'>, 'title' | 'organization'>
  }
  attachment: CommunicationAttachment | null
}

/** Values sent to the database when creating or updating a communication. */
export interface CommunicationPayload {
  application_id: string
  direction: CommunicationDirection
  communication_type: CommunicationType
  subject: string
  communicated_at: string
  sender: string | null
  recipient: string | null
  summary: string | null
  content: string | null
  external_link: string | null
  attachment_document_id: string | null
}

export interface CommunicationFilters {
  searchTerm: string
  direction: CommunicationDirection | 'all'
  communicationType: CommunicationType | 'all'
  /** An application id, or 'all'. */
  applicationId: string
}
