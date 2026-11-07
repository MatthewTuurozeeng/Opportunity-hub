import { RefreshCw } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { FormControl } from '@/components/shared/FormControl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'

import {
  APPLICATION_STATUS_DETAILS,
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '../constants/applicationStatuses'
import { useChangeApplicationStatus } from '../hooks/useApplicationMutations'

const NOTE_MAX_LENGTH = 1000

interface ChangeStatusDialogProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

/** "Change status" button and dialog. Each opening starts from the current status. */
export function ChangeStatusDialog({ applicationId, currentStatus }: ChangeStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<ApplicationStatus>(currentStatus)
  const [note, setNote] = useState('')
  const changeStatus = useChangeApplicationStatus(applicationId)
  const isUnchanged = nextStatus === currentStatus

  function handleOpenChange(nextIsOpen: boolean) {
    if (changeStatus.isPending) return
    if (nextIsOpen) {
      setNextStatus(currentStatus)
      setNote('')
      changeStatus.reset()
    }
    setIsOpen(nextIsOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isUnchanged) return

    changeStatus.mutate(
      { status: nextStatus, note },
      {
        onSuccess: () => {
          toast.success(`Status changed to ${APPLICATION_STATUS_DETAILS[nextStatus].label}.`)
          setIsOpen(false)
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="lg" />}>
        <RefreshCw aria-hidden="true" />
        Change status
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Change status</DialogTitle>
            <DialogDescription>
              Currently <span className="font-medium">{APPLICATION_STATUS_DETAILS[currentStatus].label}</span>. The change
              is recorded in the status history.
            </DialogDescription>
          </DialogHeader>

          <FormControl id="next-status" label="New status" hint={APPLICATION_STATUS_DETAILS[nextStatus].description}>
            {(controlProps) => (
              <NativeSelect
                className="w-full"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as ApplicationStatus)}
                {...controlProps}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {APPLICATION_STATUS_DETAILS[status].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormControl>

          <FormControl id="status-note" label="Note (optional)" hint="e.g. Invitation received by email.">
            {(controlProps) => (
              <Textarea
                rows={3}
                maxLength={NOTE_MAX_LENGTH}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                {...controlProps}
              />
            )}
          </FormControl>

          {changeStatus.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
              {changeStatus.error.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={changeStatus.isPending} />}>Cancel</DialogClose>
            <Button type="submit" disabled={isUnchanged || changeStatus.isPending}>
              {changeStatus.isPending ? 'Saving…' : 'Save status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
