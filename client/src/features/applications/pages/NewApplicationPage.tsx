import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/PageHeader'
import { buildApplicationDetailPath, ROUTE_PATHS } from '@/routes/routePaths'

import { ApplicationForm } from '../components/ApplicationForm'
import { useCreateApplication } from '../hooks/useApplicationMutations'
import {
  type ApplicationFormValues,
  EMPTY_APPLICATION_FORM_VALUES,
  toApplicationPayload,
} from '../schemas/applicationFormSchema'

export function NewApplicationPage() {
  const navigate = useNavigate()
  const createApplication = useCreateApplication()

  async function handleSubmit(values: ApplicationFormValues) {
    const applicationId = await createApplication.mutateAsync(toApplicationPayload(values))
    toast.success('Application added.')
    return buildApplicationDetailPath(applicationId)
  }

  return (
    <>
      <PageHeader title="Add Application" description="Record a new opportunity and its application details." />
      <ApplicationForm
        defaultValues={EMPTY_APPLICATION_FORM_VALUES}
        submitLabel="Save application"
        submittingLabel="Saving…"
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTE_PATHS.APPLICATIONS)}
      />
    </>
  )
}
