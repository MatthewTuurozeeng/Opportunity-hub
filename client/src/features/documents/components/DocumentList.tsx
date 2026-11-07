import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/dateUtils'

import { DOCUMENT_CATEGORY_LABELS } from '../constants/documentCategories'
import type { DocumentGroup } from '../types/document.types'
import { formatFileSize } from '../utils/fileUtils'
import { DocumentActionsMenu, type DocumentDialogType } from './DocumentActionsMenu'
import { DocumentFileIcon } from './DocumentFileIcon'

interface DocumentListProps {
  groups: readonly DocumentGroup[]
  onOpenDialog: (dialogType: DocumentDialogType, group: DocumentGroup) => void
}

function describeUsage(count: number): string {
  if (count === 0) return 'Not attached'
  return `${count} ${count === 1 ? 'application' : 'applications'}`
}

/** Table on larger screens, stacked cards on mobile. One row per document (latest version). */
export function DocumentList({ groups, onOpenDialog }: DocumentListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Document</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Used in</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => {
              const { latest } = group
              return (
                <TableRow key={group.versionGroupId}>
                  <TableCell className="max-w-80 py-3 pl-4 whitespace-normal">
                    <div className="flex items-center gap-3">
                      <DocumentFileIcon mimeType={latest.mime_type} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-heading">{latest.name}</p>
                        <p className="truncate text-supporting text-muted-foreground">
                          {latest.file_name} · {formatFileSize(latest.size_bytes)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{DOCUMENT_CATEGORY_LABELS[latest.category]}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">v{latest.version}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{describeUsage(group.linkedApplicationCount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(latest.created_at)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <DocumentActionsMenu group={group} onOpenDialog={onOpenDialog} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {groups.map((group) => {
          const { latest } = group
          return (
            <li key={group.versionGroupId} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <DocumentFileIcon mimeType={latest.mime_type} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-heading">{latest.name}</p>
                <p className="truncate text-supporting text-muted-foreground">
                  {DOCUMENT_CATEGORY_LABELS[latest.category]} · v{latest.version} · {formatFileSize(latest.size_bytes)}
                </p>
                <p className="text-supporting text-muted-foreground">{describeUsage(group.linkedApplicationCount)}</p>
              </div>
              <DocumentActionsMenu group={group} onOpenDialog={onOpenDialog} />
            </li>
          )
        })}
      </ul>
    </>
  )
}
