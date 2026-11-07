import type { Blocker } from 'react-router'

import { ConfirmDialog } from './ConfirmDialog'

interface UnsavedChangesDialogProps {
  blocker: Blocker
}

/** Asks for confirmation when navigation was paused by useUnsavedChangesWarning. */
export function UnsavedChangesDialog({ blocker }: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog
      isOpen={blocker.state === 'blocked'}
      onOpenChange={(isOpen) => !isOpen && blocker.reset?.()}
      title="Discard unsaved changes?"
      description="You have changes that have not been saved. If you leave now, they will be lost."
      confirmLabel="Discard changes"
      cancelLabel="Keep editing"
      isDestructive
      onConfirm={() => blocker.proceed?.()}
    />
  )
}
