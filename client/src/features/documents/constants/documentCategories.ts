import type { Enums } from '@/types/database.types'

export type DocumentCategory = Enums<'document_category'>

/** Document categories (README section 2.4), in display order. Mirrors the database enum. */
export const DOCUMENT_CATEGORIES = [
  'curriculum_vitae',
  'cover_letter',
  'academic_transcript',
  'recommendation_letter',
  'certificate',
  'personal_statement',
  'essay_writing_sample',
  'identification_document',
  'application_form',
  'other',
] as const satisfies readonly DocumentCategory[]

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  curriculum_vitae: 'Curriculum Vitae',
  cover_letter: 'Cover Letter',
  academic_transcript: 'Academic Transcript',
  recommendation_letter: 'Recommendation Letter',
  certificate: 'Certificate',
  personal_statement: 'Personal Statement',
  essay_writing_sample: 'Essay or Writing Sample',
  identification_document: 'Identification Document',
  application_form: 'Application Form',
  other: 'Other',
}
