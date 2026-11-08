import type { Tables } from '@/types/database.types'

import type { NoteCategory } from '../constants/noteCategories'

/** A note with the opportunity it belongs to (null for a standalone note). */
export type NoteRecord = Tables<'notes'> & {
  application: { id: string; opportunity: Pick<Tables<'opportunities'>, 'title' | 'organization'> } | null
}

/** Values sent to the database when creating or updating a note. */
export interface NotePayload {
  application_id: string | null
  category: NoteCategory
  title: string
  content: string
}

export interface NoteFilters {
  searchTerm: string
  category: NoteCategory | 'all'
  /** An application id, 'none' for standalone notes, or 'all'. */
  applicationId: string
}
