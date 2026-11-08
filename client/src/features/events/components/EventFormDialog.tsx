import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
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

import { APPLICATION_EVENT_TYPES, EVENT_TYPE_DETAILS } from '../constants/eventTypes'
import { useSaveApplicationEvent } from '../hooks/useEventMutations'
import {
  EMPTY_EVENT_FORM_VALUES,
  eventFormSchema,
  type EventFormValues,
  toEventFormValues,
  toEventPayload,
} from '../schemas/eventFormSchema'
import type { ApplicationEvent } from '../types/event.types'

/** Mounted with a fresh `key` per opening, so the form starts from the event's values. */
interface EventFormDialogProps {
  applicationId: string
  /** The event to edit. Omit to add a new one. */
  event?: ApplicationEvent
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function EventFormDialog({ applicationId, event, isOpen, onOpenChange }: EventFormDialogProps) {
  const saveEvent = useSaveApplicationEvent(applicationId)
  const isEditing = event !== undefined

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? toEventFormValues(event) : EMPTY_EVENT_FORM_VALUES,
  })

  const eventType = useWatch({ control, name: 'eventType' })
  const isAllDay = useWatch({ control, name: 'isAllDay' })

  const onSubmit = handleSubmit((values) => {
    saveEvent.mutate(
      { eventId: event?.id, payload: toEventPayload(values) },
      {
        onSuccess: () => {
          toast.success(isEditing ? 'Event updated.' : 'Event added.')
          onOpenChange(false)
        },
      },
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={(nextIsOpen) => !saveEvent.isPending && onOpenChange(nextIsOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit event' : 'Add event'}</DialogTitle>
            <DialogDescription>
              Record a deadline, interview, assessment or reminder for this application.
            </DialogDescription>
          </DialogHeader>

          <FormControl id="event-type" label="Type" isRequired errorMessage={errors.eventType?.message}>
            {(controlProps) => (
              <NativeSelect className="w-full" {...controlProps} {...register('eventType')}>
                {APPLICATION_EVENT_TYPES.map((type) => (
                  <NativeSelectOption key={type} value={type}>
                    {EVENT_TYPE_DETAILS[type].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormControl>

          <FormField
            id="event-title"
            label="Title"
            hint="Leave blank to use the event type as the title."
            placeholder={EVENT_TYPE_DETAILS[eventType].label}
            errorMessage={errors.title?.message}
            {...register('title')}
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <FormField id="event-date" label="Date" type="date" isRequired errorMessage={errors.date?.message} {...register('date')} />
            <label className="flex h-8 items-center gap-2 text-body">
              <input type="checkbox" className="size-4 accent-primary" {...register('isAllDay')} />
              All day (no specific time)
            </label>
          </div>

          {!isAllDay && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="event-start-time"
                label="Start time"
                type="time"
                isRequired
                errorMessage={errors.startTime?.message}
                {...register('startTime')}
              />
              <FormField
                id="event-end-time"
                label="End time"
                type="time"
                errorMessage={errors.endTime?.message}
                {...register('endTime')}
              />
            </div>
          )}

          <FormField
            id="event-location"
            label="Location"
            hint="An address, room or video call link."
            errorMessage={errors.location?.message}
            {...register('location')}
          />

          <FormControl id="event-description" label="Details" errorMessage={errors.description?.message}>
            {(controlProps) => <Textarea rows={3} {...controlProps} {...register('description')} />}
          </FormControl>

          {saveEvent.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
              {saveEvent.error.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={saveEvent.isPending} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={(isEditing && !isDirty) || saveEvent.isPending}>
              {saveEvent.isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
