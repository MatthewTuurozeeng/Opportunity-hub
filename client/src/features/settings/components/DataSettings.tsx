import { useMutation } from '@tanstack/react-query'
import { CalendarDays, DatabaseBackup, Download, FileSpreadsheet, FileText, Mail, NotebookPen, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { createBackup, type CsvDataset, exportCsv } from '../services/export.service'
import { buildExportFileName, downloadFile } from '../utils/downloadFile'
import { SettingsSection } from './SettingsSection'

interface DatasetDetails {
  label: string
  description: string
  icon: LucideIcon
}

const DATASET_DETAILS: Record<CsvDataset, DatasetDetails> = {
  applications: {
    label: 'Applications',
    description: 'Every opportunity and application with status, dates and notes.',
    icon: FileSpreadsheet,
  },
  events: { label: 'Events', description: 'Deadlines, interviews, assessments and reminders.', icon: CalendarDays },
  communications: { label: 'Communications', description: 'Sent and received messages, with summaries.', icon: Mail },
  notes: { label: 'Notes & reflections', description: 'All notes, with their categories and applications.', icon: NotebookPen },
  documents: {
    label: 'Document list',
    description: 'Details of every document version (not the files).',
    icon: FileText,
  },
}

const DATASET_ORDER: CsvDataset[] = ['applications', 'events', 'communications', 'notes', 'documents']

function pluralize(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`
}

function CsvExports() {
  const csvExport = useMutation({
    mutationFn: async (dataset: CsvDataset) => ({ dataset, ...(await exportCsv(dataset)) }),
    onSuccess: ({ dataset, csv, rowCount }) => {
      downloadFile(buildExportFileName(dataset, 'csv'), csv, 'text/csv;charset=utf-8')
      toast.success(`${DATASET_DETAILS[dataset].label} exported (${pluralize(rowCount, 'row')}).`)
    },
    onError: (error) => toast.error(error.message || 'Unable to export. Please try again.'),
  })

  return (
    <SettingsSection
      title="Export to CSV"
      description="Download spreadsheet files that open in Excel, Numbers or Google Sheets."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {DATASET_ORDER.map((dataset) => {
          const { label, description, icon: Icon } = DATASET_DETAILS[dataset]
          const isExporting = csvExport.isPending && csvExport.variables === dataset

          return (
            <li key={dataset} className="flex items-center gap-3 p-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground"
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{label}</p>
                <p className="text-supporting text-muted-foreground">{description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={csvExport.isPending}
                onClick={() => csvExport.mutate(dataset)}
                aria-label={`Export ${label} as CSV`}
              >
                <Download aria-hidden="true" />
                {isExporting ? 'Exporting…' : 'CSV'}
              </Button>
            </li>
          )
        })}
      </ul>
    </SettingsSection>
  )
}

function Backup() {
  const backup = useMutation({
    mutationFn: () => createBackup(),
    onSuccess: ({ json, recordCount }) => {
      downloadFile(buildExportFileName('backup', 'json'), json, 'application/json')
      toast.success(`Backup downloaded (${pluralize(recordCount, 'record')}).`)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <SettingsSection
      title="Full backup"
      description={
        <>
          Download a complete copy of your records as one JSON file: applications, status history, events,
          communications, notes, categories and document details. Uploaded files are not included; download them
          from the Document Library. Keep backups somewhere private, because they contain all your information.
        </>
      }
      footer={
        <Button onClick={() => backup.mutate()} disabled={backup.isPending}>
          <DatabaseBackup aria-hidden="true" />
          {backup.isPending ? 'Preparing backup…' : 'Download backup'}
        </Button>
      }
    />
  )
}

function PrivacyNote() {
  return (
    <SettingsSection title="Where your data is kept">
      <ul className="flex flex-col gap-2 text-body">
        {[
          'Records are stored in your private Supabase database, protected so only your account can read them.',
          'Documents are kept in a private storage bucket and opened through short-lived links.',
          'Nothing private is saved on this device for offline use.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-green" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </SettingsSection>
  )
}

export function DataSettings() {
  return (
    <div className="flex flex-col gap-4">
      <CsvExports />
      <Backup />
      <PrivacyNote />
    </div>
  )
}
