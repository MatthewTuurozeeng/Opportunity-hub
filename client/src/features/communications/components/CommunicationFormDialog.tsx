import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
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
import { useApplications } from '@/features/applications/hooks/useApplicationQueries'
import { useDocuments } from '@/features/documents/hooks/useDocumentQueries'
import { getTodayDateInputValue } from '@/lib/dateUtils'

import {
  COMMUNICATION_DIRECTION_DETAILS,
  COMMUNICATION_DIRECTIONS,
  COMMUNICATION_TYPE_LABELS,
  COMMUNICATION_TYPES,
} from '../constants/communicationTypes'
import { useSaveCommunication } from '../hooks/useCommunicationMutations'
import {
  buildEmptyCommunicationFormValues,
  communicationFormSchema,
  type CommunicationFormValues,
  toCommunicationFormValues,
  toCommunicationPayload,
} from '../schemas/communicationFormSchema'
import type { CommunicationRecord } from '../types/communication.types'

/** Mounted with a fresh `key` per opening, so the form starts from the record's values. */
interface CommunicationFormDialogProps {
  /** Ties a new communication to this application and hides the application picker. */
  fixedApplicationId?: string
  /** The communication to edit. Omit to log a new one. */
  communication?: CommunicationRecord
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function CommunicationFormDialog({
  fixedApplicationId,
  communication,
  isOpen,
  onOpenChange,
}: CommunicationFormDialogProps) {
  const saveCommunication = useSaveCommunication()
  const isEditing = communication !== undefined
  const showApplicationPicker = fixedApplicationId === undefined
  const { data: applications, isLoading: isLoadingApplications } = useApplications()
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments()

  const sortedDocuments = useMemo(
    () =>
      [...(documents ?? [])].sort(
        (first, second) => first.name.localeCompare(second.name) || second.version - first.version,
      ),
    [documents],
  )

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CommunicationFormValues>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: communication
      ? toCommunicationFormValues(communication)
      : buildEmptyCommunicationFormValues(fixedApplicationId),
  })

  const direction = useWatch({ control, name: 'direction' })

  const onSubmit = handleSubmit((values) => {
    saveCommunication.mutate(
      { communicationId: communication?.id, payload: toCommunicationPayload(values) },
      {
        onSuccess: () => {
          toast.success(isEditing ? 'Communication updated.' : 'Communication logged.')
          onOpenChange(false)
        },
      },
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={(nextIsOpen) => !saveCommunication.isPending && onOpenChange(nextIsOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit communication' : 'Log communication'}</DialogTitle>
            <DialogDescription>Record an email, message or call related to an application.</DialogDescription>
          </DialogHeader>

          {showApplicationPicker && (
            <FormControl
              id="communication-application"
              label="Application"
              isRequired
              errorMessage={errors.applicationId?.message}
            >
              {(controlProps) => (
                <NativeSelect
                  className="w-full"
                  disabled={isLoadingApplications}
                  {...controlProps}
                  {...register('applicationId')}
                >
                  <NativeSelectOption value="">
                    {isLoadingApplications ? 'Loading applications…' : 'Choose an application'}
                  </NativeSelectOption>
                  {applications?.map((application) => (
                    <NativeSelectOption key={application.id} value={application.id}>
                      {application.opportunity.title} — {application.opportunity.organization}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormControl>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormControl id="communication-direction" label="Direction" isRequired>
              {(controlProps) => (
                <NativeSelect className="w-full" {...controlProps} {...register('direction')}>
                  {COMMUNICATION_DIRECTIONS.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {COMMUNICATION_DIRECTION_DETAILS[option].label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormControl>
            <FormControl id="communication-type" label="Type" isRequired>
              {(controlProps) => (
                <NativeSelect className="w-full" {...controlProps} {...register('communicationType')}>
                  {COMMUNICATION_TYPES.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {COMMUNICATION_TYPE_LABELS[type]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormControl>
          </div>

          <FormField
            id="communication-subject"
            label="Subject"
            isRequired
            errorMessage={errors.subject?.message}
            {...register('subject')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="communication-date"
              label="Date"
              type="date"
              isRequired
              max={getTodayDateInputValue()}
              errorMessage={errors.date?.message}
              {...register('date')}
            />
            <FormField
              id="communication-time"
              label="Time"
              type="time"
              isRequired
              errorMessage={errors.time?.message}
              {...register('time')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="communication-sender"
              label="Sender"
              placeholder={direction === 'received' ? 'e.g. Admissions Office' : 'e.g. Me'}
              errorMessage={errors.sender?.message}
              {...register('sender')}
            />
            <FormField
              id="communication-recipient"
              label="Recipient"
              placeholder={direction === 'received' ? 'e.g. Me' : 'e.g. recruiter@example.com'}
              errorMessage={errors.recipient?.message}
              {...register('recipient')}
            />
          </div>

          <FormControl
            id="communication-summary"
            label="Summary"
            hint="A short note on what the message was about."
            errorMessage={errors.summary?.message}
          >
            {(controlProps) => <Textarea rows={2} {...controlProps} {...register('summary')} />}
          </FormControl>

          <FormControl
            id="communication-content"
            label="Full message (optional)"
            hint="Paste the message text if you want to keep a copy."
            errorMessage={errors.content?.message}
          >
            {(controlProps) => <Textarea rows={5} {...controlProps} {...register('content')} />}
          </FormControl>

          <FormField
            id="communication-link"
            label="Link to the message"
            type="url"
            placeholder="https://mail.google.com/…"
            hint="Optional link to the email or message in its original app."
            errorMessage={errors.externalLink?.message}
            {...register('externalLink')}
          />

          <FormControl
            id="communication-attachment"
            label="Attachment"
            hint="Choose a file from your Document Library. Upload it there first if it is not listed."
          >
            {(controlProps) => (
              <NativeSelect
                className="w-full"
                disabled={isLoadingDocuments}
                {...controlProps}
                {...register('attachmentDocumentId')}
              >
                <NativeSelectOption value="">{isLoadingDocuments ? 'Loading documents…' : 'No attachment'}</NativeSelectOption>
                {sortedDocuments.map((document) => (
                  <NativeSelectOption key={document.id} value={document.id}>
                    {document.name} (v{document.version})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormControl>

          {saveCommunication.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
              {saveCommunication.error.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={saveCommunication.isPending} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={(isEditing && !isDirty) || saveCommunication.isPending}>
              {saveCommunication.isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Log communication'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
