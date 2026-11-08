import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormControl } from '@/components/shared/FormControl'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useApplications } from '@/features/applications/hooks/useApplicationQueries'

import { NOTE_CATEGORIES, NOTE_CATEGORY_LABELS } from '../constants/noteCategories'
import { useSaveNote } from '../hooks/useNoteMutations'
import {
  buildEmptyNoteFormValues,
  noteFormSchema,
  type NoteFormValues,
  toNoteFormValues,
  toNotePayload,
} from '../schemas/noteFormSchema'
import type { NoteRecord } from '../types/note.types'

/** Mounted with a fresh `key` per opening, so the form starts from the note's values. */
interface NoteFormDialogProps {
  /** The note to edit. Omit to write a new one. */
  note?: NoteRecord
  /** Preselects the application for a new note. */
  defaultApplicationId?: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function NoteFormDialog({ note, defaultApplicationId, isOpen, onOpenChange }: NoteFormDialogProps) {
  const saveNote = useSaveNote()
  const isEditing = note !== undefined
  const { data: applications, isLoading: isLoadingApplications } = useApplications()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: note ? toNoteFormValues(note) : buildEmptyNoteFormValues(defaultApplicationId),
  })

  const onSubmit = handleSubmit((values) => {
    saveNote.mutate(
      { noteId: note?.id, payload: toNotePayload(values) },
      {
        onSuccess: () => {
          toast.success(isEditing ? 'Note updated.' : 'Note saved.')
          onOpenChange(false)
        },
      },
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={(nextIsOpen) => !saveNote.isPending && onOpenChange(nextIsOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit note' : 'New note'}</DialogTitle>
            <DialogDescription>Record preparation, feedback, reflections and lessons learned.</DialogDescription>
          </DialogHeader>

          <FormField id="note-title" label="Title" isRequired errorMessage={errors.title?.message} {...register('title')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormControl id="note-category" label="Category" isRequired>
              {(controlProps) => (
                <NativeSelect className="w-full" {...controlProps} {...register('category')}>
                  {NOTE_CATEGORIES.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                      {NOTE_CATEGORY_LABELS[category]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormControl>

            <FormControl id="note-application" label="Application" hint="Optional. Link the note to an application.">
              {(controlProps) => (
                <NativeSelect
                  className="w-full"
                  disabled={isLoadingApplications}
                  {...controlProps}
                  {...register('applicationId')}
                >
                  <NativeSelectOption value="">
                    {isLoadingApplications ? 'Loading applications…' : 'Not linked'}
                  </NativeSelectOption>
                  {applications?.map((application) => (
                    <NativeSelectOption key={application.id} value={application.id}>
                      {application.opportunity.title} — {application.opportunity.organization}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormControl>
          </div>

          <FormControl id="note-content" label="Note" isRequired errorMessage={errors.content?.message}>
            {(controlProps) => <Textarea rows={10} {...controlProps} {...register('content')} />}
          </FormControl>

          {saveNote.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
              {saveNote.error.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={saveNote.isPending} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={(isEditing && !isDirty) || saveNote.isPending}>
              {saveNote.isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Save note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
