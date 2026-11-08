import { Link } from 'react-router'

import { ApplicationStatusBadge } from '@/features/applications/components/ApplicationStatusBadge'
import type { RecentStatusChange } from '@/features/applications/types/application.types'
import { formatDateTime } from '@/lib/dateUtils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

interface RecentActivityProps {
  changes: readonly RecentStatusChange[]
}

/** The latest status changes across all applications. */
export function RecentActivity({ changes }: RecentActivityProps) {
  if (!changes.length) {
    return <p className="text-body text-muted-foreground">No activity yet.</p>
  }

  return (
    <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
      {changes.map((change) => (
        <li key={change.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[1.53rem] size-2 rounded-full border-2 border-card bg-primary"
          />
          <Link
            to={buildApplicationDetailPath(change.application.id)}
            className="font-medium text-heading underline-offset-4 hover:text-primary hover:underline"
          >
            {change.application.opportunity.title}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-supporting text-muted-foreground">
            {change.previous_status ? (
              <>
                <ApplicationStatusBadge status={change.previous_status} />
                <span aria-hidden="true">→</span>
                <span className="sr-only">changed to</span>
              </>
            ) : (
              <span>Added as</span>
            )}
            <ApplicationStatusBadge status={change.new_status} />
          </div>
          <p className="mt-1 text-supporting text-muted-foreground">
            <time dateTime={change.changed_at}>{formatDateTime(change.changed_at)}</time>
          </p>
        </li>
      ))}
    </ol>
  )
}
