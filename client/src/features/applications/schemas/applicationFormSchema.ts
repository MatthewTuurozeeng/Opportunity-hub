import { z } from 'zod'

import { fromDateInputValue, getTodayDateInputValue, toDateInputValue } from '@/lib/dateUtils'

import { APPLICATION_STATUSES } from '../constants/applicationStatuses'
import type { ApplicationPayload, ApplicationRecord } from '../types/application.types'

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength, `Use ${maxLength} characters or fewer.`)
}

function requiredText(fieldLabel: string, maxLength: number) {
  return z.string().trim().min(1, `Enter the ${fieldLabel}.`).max(maxLength, `Use ${maxLength} characters or fewer.`)
}

/** All values are strings because they come straight from form inputs. */
export const applicationFormSchema = z
  .object({
    title: requiredText('opportunity title', 200),
    organization: requiredText('organization', 200),
    categoryId: z.string(),
    location: optionalText(200),
    applicationUrl: z
      .string()
      .trim()
      .refine((value) => value === '' || HTTP_URL_PATTERN.test(value), 'Enter a full link starting with https://'),
    source: optionalText(200),
    deadline: z.string(),
    description: optionalText(5000),
    status: z.enum(APPLICATION_STATUSES),
    submittedDate: z.string(),
    applicationMethod: optionalText(120),
    referenceNumber: optionalText(120),
    notes: optionalText(5000),
  })
  .superRefine((values, context) => {
    if (values.status === 'draft' && values.submittedDate) {
      context.addIssue({
        code: 'custom',
        path: ['submittedDate'],
        message: 'A draft has not been submitted yet. Clear the date or choose another status.',
      })
    }

    // "YYYY-MM-DD" strings compare correctly as text.
    if (values.submittedDate && values.submittedDate > getTodayDateInputValue()) {
      context.addIssue({
        code: 'custom',
        path: ['submittedDate'],
        message: 'The submission date cannot be in the future.',
      })
    }
  })

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>

export const EMPTY_APPLICATION_FORM_VALUES: ApplicationFormValues = {
  title: '',
  organization: '',
  categoryId: '',
  location: '',
  applicationUrl: '',
  source: '',
  deadline: '',
  description: '',
  status: 'draft',
  submittedDate: '',
  applicationMethod: '',
  referenceNumber: '',
  notes: '',
}

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim()
  return trimmedValue === '' ? null : trimmedValue
}

/** Converts validated form values into the database payload. */
export function toApplicationPayload(values: ApplicationFormValues): ApplicationPayload {
  return {
    opportunity: {
      title: values.title.trim(),
      organization: values.organization.trim(),
      category_id: emptyToNull(values.categoryId),
      location: emptyToNull(values.location),
      description: emptyToNull(values.description),
      application_url: emptyToNull(values.applicationUrl),
      source: emptyToNull(values.source),
      // A deadline lasts until the end of that day.
      deadline: fromDateInputValue(values.deadline, { endOfDay: true }),
    },
    application: {
      status: values.status,
      submitted_at: fromDateInputValue(values.submittedDate),
      application_method: emptyToNull(values.applicationMethod),
      reference_number: emptyToNull(values.referenceNumber),
      notes: emptyToNull(values.notes),
    },
  }
}

/** Converts a stored application into form values for editing. */
export function toApplicationFormValues(application: ApplicationRecord): ApplicationFormValues {
  const { opportunity } = application

  return {
    title: opportunity.title,
    organization: opportunity.organization,
    categoryId: opportunity.category_id ?? '',
    location: opportunity.location ?? '',
    applicationUrl: opportunity.application_url ?? '',
    source: opportunity.source ?? '',
    deadline: toDateInputValue(opportunity.deadline),
    description: opportunity.description ?? '',
    status: application.status,
    submittedDate: toDateInputValue(application.submitted_at),
    applicationMethod: application.application_method ?? '',
    referenceNumber: application.reference_number ?? '',
    notes: application.notes ?? '',
  }
}
