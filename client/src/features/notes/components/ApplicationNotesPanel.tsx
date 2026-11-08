import { NotebookPen, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'
import { buildEditApplicationPath } from '@/routes/routePaths'

import { useApplicationNotes } from '../hooks/useNoteQueries'
import { NoteFormDialog } from './NoteFormDialog'
import { NoteList } from './NoteList'

interface ApplicationNotesPanelProps {
  applicationId: string
  /** The short "personal notes" field saved on the application itself. */
  personalNotes: string | null
}

/** The application's own notes field plus its linked notes and reflections. */
export function ApplicationNotesPanel({ applicationId, personalNotes }: ApplicationNotesPanelProps) {
  const { data: notes, isLoading, error, refetch } = useApplicationNotes(applicationId)
  // A new key per opening gives the dialog a fresh form.
  const [newNoteDialogKey, setNewNoteDialogKey] = useState<number | null>(null)

  const newNoteButton = (
    <Button onClick={() => setNewNoteDialogKey(Date.now())}>
      <Plus aria-hidden="true" />
      New note
    </Button>
  )

  function renderNotes() {
    if (isLoading) return <LoadingState label="Loading notes…" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!notes?.length) {
      return (
        <EmptyState
          icon={NotebookPen}
          title="No notes or reflections yet"
          description="Write interview preparation, questions you were asked, feedback and lessons learned."
          action={newNoteButton}
        />
      )
    }

    return (
      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-section-heading font-semibold">
            Notes & reflections <span className="font-normal text-muted-foreground">({notes.length})</span>
          </h2>
          {newNoteButton}
        </header>
        <NoteList notes={notes} showApplication={false} />
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-section-heading font-semibold">Personal notes</h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to={buildEditApplicationPath(applicationId)} />}
          >
            <Pencil aria-hidden="true" />
            Edit
          </Button>
        </div>
        {personalNotes ? (
          <p className="text-body whitespace-pre-line">{personalNotes}</p>
        ) : (
          <p className="text-body text-muted-foreground">No personal notes on this application.</p>
        )}
      </section>

      {renderNotes()}

      {newNoteDialogKey !== null && (
        <NoteFormDialog
          key={newNoteDialogKey}
          defaultApplicationId={applicationId}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setNewNoteDialogKey(null)}
        />
      )}
    </div>
  )
}
