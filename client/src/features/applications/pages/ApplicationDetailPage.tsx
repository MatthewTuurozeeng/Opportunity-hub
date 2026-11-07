import { Mail, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { BackLink } from '@/components/shared/BackLink'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApplicationDocumentsPanel } from '@/features/documents/components/ApplicationDocumentsPanel'
import { buildEditApplicationPath, ROUTE_PATHS } from '@/routes/routePaths'

import { ApplicationNotFound } from '../components/ApplicationNotFound'
import { ApplicationOverview } from '../components/ApplicationOverview'
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge'
import { ChangeStatusDialog } from '../components/ChangeStatusDialog'
import { DeleteApplicationButton } from '../components/DeleteApplicationButton'
import { StatusHistoryTimeline } from '../components/StatusHistoryTimeline'
import { useApplication } from '../hooks/useApplicationQueries'

export function ApplicationDetailPage() {
  const { applicationId = '' } = useParams<{ applicationId: string }>()
  const { data: application, isLoading, error, refetch } = useApplication(applicationId)

  if (isLoading) return <LoadingState label="Loading application…" />
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
  if (!application) return <ApplicationNotFound />

  const { opportunity } = application

  return (
    <>
      <BackLink to={ROUTE_PATHS.APPLICATIONS} label="Applications" />

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-page-title font-semibold tracking-tight break-words">{opportunity.title}</h1>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <p className="text-body text-muted-foreground">{opportunity.organization}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ChangeStatusDialog applicationId={application.id} currentStatus={application.status} />
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link to={buildEditApplicationPath(application.id)} />}
          >
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <DeleteApplicationButton application={application} />
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <ApplicationOverview application={application} />
        </TabsContent>

        <TabsContent value="timeline" className="pt-4">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-section-heading font-semibold">Status history</h2>
            <StatusHistoryTimeline applicationId={application.id} />
          </section>
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          <ApplicationDocumentsPanel applicationId={application.id} />
        </TabsContent>

        <TabsContent value="communication" className="pt-4">
          <EmptyState
            icon={Mail}
            title="Communication records are coming soon"
            description="Emails and messages related to this application will be listed here."
          />
        </TabsContent>

        <TabsContent value="notes" className="pt-4">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-section-heading font-semibold">Personal notes</h2>
            {application.notes ? (
              <p className="text-body whitespace-pre-line">{application.notes}</p>
            ) : (
              <p className="text-body text-muted-foreground">
                No notes yet.{' '}
                <Link
                  to={buildEditApplicationPath(application.id)}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Add notes
                </Link>
              </p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </>
  )
}
