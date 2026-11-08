import type { NoteFilters, NoteRecord } from '../types/note.types'

export const DEFAULT_NOTE_FILTERS: NoteFilters = { searchTerm: '', category: 'all', applicationId: 'all' }

/** Value of the application filter that selects notes not linked to any application. */
export const STANDALONE_NOTES_FILTER = 'none'

export function hasActiveNoteFilters(filters: NoteFilters): boolean {
  return filters.searchTerm.trim() !== '' || filters.category !== 'all' || filters.applicationId !== 'all'
}

function matchesApplication(note: NoteRecord, applicationId: string): boolean {
  if (applicationId === 'all') return true
  if (applicationId === STANDALONE_NOTES_FILTER) return note.application_id === null
  return note.application_id === applicationId
}

/** Keeps notes matching every filter. Every search word must appear in the title, text or opportunity. */
export function filterNotes(notes: readonly NoteRecord[], filters: NoteFilters): NoteRecord[] {
  const searchWords = filters.searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return notes.filter((note) => {
    if (filters.category !== 'all' && note.category !== filters.category) return false
    if (!matchesApplication(note, filters.applicationId)) return false
    if (!searchWords.length) return true

    const searchableText = [note.title, note.content, note.application?.opportunity.title, note.application?.opportunity.organization]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchWords.every((word) => searchableText.includes(word))
  })
}
