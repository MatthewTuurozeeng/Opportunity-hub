import { supabase } from '@/lib/supabase'

import type { NotePayload, NoteRecord } from '../types/note.types'

const NOTE_SELECT = '*, application:applications(id, opportunity:opportunities!inner(title, organization))'

/** Every note, most recently updated first. */
export async function listNotes(): Promise<NoteRecord[]> {
  const { data, error } = await supabase.from('notes').select(NOTE_SELECT).order('updated_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load your notes.')
  }

  return data
}

/** Notes linked to one application, most recently updated first. */
export async function listApplicationNotes(applicationId: string): Promise<NoteRecord[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(NOTE_SELECT)
    .eq('application_id', applicationId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load the notes for this application.')
  }

  return data
}

export async function createNote(payload: NotePayload): Promise<void> {
  const { error } = await supabase.from('notes').insert(payload)

  if (error) {
    throw new Error('Unable to save the note. Please try again.')
  }
}

export async function updateNote(noteId: string, payload: NotePayload): Promise<void> {
  const { error } = await supabase.from('notes').update(payload).eq('id', noteId)

  if (error) {
    throw new Error('Unable to save your changes. Please try again.')
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId)

  if (error) {
    throw new Error('Unable to delete the note. Please try again.')
  }
}
