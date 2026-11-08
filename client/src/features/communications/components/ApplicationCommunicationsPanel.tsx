import { Mail, MailPlus } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'

import { useApplicationCommunications } from '../hooks/useCommunicationQueries'
import { CommunicationFormDialog } from './CommunicationFormDialog'
import { CommunicationList } from './CommunicationList'

interface ApplicationCommunicationsPanelProps {
  applicationId: string
}

/** Communication history for one application, shown on its detail page. */
export function ApplicationCommunicationsPanel({ applicationId }: ApplicationCommunicationsPanelProps) {
  const { data: communications, isLoading, error, refetch } = useApplicationCommunications(applicationId)
  // A new key per opening gives the dialog a fresh form.
  const [logDialogKey, setLogDialogKey] = useState<number | null>(null)

  const logButton = (
    <Button onClick={() => setLogDialogKey(Date.now())}>
      <MailPlus aria-hidden="true" />
      Log communication
    </Button>
  )

  function renderContent() {
    if (isLoading) return <LoadingState label="Loading communications…" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!communications?.length) {
      return (
        <EmptyState
          icon={Mail}
          title="No communications recorded"
          description="Log confirmations, interview invitations, follow-ups and other messages for this application."
          action={logButton}
        />
      )
    }

    return (
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border p-4">
          <h2 className="text-section-heading font-semibold">
            Communication history <span className="font-normal text-muted-foreground">({communications.length})</span>
          </h2>
          {logButton}
        </header>
        <CommunicationList communications={communications} />
      </section>
    )
  }

  return (
    <>
      {renderContent()}

      {logDialogKey !== null && (
        <CommunicationFormDialog
          key={logDialogKey}
          fixedApplicationId={applicationId}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setLogDialogKey(null)}
        />
      )}
    </>
  )
}
