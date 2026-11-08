import { Mail, MailPlus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApplications } from '@/features/applications/hooks/useApplicationQueries'

import { type ApplicationOption, CommunicationFilterBar } from '../components/CommunicationFilterBar'
import { CommunicationFormDialog } from '../components/CommunicationFormDialog'
import { CommunicationList } from '../components/CommunicationList'
import { useCommunications } from '../hooks/useCommunicationQueries'
import type { CommunicationFilters } from '../types/communication.types'
import { DEFAULT_COMMUNICATION_FILTERS, filterCommunications } from '../utils/communicationFilters'

export function CommunicationsPage() {
  const { data: communications, isLoading, error, refetch } = useCommunications()
  const { data: applications, isLoading: isLoadingApplications } = useApplications()
  const [filters, setFilters] = useState<CommunicationFilters>(DEFAULT_COMMUNICATION_FILTERS)
  // A new key per opening gives the dialog a fresh form.
  const [logDialogKey, setLogDialogKey] = useState<number | null>(null)

  const visibleCommunications = useMemo(
    () => filterCommunications(communications ?? [], filters),
    [communications, filters],
  )

  /** Only applications that have communications are worth filtering by. */
  const applicationOptions = useMemo<ApplicationOption[]>(() => {
    const options = new Map<string, string>()
    for (const communication of communications ?? []) {
      const { id, opportunity } = communication.application
      options.set(id, `${opportunity.title} — ${opportunity.organization}`)
    }
    return [...options].map(([id, label]) => ({ id, label })).sort((first, second) => first.label.localeCompare(second.label))
  }, [communications])

  const hasApplications = (applications?.length ?? 0) > 0

  const logButton = (
    <Button size="lg" onClick={() => setLogDialogKey(Date.now())}>
      <MailPlus aria-hidden="true" />
      Log communication
    </Button>
  )

  function renderContent() {
    if (isLoading || isLoadingApplications) {
      return (
        <div role="status" aria-label="Loading communications" className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )
    }
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!communications?.length) {
      return hasApplications ? (
        <EmptyState
          icon={Mail}
          title="No communications recorded"
          description="Log confirmations, interview invitations, follow-ups and other messages for your applications."
          action={logButton}
        />
      ) : (
        <EmptyState
          icon={Mail}
          title="Add an application first"
          description="Every communication belongs to an application. Add one, then log its emails and messages here."
          action={<AddApplicationButton />}
        />
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <CommunicationFilterBar filters={filters} applicationOptions={applicationOptions} onFiltersChange={setFilters} />
        <p className="text-supporting text-muted-foreground" aria-live="polite">
          Showing {visibleCommunications.length} of {communications.length}{' '}
          {communications.length === 1 ? 'communication' : 'communications'}
        </p>
        {visibleCommunications.length ? (
          <section className="rounded-lg border border-border bg-card" aria-label="Communications">
            <CommunicationList communications={visibleCommunications} showApplication />
          </section>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No matching communications"
            description="Try a different search term or clear the filters."
          />
        )}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Communications"
        description="Record sent and received application communications."
        actions={communications?.length && hasApplications ? logButton : undefined}
      />
      {renderContent()}

      {logDialogKey !== null && (
        <CommunicationFormDialog
          key={logDialogKey}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setLogDialogKey(null)}
        />
      )}
    </>
  )
}
