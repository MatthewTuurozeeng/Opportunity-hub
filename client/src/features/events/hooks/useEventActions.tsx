import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

import { EventFormDialog } from '../components/EventFormDialog'
import type { ApplicationEvent } from '../types/event.types'
import { useDeleteApplicationEvent, useSetApplicationEventCompleted } from './useEventMutations'

interface FormDialogState {
  /** Remounts the dialog per opening so the form starts fresh. */
  key: number
  event?: ApplicationEvent
  defaultDate?: string
}

interface UseEventActionsOptions {
  /** New events belong to this application, and the application picker is hidden. */
  fixedApplicationId?: string
}

/**
 * Add, edit, complete and delete handlers for event lists, plus the dialogs they open.
 * Render `dialogs` once wherever the hook is used.
 */
export function useEventActions({ fixedApplicationId }: UseEventActionsOptions = {}) {
  const setCompleted = useSetApplicationEventCompleted()
  const deleteEvent = useDeleteApplicationEvent()
  const [formDialog, setFormDialog] = useState<FormDialogState | null>(null)
  const [eventToDelete, setEventToDelete] = useState<ApplicationEvent | null>(null)

  function openNewEvent(defaultDate?: string) {
    setFormDialog({ key: Date.now(), defaultDate })
  }

  function openEditEvent(event: ApplicationEvent) {
    setFormDialog({ key: Date.now(), event })
  }

  function toggleCompleted(event: ApplicationEvent) {
    const isCompleted = !event.is_completed
    setCompleted.mutate(
      { eventId: event.id, isCompleted },
      {
        onSuccess: () => toast.success(isCompleted ? 'Event marked as done.' : 'Event marked as not done.'),
        onError: (updateError) => toast.error(updateError.message),
      },
    )
  }

  function isUpdating(eventId: string): boolean {
    return setCompleted.isPending && setCompleted.variables?.eventId === eventId
  }

  function handleConfirmDelete() {
    if (!eventToDelete) return

    deleteEvent.mutate(eventToDelete.id, {
      onSuccess: () => {
        toast.success('Event deleted.')
        setEventToDelete(null)
      },
      onError: (deleteError) => {
        toast.error(deleteError.message)
        setEventToDelete(null)
      },
    })
  }

  const dialogs: ReactNode = (
    <>
      {formDialog && (
        <EventFormDialog
          key={formDialog.key}
          fixedApplicationId={fixedApplicationId}
          event={formDialog.event}
          defaultDate={formDialog.defaultDate}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setFormDialog(null)}
        />
      )}
      <ConfirmDialog
        isOpen={eventToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setEventToDelete(null)}
        title="Delete this event?"
        description={`"${eventToDelete?.title ?? ''}" will be permanently deleted.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteEvent.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  )

  return {
    openNewEvent,
    openEditEvent,
    requestDeleteEvent: setEventToDelete,
    toggleCompleted,
    isUpdating,
    dialogs,
  }
}
