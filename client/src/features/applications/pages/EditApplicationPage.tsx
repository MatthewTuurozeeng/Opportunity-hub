import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { BackLink } from '@/components/shared/BackLink'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import { ApplicationForm } from '../components/ApplicationForm'
import { ApplicationNotFound } from '../components/ApplicationNotFound'
import { useApplication } from '../hooks/useApplicationQueries'
import { useUpdateApplication } from '../hooks/useApplicationMutations'
import {
  type ApplicationFormValues,
  toApplicationFormValues,
  toApplicationPayload,
} from '../schemas/applicationFormSchema'

export function EditApplicationPage() {
  const navigate = useNavigate()
  const { applicationId = '' } = useParams<{ applicationId: string }>()
  const { data: application, isLoading, error, refetch } = useApplication(applicationId)
  const updateApplication = useUpdateApplication(applicationId)
  const detailPath = buildApplicationDetailPath(applicationId)

  if (isLoading) return <LoadingState label="Loading application…" />
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
  if (!application) return <ApplicationNotFound />

  async function handleSubmit(values: ApplicationFormValues) {
    await updateApplication.mutateAsync(toApplicationPayload(values))
    toast.success('Changes saved.')
    return detailPath
  }

  return (
    <>
      <BackLink to={detailPath} label={application.opportunity.title} />
      <PageHeader title="Edit Application" description="Update the opportunity and application details." />
      <ApplicationForm
        defaultValues={toApplicationFormValues(application)}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        onSubmit={handleSubmit}
        onCancel={() => navigate(detailPath)}
      />
    </>
  )
}
