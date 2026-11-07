import { Link } from 'react-router'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/dateUtils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import type { ApplicationRecord } from '../types/application.types'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { DeadlineLabel } from './DeadlineLabel'

interface ApplicationListProps {
  applications: readonly ApplicationRecord[]
}

const TITLE_LINK_CLASS_NAME =
  'font-medium text-foreground hover:text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'

/** Table on larger screens, stacked cards on mobile. */
export function ApplicationList({ applications }: ApplicationListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Opportunity</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="pr-4">Last updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="max-w-80 py-3 pl-4 whitespace-normal">
                  <Link to={buildApplicationDetailPath(application.id)} className={TITLE_LINK_CLASS_NAME}>
                    {application.opportunity.title}
                  </Link>
                  <p className="text-supporting text-muted-foreground">{application.opportunity.organization}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {application.opportunity.category?.name ?? '—'}
                </TableCell>
                <TableCell>
                  <ApplicationStatusBadge status={application.status} />
                </TableCell>
                <TableCell>
                  <DeadlineLabel deadline={application.opportunity.deadline} status={application.status} />
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">{formatDate(application.updated_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {applications.map((application) => (
          <li key={application.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link to={buildApplicationDetailPath(application.id)} className={TITLE_LINK_CLASS_NAME}>
                  {application.opportunity.title}
                </Link>
                <p className="truncate text-supporting text-muted-foreground">
                  {application.opportunity.organization}
                </p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-supporting">
              <div>
                <dt className="text-muted-foreground">Deadline</dt>
                <dd>
                  <DeadlineLabel deadline={application.opportunity.deadline} status={application.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd>{application.opportunity.category?.name ?? '—'}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
