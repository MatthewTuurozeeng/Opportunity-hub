import { listApplications } from '@/features/applications/services/application.service'
import { listCommunications } from '@/features/communications/services/communication.service'
import { listDocuments } from '@/features/documents/services/document.service'
import { listAllEvents } from '@/features/events/services/event.service'
import { listNotes } from '@/features/notes/services/note.service'
import { supabase } from '@/lib/supabase'

import { type CsvColumn, toCsv } from '../utils/csv'
import {
  APPLICATION_EXPORT_COLUMNS,
  COMMUNICATION_EXPORT_COLUMNS,
  DOCUMENT_EXPORT_COLUMNS,
  EVENT_EXPORT_COLUMNS,
  NOTE_EXPORT_COLUMNS,
} from '../utils/exportColumns'

export const CSV_DATASETS = ['applications', 'events', 'communications', 'notes', 'documents'] as const
export type CsvDataset = (typeof CSV_DATASETS)[number]

interface CsvExport {
  csv: string
  rowCount: number
}

async function exportRows<Row>(load: () => Promise<Row[]>, columns: CsvColumn<Row>[]): Promise<CsvExport> {
  const rows = await load()
  return { csv: toCsv(rows, columns), rowCount: rows.length }
}

/** Builds one spreadsheet-ready CSV export. */
export function exportCsv(dataset: CsvDataset): Promise<CsvExport> {
  switch (dataset) {
    case 'applications':
      return exportRows(listApplications, APPLICATION_EXPORT_COLUMNS)
    case 'events':
      return exportRows(listAllEvents, EVENT_EXPORT_COLUMNS)
    case 'communications':
      return exportRows(listCommunications, COMMUNICATION_EXPORT_COLUMNS)
    case 'notes':
      return exportRows(listNotes, NOTE_EXPORT_COLUMNS)
    case 'documents':
      return exportRows(listDocuments, DOCUMENT_EXPORT_COLUMNS)
  }
}

/** Every table, in an order that keeps parents before the records that refer to them. */
export const BACKUP_TABLES = [
  'profiles',
  'categories',
  'opportunities',
  'applications',
  'application_status_history',
  'documents',
  'application_documents',
  'application_events',
  'communications',
  'notes',
] as const

export type BackupTable = (typeof BACKUP_TABLES)[number]

export interface Backup {
  app: 'OpportunityHub'
  formatVersion: 1
  exportedAt: string
  /** Document files are not included; only their details and storage paths. */
  note: string
  tables: Record<BackupTable, unknown[]>
}

/** A complete JSON copy of every record (not the document files themselves). */
export async function createBackup(now: Date = new Date()): Promise<{ json: string; recordCount: number }> {
  const results = await Promise.all(
    BACKUP_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('*')
      if (error) throw new Error('Unable to create the backup. Please try again.')
      return [table, data] as const
    }),
  )

  const tables = Object.fromEntries(results) as Record<BackupTable, unknown[]>
  const backup: Backup = {
    app: 'OpportunityHub',
    formatVersion: 1,
    exportedAt: now.toISOString(),
    note: 'Document files are not included. Download them from the Document Library.',
    tables,
  }

  return {
    json: JSON.stringify(backup, null, 2),
    recordCount: Object.values(tables).reduce((sum, rows) => sum + rows.length, 0),
  }
}
