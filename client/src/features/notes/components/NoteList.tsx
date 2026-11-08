import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

import { useDeleteNote } from '../hooks/useNoteMutations'
import type { NoteRecord } from '../types/note.types'
import { NoteCard } from './NoteCard'
import { NoteFormDialog } from './NoteFormDialog'

interface NoteListProps {
  notes: readonly NoteRecord[]
  showApplication?: boolean
}

/** Note cards with their edit and delete dialogs. */
export function NoteList({ notes, showApplication = true }: NoteListProps) {
  const deleteNote = useDeleteNote()
  const [editDialog, setEditDialog] = useState<{ key: number; note: NoteRecord } | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<NoteRecord | null>(null)

  function handleConfirmDelete() {
    if (!noteToDelete) return

    deleteNote.mutate(noteToDelete.id, {
      onSuccess: () => {
        toast.success('Note deleted.')
        setNoteToDelete(null)
      },
      onError: (deleteError) => {
        toast.error(deleteError.message)
        setNoteToDelete(null)
      },
    })
  }

  return (
    <>
      <ul className="grid items-start gap-3 lg:grid-cols-2">
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard
              note={note}
              showApplication={showApplication}
              onEdit={(noteToEdit) => setEditDialog({ key: Date.now(), note: noteToEdit })}
              onDelete={setNoteToDelete}
            />
          </li>
        ))}
      </ul>

      {editDialog && (
        <NoteFormDialog
          key={editDialog.key}
          note={editDialog.note}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setEditDialog(null)}
        />
      )}

      <ConfirmDialog
        isOpen={noteToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setNoteToDelete(null)}
        title="Delete this note?"
        description={`"${noteToDelete?.title ?? ''}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteNote.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
