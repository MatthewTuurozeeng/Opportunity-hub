import { APPLICATION_STATUS_DETAILS } from '@/features/applications/constants/applicationStatuses'
import type { ApplicationRecord } from '@/features/applications/types/application.types'
import {
  COMMUNICATION_DIRECTION_DETAILS,
  COMMUNICATION_TYPE_LABELS,
} from '@/features/communications/constants/communicationTypes'
import type { CommunicationRecord } from '@/features/communications/types/communication.types'
import { DOCUMENT_CATEGORY_LABELS } from '@/features/documents/constants/documentCategories'
import type { DocumentRecord } from '@/features/documents/types/document.types'
import { EVENT_TYPE_DETAILS } from '@/features/events/constants/eventTypes'
import type { EventWithApplication } from '@/features/events/types/event.types'
import { NOTE_CATEGORY_LABELS } from '@/features/notes/constants/noteCategories'
import type { NoteRecord } from '@/features/notes/types/note.types'
import { toDateInputValue, toTimeInputValue } from '@/lib/dateUtils'

import type { CsvColumn } from './csv'

/** Local "YYYY-MM-DD", which spreadsheets recognise as a date. */
function date(isoTimestamp: string | null): string {
  return toDateInputValue(isoTimestamp)
}

/** Local "YYYY-MM-DD HH:MM". */
function dateTime(isoTimestamp: string | null): string {
  return isoTimestamp ? `${toDateInputValue(isoTimestamp)} ${toTimeInputValue(isoTimestamp)}` : ''
}

export const APPLICATION_EXPORT_COLUMNS: CsvColumn<ApplicationRecord>[] = [
  { header: 'Opportunity', value: (row) => row.opportunity.title },
  { header: 'Organization', value: (row) => row.opportunity.organization },
  { header: 'Category', value: (row) => row.opportunity.category?.name },
  { header: 'Status', value: (row) => APPLICATION_STATUS_DETAILS[row.status].label },
  { header: 'Date submitted', value: (row) => date(row.submitted_at) },
  { header: 'Deadline', value: (row) => date(row.opportunity.deadline) },
  { header: 'Location', value: (row) => row.opportunity.location },
  { header: 'Application method', value: (row) => row.application_method },
  { header: 'Reference number', value: (row) => row.reference_number },
  { header: 'Source', value: (row) => row.opportunity.source },
  { header: 'Application link', value: (row) => row.opportunity.application_url },
  { header: 'Description', value: (row) => row.opportunity.description },
  { header: 'Personal notes', value: (row) => row.notes },
  { header: 'Date added', value: (row) => date(row.opportunity.created_at) },
  { header: 'Last updated', value: (row) => dateTime(row.updated_at) },
]

export const EVENT_EXPORT_COLUMNS: CsvColumn<EventWithApplication>[] = [
  { header: 'Title', value: (row) => row.title },
  { header: 'Type', value: (row) => EVENT_TYPE_DETAILS[row.event_type].label },
  { header: 'Application', value: (row) => row.application?.opportunity.title },
  { header: 'Date', value: (row) => date(row.starts_at) },
  { header: 'Start time', value: (row) => (row.is_all_day ? '' : toTimeInputValue(row.starts_at)) },
  { header: 'End time', value: (row) => (row.is_all_day ? '' : toTimeInputValue(row.ends_at)) },
  { header: 'All day', value: (row) => row.is_all_day },
  { header: 'Location', value: (row) => row.location },
  { header: 'Done', value: (row) => row.is_completed },
  { header: 'Details', value: (row) => row.description },
]

export const COMMUNICATION_EXPORT_COLUMNS: CsvColumn<CommunicationRecord>[] = [
  { header: 'Date', value: (row) => dateTime(row.communicated_at) },
  { header: 'Direction', value: (row) => COMMUNICATION_DIRECTION_DETAILS[row.direction].label },
  { header: 'Type', value: (row) => COMMUNICATION_TYPE_LABELS[row.communication_type] },
  { header: 'Subject', value: (row) => row.subject },
  { header: 'Application', value: (row) => row.application.opportunity.title },
  { header: 'Organization', value: (row) => row.application.opportunity.organization },
  { header: 'Sender', value: (row) => row.sender },
  { header: 'Recipient', value: (row) => row.recipient },
  { header: 'Summary', value: (row) => row.summary },
  { header: 'Message', value: (row) => row.content },
  { header: 'Link', value: (row) => row.external_link },
  { header: 'Attachment', value: (row) => (row.attachment ? `${row.attachment.name} (v${row.attachment.version})` : '') },
]

export const NOTE_EXPORT_COLUMNS: CsvColumn<NoteRecord>[] = [
  { header: 'Title', value: (row) => row.title },
  { header: 'Category', value: (row) => NOTE_CATEGORY_LABELS[row.category] },
  { header: 'Application', value: (row) => row.application?.opportunity.title },
  { header: 'Note', value: (row) => row.content },
  { header: 'Written', value: (row) => dateTime(row.created_at) },
  { header: 'Last updated', value: (row) => dateTime(row.updated_at) },
]

export const DOCUMENT_EXPORT_COLUMNS: CsvColumn<DocumentRecord>[] = [
  { header: 'Name', value: (row) => row.name },
  { header: 'Category', value: (row) => DOCUMENT_CATEGORY_LABELS[row.category] },
  { header: 'Version', value: (row) => row.version },
  { header: 'File name', value: (row) => row.file_name },
  { header: 'File type', value: (row) => row.mime_type },
  { header: 'Size (bytes)', value: (row) => row.size_bytes },
  { header: 'Uploaded', value: (row) => dateTime(row.created_at) },
  { header: 'Description', value: (row) => row.description },
  { header: 'Used in applications', value: (row) => row.application_documents.length },
]
