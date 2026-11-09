import { CircleCheck, CircleX, Hourglass, LayoutDashboard, Send, TrendingUp, Upload } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { BarList } from '@/components/shared/BarList'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Panel } from '@/components/shared/Panel'
import { StatTile } from '@/components/shared/StatTile'
import { Button } from '@/components/ui/button'
import { SINGLE_SERIES_COLOR } from '@/features/analytics/constants/outcomes'
import { computeApplicationMetrics, formatPercent } from '@/features/analytics/utils/applicationMetrics'
import { ApplicationStatusBadge } from '@/features/applications/components/ApplicationStatusBadge'
import {
  APPLICATION_STATUS_DETAILS,
  APPLICATION_STATUSES,
} from '@/features/applications/constants/applicationStatuses'
import { useApplications, useRecentStatusChanges } from '@/features/applications/hooks/useApplicationQueries'
import { UploadDocumentDialog } from '@/features/documents/components/UploadDocumentDialog'
import { useUpcomingEvents } from '@/features/events/hooks/useEventQueries'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { RecentActivity } from '../components/RecentActivity'
import { RecentApplications } from '../components/RecentApplications'
import { UpcomingList } from '../components/UpcomingList'
import { buildUpcomingItems } from '../utils/upcomingItems'

const UPCOMING_LIMIT = 6
/** Fetch extra events, because some may already have ended earlier today. */
const UPCOMING_EVENTS_FETCH_LIMIT = 20
const RECENT_APPLICATIONS_LIMIT = 5
const RECENT_ACTIVITY_LIMIT = 6

function PanelLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="shrink-0 text-supporting font-medium text-primary underline-offset-4 hover:underline">
      {label}
    </Link>
  )
}

/** A panel whose data loads independently, so one failure does not hide the whole dashboard. */
function PanelBody({
  isLoading,
  error,
  onRetry,
  children,
}: {
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  children: ReactNode
}) {
  if (isLoading) return <LoadingState className="py-6" />
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />
  return children
}

export function DashboardPage() {
  const applications = useApplications()
  const upcomingEvents = useUpcomingEvents(UPCOMING_EVENTS_FETCH_LIMIT)
  const recentChanges = useRecentStatusChanges(RECENT_ACTIVITY_LIMIT)
  // A new key per opening gives the upload dialog a fresh form.
  const [uploadDialogKey, setUploadDialogKey] = useState<number | null>(null)

  const metrics = useMemo(() => computeApplicationMetrics(applications.data ?? []), [applications.data])

  const statusCounts = useMemo(() => {
    const counts = new Map(APPLICATION_STATUSES.map((status) => [status, 0]))
    for (const application of applications.data ?? []) {
      counts.set(application.status, (counts.get(application.status) ?? 0) + 1)
    }
    // Pipeline order, not ranked: the stages read left to right.
    return APPLICATION_STATUSES.filter((status) => (counts.get(status) ?? 0) > 0).map((status) => ({
      key: status,
      label: <ApplicationStatusBadge status={status} />,
      textLabel: APPLICATION_STATUS_DETAILS[status].label,
      value: counts.get(status) ?? 0,
    }))
  }, [applications.data])

  const upcomingItems = useMemo(
    () => buildUpcomingItems(upcomingEvents.data ?? [], applications.data ?? [], { limit: UPCOMING_LIMIT }),
    [upcomingEvents.data, applications.data],
  )

  const quickActions = (
    <>
      <Button variant="outline" size="lg" onClick={() => setUploadDialogKey(Date.now())}>
        <Upload aria-hidden="true" />
        Upload Document
      </Button>
      <AddApplicationButton />
    </>
  )

  function renderContent() {
    if (applications.isLoading) return <LoadingState label="Loading your dashboard…" />
    if (applications.error) {
      return <ErrorState message={applications.error.message} onRetry={() => applications.refetch()} />
    }

    if (!applications.data?.length) {
      return (
        <EmptyState
          icon={LayoutDashboard}
          title="No applications yet"
          description="Add your first opportunity to start tracking progress and outcomes."
          action={<AddApplicationButton />}
        />
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatTile
            label="Submitted"
            value={metrics.submitted}
            detail={metrics.drafts ? `${metrics.drafts} in draft` : undefined}
            icon={Send}
            iconClassName="bg-blue-50 text-blue-700"
          />
          <StatTile
            label="In progress"
            value={metrics.outcomes.pending}
            detail="Awaiting a decision"
            icon={Hourglass}
            iconClassName="bg-amber-50 text-amber-700"
          />
          <StatTile
            label="Successful"
            value={metrics.outcomes.successful}
            icon={CircleCheck}
            iconClassName="bg-green-50 text-success-green"
          />
          <StatTile
            label="Unsuccessful"
            value={metrics.outcomes.unsuccessful}
            icon={CircleX}
            iconClassName="bg-red-50 text-red-700"
          />
          <StatTile
            label="Success rate"
            value={formatPercent(metrics.successRate)}
            detail={metrics.decided ? `Of ${metrics.decided} decided` : 'No decisions yet'}
            icon={TrendingUp}
            iconClassName="bg-violet-50 text-violet-700"
          />
        </dl>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Panel
            title="Upcoming deadlines & interviews"
            action={<PanelLink to={ROUTE_PATHS.CALENDAR} label="Open calendar" />}
          >
            <PanelBody isLoading={upcomingEvents.isLoading} error={upcomingEvents.error} onRetry={() => upcomingEvents.refetch()}>
              <UpcomingList items={upcomingItems} />
            </PanelBody>
          </Panel>

          <Panel
            title="Applications by status"
            description={`All ${metrics.total} recorded, including drafts.`}
            action={<PanelLink to={ROUTE_PATHS.ANALYTICS} label="View analytics" />}
          >
            <BarList label="Applications by status" color={SINGLE_SERIES_COLOR} items={statusCounts} />
          </Panel>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Panel
            title="Recently updated"
            action={<PanelLink to={ROUTE_PATHS.APPLICATIONS} label="All applications" />}
          >
            <RecentApplications applications={applications.data.slice(0, RECENT_APPLICATIONS_LIMIT)} />
          </Panel>

          <Panel title="Recent activity">
            <PanelBody isLoading={recentChanges.isLoading} error={recentChanges.error} onRetry={() => recentChanges.refetch()}>
              <RecentActivity changes={recentChanges.data ?? []} />
            </PanelBody>
          </Panel>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Here is where your applications stand."
        actions={quickActions}
      />
      {renderContent()}

      {uploadDialogKey !== null && (
        <UploadDocumentDialog
          key={uploadDialogKey}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setUploadDialogKey(null)}
        />
      )}
    </>
  )
}
