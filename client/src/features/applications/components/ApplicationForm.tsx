import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { FormControl } from '@/components/shared/FormControl'
import { FormField } from '@/components/shared/FormField'
import { UnsavedChangesDialog } from '@/components/shared/UnsavedChangesDialog'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning'
import { getTodayDateInputValue } from '@/lib/dateUtils'

import { APPLICATION_STATUS_DETAILS, APPLICATION_STATUSES } from '../constants/applicationStatuses'
import { applicationFormSchema, type ApplicationFormValues } from '../schemas/applicationFormSchema'

interface ApplicationFormProps {
  defaultValues: ApplicationFormValues
  submitLabel: string
  submittingLabel: string
  /**
   * Saves the values and resolves to the path to open next.
   * Should throw on failure; the error message is shown above the actions.
   */
  onSubmit: (values: ApplicationFormValues) => Promise<string>
  onCancel: () => void
}

interface FormSectionProps {
  title: string
  description: string
  children: ReactNode
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="grid gap-6 rounded-lg border border-border bg-card p-5 md:grid-cols-[14rem_1fr] md:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-section-heading font-semibold">{title}</h2>
        <p className="text-supporting text-muted-foreground">{description}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function ApplicationForm({
  defaultValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const navigate = useNavigate()
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues,
  })

  const { blocker, allowNavigation } = useUnsavedChangesWarning(isDirty && !isSubmitting)
  const isDraft = useWatch({ control, name: 'status' }) === 'draft'

  async function submitForm(values: ApplicationFormValues) {
    try {
      const nextPath = await onSubmit(values)
      // Saved: leave without the unsaved-changes prompt.
      allowNavigation()
      navigate(nextPath, { replace: true })
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Unable to save the application.' })
    }
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-6">
        <FormSection title="Opportunity" description="What you are applying for and where to find it.">
          <FormField
            id="title"
            label="Opportunity title"
            isRequired
            className="sm:col-span-2"
            placeholder="e.g. Global Leaders Scholarship"
            errorMessage={errors.title?.message}
            {...register('title')}
          />
          <FormField
            id="organization"
            label="Organization or institution"
            isRequired
            errorMessage={errors.organization?.message}
            {...register('organization')}
          />
          <FormControl id="categoryId" label="Category" errorMessage={errors.categoryId?.message}>
            {(controlProps) => (
              <NativeSelect className="w-full" disabled={isLoadingCategories} {...controlProps} {...register('categoryId')}>
                <NativeSelectOption value="">No category</NativeSelectOption>
                {categories.map((category) => (
                  <NativeSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormControl>
          <FormField id="location" label="Location" placeholder="e.g. Remote, Accra" errorMessage={errors.location?.message} {...register('location')} />
          <FormField
            id="deadline"
            label="Application deadline"
            type="date"
            errorMessage={errors.deadline?.message}
            {...register('deadline')}
          />
          <FormField
            id="applicationUrl"
            label="Website or application link"
            type="url"
            inputMode="url"
            placeholder="https://"
            className="sm:col-span-2"
            errorMessage={errors.applicationUrl?.message}
            {...register('applicationUrl')}
          />
          <FormField
            id="source"
            label="Where you found it"
            placeholder="e.g. University newsletter"
            className="sm:col-span-2"
            errorMessage={errors.source?.message}
            {...register('source')}
          />
          <FormControl
            id="description"
            label="Description"
            className="sm:col-span-2"
            errorMessage={errors.description?.message}
          >
            {(controlProps) => <Textarea rows={4} {...controlProps} {...register('description')} />}
          </FormControl>
        </FormSection>

        <FormSection title="Application" description="Where your application stands and how you applied.">
          <FormControl id="status" label="Status" isRequired errorMessage={errors.status?.message}>
            {(controlProps) => (
              <NativeSelect className="w-full" {...controlProps} {...register('status')}>
                {APPLICATION_STATUSES.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {APPLICATION_STATUS_DETAILS[status].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormControl>
          <FormField
            id="submittedDate"
            label="Date submitted"
            type="date"
            max={getTodayDateInputValue()}
            hint={isDraft ? 'Leave empty for drafts, which have not been submitted yet.' : undefined}
            errorMessage={errors.submittedDate?.message}
            {...register('submittedDate')}
          />
          <FormField
            id="applicationMethod"
            label="Application method"
            placeholder="e.g. Online portal, Email"
            errorMessage={errors.applicationMethod?.message}
            {...register('applicationMethod')}
          />
          <FormField
            id="referenceNumber"
            label="Reference number"
            errorMessage={errors.referenceNumber?.message}
            {...register('referenceNumber')}
          />
          <FormControl id="notes" label="Personal notes" className="sm:col-span-2" errorMessage={errors.notes?.message}>
            {(controlProps) => <Textarea rows={4} {...controlProps} {...register('notes')} />}
          </FormControl>
        </FormSection>

        {errors.root?.message && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
            {errors.root.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>

      <UnsavedChangesDialog blocker={blocker} />
    </>
  )
}
