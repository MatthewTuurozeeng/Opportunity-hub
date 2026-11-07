import { Download, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDateTime } from '@/lib/dateUtils'

import { useDeleteDocumentVersion } from '../hooks/useDocumentMutations'
import { useOpenDocument } from '../hooks/useOpenDocument'
import type { DocumentGroup, DocumentRecord } from '../types/document.types'
import { formatFileSize } from '../utils/fileUtils'

interface DocumentVersionsDialogProps {
  group: DocumentGroup
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function DocumentVersionsDialog({ group, isOpen, onOpenChange }: DocumentVersionsDialogProps) {
  const { viewDocument, downloadDocument } = useOpenDocument()
  const deleteVersion = useDeleteDocumentVersion()
  const [versionToDelete, setVersionToDelete] = useState<DocumentRecord | null>(null)

  function handleConfirmDelete() {
    if (!versionToDelete) return

    deleteVersion.mutate(versionToDelete, {
      onSuccess: () => {
        toast.success(`Version ${versionToDelete.version} deleted.`)
        setVersionToDelete(null)
        // Deleting the only version removes the document entirely.
        if (group.versions.length === 1) onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error.message)
        setVersionToDelete(null)
      },
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>
              {group.latest.name}: {group.versions.length} {group.versions.length === 1 ? 'version' : 'versions'}. Each
              application keeps the exact version you attached.
            </DialogDescription>
          </DialogHeader>

          <ol className="flex max-h-[60vh] flex-col divide-y divide-border overflow-y-auto">
            {group.versions.map((version) => {
              const attachedCount = version.application_documents.length
              const isLatest = version.id === group.latest.id

              return (
                <li key={version.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-semibold text-heading">Version {version.version}</span>
                      {isLatest && <Badge variant="secondary">Latest</Badge>}
                      {attachedCount > 0 && (
                        <Badge variant="outline">
                          Used in {attachedCount} {attachedCount === 1 ? 'application' : 'applications'}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-supporting text-muted-foreground">
                      {version.file_name} · {formatFileSize(version.size_bytes)} · {formatDateTime(version.created_at)}
                    </p>
                    {version.description && <p className="mt-1 text-supporting">{version.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => viewDocument(version)} aria-label={`View version ${version.version}`}>
                      <Eye aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => downloadDocument(version)}
                      aria-label={`Download version ${version.version}`}
                    >
                      <Download aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setVersionToDelete(version)}
                      disabled={attachedCount > 0}
                      title={attachedCount > 0 ? 'Attached to an application, so it cannot be deleted' : undefined}
                      aria-label={`Delete version ${version.version}`}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ol>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={versionToDelete !== null}
        onOpenChange={(nextIsOpen) => !nextIsOpen && setVersionToDelete(null)}
        title={`Delete version ${versionToDelete?.version ?? ''}?`}
        description="The file is permanently removed from your library. This cannot be undone."
        confirmLabel="Delete version"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteVersion.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
