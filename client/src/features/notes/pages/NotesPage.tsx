import { NotebookPen, Plus, Search, SearchX, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'

import { NoteFormDialog } from '../components/NoteFormDialog'
import { NoteList } from '../components/NoteList'
import { NOTE_CATEGORIES, NOTE_CATEGORY_LABELS } from '../constants/noteCategories'
import { useNotes } from '../hooks/useNoteQueries'
import type { NoteFilters } from '../types/note.types'
import {
  DEFAULT_NOTE_FILTERS,
  filterNotes,
  hasActiveNoteFilters,
  STANDALONE_NOTES_FILTER,
} from '../utils/noteFilters'

export function NotesPage() {
  const { data: notes, isLoading, error, refetch } = useNotes()
  const [filters, setFilters] = useState<NoteFilters>(DEFAULT_NOTE_FILTERS)
  // A new key per opening gives the dialog a fresh form.
  const [newNoteDialogKey, setNewNoteDialogKey] = useState<number | null>(null)

  const visibleNotes = useMemo(() => filterNotes(notes ?? [], filters), [notes, filters])

  /** Only applications that have notes are worth filtering by. */
  const applicationOptions = useMemo(() => {
    const options = new Map<string, string>()
    for (const note of notes ?? []) {
      if (note.application) options.set(note.application.id, note.application.opportunity.title)
    }
    return [...options].sort(([, first], [, second]) => first.localeCompare(second))
  }, [notes])

  function updateFilter<Key extends keyof NoteFilters>(key: Key, value: NoteFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const newNoteButton = (
    <Button size="lg" onClick={() => setNewNoteDialogKey(Date.now())}>
      <Plus aria-hidden="true" />
      New note
    </Button>
  )

  function renderContent() {
    if (isLoading) {
      return (
        <div role="status" aria-label="Loading notes" className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      )
    }
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!notes?.length) {
      return (
        <EmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="Keep interview preparation, questions you were asked, feedback received and lessons learned."
          action={newNoteButton}
        />
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <section
          aria-label="Search and filter notes"
          className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_14rem_14rem_auto] md:items-center"
        >
          <div className="relative">
            <Label htmlFor="note-search" className="sr-only">
              Search notes
            </Label>
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="note-search"
              type="search"
              value={filters.searchTerm}
              onChange={(event) => updateFilter('searchTerm', event.target.value)}
              placeholder="Search notes"
              className="pl-8"
            />
          </div>
          <div>
            <Label htmlFor="note-category-filter" className="sr-only">
              Category
            </Label>
            <NativeSelect
              id="note-category-filter"
              className="w-full"
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value as NoteFilters['category'])}
            >
              <NativeSelectOption value="all">All categories</NativeSelectOption>
              {NOTE_CATEGORIES.map((category) => (
                <NativeSelectOption key={category} value={category}>
                  {NOTE_CATEGORY_LABELS[category]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="note-application-filter" className="sr-only">
              Application
            </Label>
            <NativeSelect
              id="note-application-filter"
              className="w-full"
              value={filters.applicationId}
              onChange={(event) => updateFilter('applicationId', event.target.value)}
            >
              <NativeSelectOption value="all">All applications</NativeSelectOption>
              <NativeSelectOption value={STANDALONE_NOTES_FILTER}>Not linked to an application</NativeSelectOption>
              {applicationOptions.map(([id, title]) => (
                <NativeSelectOption key={id} value={id}>
                  {title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {hasActiveNoteFilters(filters) && (
            <Button variant="ghost" onClick={() => setFilters(DEFAULT_NOTE_FILTERS)}>
              <X aria-hidden="true" />
              Clear
            </Button>
          )}
        </section>

        <p className="text-supporting text-muted-foreground" aria-live="polite">
          Showing {visibleNotes.length} of {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>

        {visibleNotes.length ? (
          <NoteList notes={visibleNotes} />
        ) : (
          <EmptyState icon={SearchX} title="No matching notes" description="Try a different search term or clear the filters." />
        )}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Notes & Reflections"
        description="Keep interview preparation notes, feedback and lessons learned."
        actions={notes?.length ? newNoteButton : undefined}
      />
      {renderContent()}

      {newNoteDialogKey !== null && (
        <NoteFormDialog key={newNoteDialogKey} isOpen onOpenChange={(isOpen) => !isOpen && setNewNoteDialogKey(null)} />
      )}
    </>
  )
}
