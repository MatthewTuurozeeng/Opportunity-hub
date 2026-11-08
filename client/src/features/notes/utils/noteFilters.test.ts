import { describe, expect, it } from 'vitest'

import { buildEmptyNoteFormValues, noteFormSchema, toNoteFormValues, toNotePayload } from '../schemas/noteFormSchema'
import type { NoteRecord } from '../types/note.types'
import { DEFAULT_NOTE_FILTERS, filterNotes, hasActiveNoteFilters, STANDALONE_NOTES_FILTER } from './noteFilters'

function note(id: string, overrides: Partial<NoteRecord> = {}): NoteRecord {
  return {
    id,
    user_id: 'user-1',
    application_id: 'application-1',
    category: 'general',
    title: 'Note',
    content: 'Content',
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
    application: { id: 'application-1', opportunity: { title: 'Data Fellowship', organization: 'Acme' } },
    ...overrides,
  }
}

const notes = [
  note('prep', { category: 'interview_preparation', title: 'Prepare STAR stories' }),
  note('lesson', { category: 'lessons_learned', content: 'Apply earlier next time' }),
  note('standalone', { application_id: null, application: null, title: 'Career goals' }),
]

function filteredIds(filters: Partial<typeof DEFAULT_NOTE_FILTERS>): string[] {
  return filterNotes(notes, { ...DEFAULT_NOTE_FILTERS, ...filters }).map(({ id }) => id)
}

describe('filterNotes', () => {
  it('filters by category and application', () => {
    expect(filteredIds({ category: 'lessons_learned' })).toEqual(['lesson'])
    expect(filteredIds({ applicationId: 'application-1' })).toEqual(['prep', 'lesson'])
    expect(filteredIds({ applicationId: STANDALONE_NOTES_FILTER })).toEqual(['standalone'])
  })

  it('searches the title, text and opportunity', () => {
    expect(filteredIds({ searchTerm: 'star' })).toEqual(['prep'])
    expect(filteredIds({ searchTerm: 'EARLIER next' })).toEqual(['lesson'])
    expect(filteredIds({ searchTerm: 'acme' })).toEqual(['prep', 'lesson'])
  })

  it('reports whether any filter is active', () => {
    expect(hasActiveNoteFilters(DEFAULT_NOTE_FILTERS)).toBe(false)
    expect(hasActiveNoteFilters({ ...DEFAULT_NOTE_FILTERS, applicationId: STANDALONE_NOTES_FILTER })).toBe(true)
  })
})

describe('noteFormSchema', () => {
  it('requires a title and content', () => {
    const result = noteFormSchema.safeParse({ ...buildEmptyNoteFormValues(), title: ' ', content: '' })
    expect(result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))).toEqual(['title', 'content'])
  })

  it('stores a standalone note with no application and round-trips', () => {
    const values = { ...buildEmptyNoteFormValues(), title: '  Goals ', content: ' Grow ', category: 'strengths' as const }
    const payload = toNotePayload(values)

    expect(payload).toEqual({ application_id: null, category: 'strengths', title: 'Goals', content: 'Grow' })
    expect(toNoteFormValues(note('n', { ...payload, application: null }))).toEqual({
      title: 'Goals',
      category: 'strengths',
      applicationId: '',
      content: 'Grow',
    })
  })
})
