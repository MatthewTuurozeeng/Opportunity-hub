import { z } from 'zod'

import {
  fromDateInputValue,
  fromDateTimeInputValues,
  toDateInputValue,
  toTimeInputValue,
} from '@/lib/dateUtils'

import { APPLICATION_EVENT_TYPES, EVENT_TYPE_DETAILS } from '../constants/eventTypes'
import type { ApplicationEvent, ApplicationEventPayload } from '../types/event.types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength, `Use ${maxLength} characters or fewer.`)
}

/** All values are strings (or a checkbox boolean) because they come straight from form inputs. */
export const eventFormSchema = z
  .object({
    /** An application id, or '' for a standalone event. */
    applicationId: z.string(),
    eventType: z.enum(APPLICATION_EVENT_TYPES),
    /** Optional: an empty title falls back to the event type's label. */
    title: optionalText(200),
    date: z.string().trim().regex(DATE_PATTERN, 'Choose a date.'),
    isAllDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    location: optionalText(200),
    description: optionalText(2000),
  })
  .superRefine((values, context) => {
    if (values.isAllDay) return

    if (!values.startTime) {
      context.addIssue({
        code: 'custom',
        path: ['startTime'],
        message: 'Choose a start time, or mark the event as all day.',
      })
      return
    }

    // "HH:MM" strings compare correctly as text.
    if (values.endTime && values.endTime <= values.startTime) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'The end time must be after the start time.',
      })
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export const EMPTY_EVENT_FORM_VALUES: EventFormValues = {
  applicationId: '',
  eventType: 'interview',
  title: '',
  date: '',
  isAllDay: false,
  startTime: '',
  endTime: '',
  location: '',
  description: '',
}

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim()
  return trimmedValue === '' ? null : trimmedValue
}

/** Converts validated form values into the database payload. */
export function toEventPayload(values: EventFormValues): ApplicationEventPayload {
  const startsAt = values.isAllDay
    ? fromDateInputValue(values.date)
    : fromDateTimeInputValues(values.date, values.startTime)

  if (!startsAt) {
    throw new Error('The event date is not valid.')
  }

  const endsAt = !values.isAllDay && values.endTime ? fromDateTimeInputValues(values.date, values.endTime) : null

  return {
    application_id: values.applicationId || null,
    event_type: values.eventType,
    title: values.title.trim() || EVENT_TYPE_DETAILS[values.eventType].label,
    starts_at: startsAt,
    ends_at: endsAt,
    is_all_day: values.isAllDay,
    location: emptyToNull(values.location),
    description: emptyToNull(values.description),
  }
}

/** Converts a stored event into form values for editing. */
export function toEventFormValues(event: ApplicationEvent): EventFormValues {
  return {
    applicationId: event.application_id ?? '',
    eventType: event.event_type,
    title: event.title,
    date: toDateInputValue(event.starts_at),
    isAllDay: event.is_all_day,
    startTime: event.is_all_day ? '' : toTimeInputValue(event.starts_at),
    endTime: event.is_all_day ? '' : toTimeInputValue(event.ends_at),
    location: event.location ?? '',
    description: event.description ?? '',
  }
}
