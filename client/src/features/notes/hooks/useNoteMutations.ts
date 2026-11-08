import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createNote, deleteNote, updateNote } from '../services/note.service'
import type { NotePayload } from '../types/note.types'
import { NOTE_QUERY_KEYS } from './useNoteQueries'

/** The main list and each application's list overlap, so refresh them all. */
function useInvalidateNotes() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: NOTE_QUERY_KEYS.all })
}

export function useSaveNote() {
  const invalidateNotes = useInvalidateNotes()

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId?: string; payload: NotePayload }) =>
      noteId ? updateNote(noteId, payload) : createNote(payload),
    onSuccess: invalidateNotes,
  })
}

export function useDeleteNote() {
  const invalidateNotes = useInvalidateNotes()

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: invalidateNotes,
  })
}
