import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { useDeleteApplication } from '../hooks/useApplicationMutations'
import type { ApplicationRecord } from '../types/application.types'

interface DeleteApplicationButtonProps {
  application: ApplicationRecord
}

export function DeleteApplicationButton({ application }: DeleteApplicationButtonProps) {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const deleteApplication = useDeleteApplication()

  function handleConfirm() {
    deleteApplication.mutate(
      { applicationId: application.id, opportunityId: application.opportunity_id },
      {
        onSuccess: () => {
          toast.success('Application deleted.')
          navigate(ROUTE_PATHS.APPLICATIONS, { replace: true })
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <>
      <Button variant="destructive" size="lg" onClick={() => setIsConfirmOpen(true)}>
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete this application?"
        description={
          <>
            This permanently deletes <span className="font-medium">{application.opportunity.title}</span>, its application
            details and status history. Documents in your library are kept. This cannot be undone.
          </>
        }
        confirmLabel="Delete application"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteApplication.isPending}
        onConfirm={handleConfirm}
      />
    </>
  )
}
