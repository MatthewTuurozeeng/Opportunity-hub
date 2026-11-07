import { History } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { formatDateTime } from '@/lib/dateUtils'

import { APPLICATION_STATUS_DETAILS } from '../constants/applicationStatuses'
import { useApplicationStatusHistory } from '../hooks/useApplicationQueries'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'

interface StatusHistoryTimelineProps {
  applicationId: string
}

/** Chronological list of every status change, newest first. */
export function StatusHistoryTimeline({ applicationId }: StatusHistoryTimelineProps) {
  const { data: history, isLoading, error, refetch } = useApplicationStatusHistory(applicationId)

  if (isLoading) return <LoadingState label="Loading status history…" />
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
  if (!history?.length) {
    return <EmptyState icon={History} title="No status changes yet" description="Status changes will appear here." />
  }

  return (
    <ol className="relative flex flex-col gap-5 border-l border-border pl-6">
      {history.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[1.8rem] size-2.5 rounded-full border-2 border-card bg-primary"
          />
          <div className="flex flex-wrap items-center gap-2">
            {entry.previous_status ? (
              <>
                <ApplicationStatusBadge status={entry.previous_status} />
                <span className="text-muted-foreground" aria-hidden="true">
                  →
                </span>
                <span className="sr-only">changed to</span>
              </>
            ) : (
              <span className="text-body text-muted-foreground">Created as</span>
            )}
            <ApplicationStatusBadge status={entry.new_status} />
          </div>
          <p className="mt-1 text-supporting text-muted-foreground">
            <time dateTime={entry.changed_at}>{formatDateTime(entry.changed_at)}</time>
            <span className="sr-only">: {APPLICATION_STATUS_DETAILS[entry.new_status].description}</span>
          </p>
          {entry.notes && <p className="mt-2 rounded-md bg-muted px-3 py-2 text-body whitespace-pre-line">{entry.notes}</p>}
        </li>
      ))}
    </ol>
  )
}
