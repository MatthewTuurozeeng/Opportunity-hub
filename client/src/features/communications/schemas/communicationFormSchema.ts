import { z } from 'zod'

import { fromDateTimeInputValues, getTodayDateInputValue, toDateInputValue, toTimeInputValue } from '@/lib/dateUtils'

import { COMMUNICATION_DIRECTIONS, COMMUNICATION_TYPES } from '../constants/communicationTypes'
import type { CommunicationPayload, CommunicationRecord } from '../types/communication.types'

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/** Small allowance for clock differences when checking that a time is not in the future. */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength, `Use ${maxLength} characters or fewer.`)
}

/** All values are strings because they come straight from form inputs. */
export const communicationFormSchema = z
  .object({
    applicationId: z.string().min(1, 'Choose the application this communication belongs to.'),
    direction: z.enum(COMMUNICATION_DIRECTIONS),
    communicationType: z.enum(COMMUNICATION_TYPES),
    subject: z.string().trim().min(1, 'Enter a subject.').max(300, 'Use 300 characters or fewer.'),
    date: z.string().trim().regex(DATE_PATTERN, 'Choose a date.'),
    time: z.string().trim().regex(TIME_PATTERN, 'Enter a time.'),
    sender: optionalText(200),
    recipient: optionalText(200),
    summary: optionalText(2000),
    content: optionalText(20000),
    externalLink: z
      .string()
      .trim()
      .refine((value) => value === '' || HTTP_URL_PATTERN.test(value), 'Enter a full link starting with https://'),
    attachmentDocumentId: z.string(),
  })
  .superRefine((values, context) => {
    const communicatedAt = fromDateTimeInputValues(values.date, values.time)
    if (communicatedAt && new Date(communicatedAt).getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      context.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'A communication cannot be dated in the future.',
      })
    }
  })

export type CommunicationFormValues = z.infer<typeof communicationFormSchema>

/** A blank form dated now, optionally tied to one application. */
export function buildEmptyCommunicationFormValues(applicationId = '', now: Date = new Date()): CommunicationFormValues {
  return {
    applicationId,
    direction: 'received',
    communicationType: 'other',
    subject: '',
    date: getTodayDateInputValue(now),
    time: toTimeInputValue(now.toISOString()),
    sender: '',
    recipient: '',
    summary: '',
    content: '',
    externalLink: '',
    attachmentDocumentId: '',
  }
}

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim()
  return trimmedValue === '' ? null : trimmedValue
}

/** Converts validated form values into the database payload. */
export function toCommunicationPayload(values: CommunicationFormValues): CommunicationPayload {
  const communicatedAt = fromDateTimeInputValues(values.date, values.time)
  if (!communicatedAt) {
    throw new Error('The communication date is not valid.')
  }

  return {
    application_id: values.applicationId,
    direction: values.direction,
    communication_type: values.communicationType,
    subject: values.subject.trim(),
    communicated_at: communicatedAt,
    sender: emptyToNull(values.sender),
    recipient: emptyToNull(values.recipient),
    summary: emptyToNull(values.summary),
    content: emptyToNull(values.content),
    external_link: emptyToNull(values.externalLink),
    attachment_document_id: emptyToNull(values.attachmentDocumentId),
  }
}

/** Converts a stored communication into form values for editing. */
export function toCommunicationFormValues(communication: CommunicationRecord): CommunicationFormValues {
  return {
    applicationId: communication.application_id,
    direction: communication.direction,
    communicationType: communication.communication_type,
    subject: communication.subject,
    date: toDateInputValue(communication.communicated_at),
    time: toTimeInputValue(communication.communicated_at),
    sender: communication.sender ?? '',
    recipient: communication.recipient ?? '',
    summary: communication.summary ?? '',
    content: communication.content ?? '',
    externalLink: communication.external_link ?? '',
    attachmentDocumentId: communication.attachment_document_id ?? '',
  }
}
