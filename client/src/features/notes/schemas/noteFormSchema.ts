import { z } from 'zod'

import { NOTE_CATEGORIES } from '../constants/noteCategories'
import type { NotePayload, NoteRecord } from '../types/note.types'

/** All values are strings because they come straight from form inputs. */
export const noteFormSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.').max(200, 'Use 200 characters or fewer.'),
  category: z.enum(NOTE_CATEGORIES),
  /** An application id, or '' for a standalone note. */
  applicationId: z.string(),
  content: z.string().trim().min(1, 'Write the note.').max(20000, 'Use 20,000 characters or fewer.'),
})

export type NoteFormValues = z.infer<typeof noteFormSchema>

export function buildEmptyNoteFormValues(applicationId = ''): NoteFormValues {
  return { title: '', category: 'general', applicationId, content: '' }
}

export function toNotePayload(values: NoteFormValues): NotePayload {
  return {
    application_id: values.applicationId || null,
    category: values.category,
    title: values.title.trim(),
    content: values.content.trim(),
  }
}

export function toNoteFormValues(note: NoteRecord): NoteFormValues {
  return {
    title: note.title,
    category: note.category,
    applicationId: note.application_id ?? '',
    content: note.content,
  }
}
