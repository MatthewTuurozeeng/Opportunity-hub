import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

import { useDeleteCommunication } from '../hooks/useCommunicationMutations'
import type { CommunicationRecord } from '../types/communication.types'
import { CommunicationFormDialog } from './CommunicationFormDialog'
import { CommunicationListItem } from './CommunicationListItem'

interface EditDialogState {
  /** Remounts the dialog per opening so the form starts fresh. */
  key: number
  communication: CommunicationRecord
}

interface CommunicationListProps {
  communications: readonly CommunicationRecord[]
  showApplication?: boolean
}

/** Communication records with their edit and delete dialogs. */
export function CommunicationList({ communications, showApplication = false }: CommunicationListProps) {
  const deleteCommunication = useDeleteCommunication()
  const [editDialog, setEditDialog] = useState<EditDialogState | null>(null)
  const [communicationToDelete, setCommunicationToDelete] = useState<CommunicationRecord | null>(null)

  function handleConfirmDelete() {
    if (!communicationToDelete) return

    deleteCommunication.mutate(communicationToDelete.id, {
      onSuccess: () => {
        toast.success('Communication deleted.')
        setCommunicationToDelete(null)
      },
      onError: (deleteError) => {
        toast.error(deleteError.message)
        setCommunicationToDelete(null)
      },
    })
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {communications.map((communication) => (
          <CommunicationListItem
            key={communication.id}
            communication={communication}
            showApplication={showApplication}
            onEdit={(communicationToEdit) => setEditDialog({ key: Date.now(), communication: communicationToEdit })}
            onDelete={setCommunicationToDelete}
          />
        ))}
      </ul>

      {editDialog && (
        <CommunicationFormDialog
          key={editDialog.key}
          communication={editDialog.communication}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setEditDialog(null)}
        />
      )}

      <ConfirmDialog
        isOpen={communicationToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setCommunicationToDelete(null)}
        title="Delete this communication?"
        description={`"${communicationToDelete?.subject ?? ''}" will be permanently deleted. Any attached document stays in your library.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteCommunication.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
