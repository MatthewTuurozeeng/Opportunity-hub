import type { Tables } from '@/types/database.types'

import type { DocumentCategory } from '../constants/documentCategories'

/** A document version with the ids of applications it is attached to. */
export type DocumentRecord = Tables<'documents'> & {
  application_documents: { application_id: string }[]
}

/** All versions of one document, newest first. */
export interface DocumentGroup {
  versionGroupId: string
  latest: DocumentRecord
  versions: DocumentRecord[]
  /** Distinct applications using any version of this document. */
  linkedApplicationCount: number
}

export interface DocumentFilters {
  searchTerm: string
  category: DocumentCategory | 'all'
}

export interface DocumentDetailsValues {
  name: string
  category: DocumentCategory
  description: string
}

/** A document attached to an application, as shown on the application page. */
export type LinkedDocument = Tables<'documents'>
