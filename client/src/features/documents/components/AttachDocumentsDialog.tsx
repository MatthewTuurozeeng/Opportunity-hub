import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { DOCUMENT_CATEGORY_LABELS } from '../constants/documentCategories'
import { useAttachDocuments } from '../hooks/useDocumentMutations'
import { useDocuments } from '../hooks/useDocumentQueries'
import { filterDocumentGroups, groupDocumentVersions } from '../utils/documentGroups'
import { DocumentFileIcon } from './DocumentFileIcon'

/** Mounted with a fresh `key` per opening, so the selection always starts empty. */
interface AttachDocumentsDialogProps {
  applicationId: string
  attachedDocumentIds: ReadonlySet<string>
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

/** Pick documents from the library. The latest version of each document is attached. */
export function AttachDocumentsDialog({
  applicationId,
  attachedDocumentIds,
  isOpen,
  onOpenChange,
}: AttachDocumentsDialogProps) {
  const { data: documents, isLoading, error, refetch } = useDocuments()
  const attachDocuments = useAttachDocuments(applicationId)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())

  const availableGroups = useMemo(() => {
    const groups = groupDocumentVersions(documents ?? []).filter(
      // Hide documents whose latest version is already attached.
      (group) => !attachedDocumentIds.has(group.latest.id),
    )
    return filterDocumentGroups(groups, { searchTerm, category: 'all' })
  }, [documents, attachedDocumentIds, searchTerm])

  function toggleSelection(documentId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(documentId)) next.delete(documentId)
      else next.add(documentId)
      return next
    })
  }

  function handleAttach() {
    attachDocuments.mutate([...selectedIds], {
      onSuccess: () => {
        toast.success(selectedIds.size === 1 ? 'Document attached.' : `${selectedIds.size} documents attached.`)
        onOpenChange(false)
      },
    })
  }

  function renderList() {
    if (isLoading) return <LoadingState label="Loading your library…" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!documents?.length) {
      return (
        <p className="py-6 text-center text-body text-muted-foreground">
          Your library is empty.{' '}
          <Link to={ROUTE_PATHS.DOCUMENTS} className="font-medium text-primary underline-offset-4 hover:underline">
            Upload documents
          </Link>{' '}
          first.
        </p>
      )
    }

    if (!availableGroups.length) {
      return (
        <p className="py-6 text-center text-body text-muted-foreground">
          {searchTerm ? 'No documents match your search.' : 'All your documents are already attached.'}
        </p>
      )
    }

    return (
      <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto" aria-label="Documents in your library">
        {availableGroups.map(({ versionGroupId, latest }) => {
          const checkboxId = `attach-${latest.id}`
          return (
            <li key={versionGroupId}>
              <label
                htmlFor={checkboxId}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted has-checked:bg-secondary"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  className="size-4 shrink-0 accent-primary"
                  checked={selectedIds.has(latest.id)}
                  onChange={() => toggleSelection(latest.id)}
                />
                <DocumentFileIcon mimeType={latest.mime_type} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium">{latest.name}</span>
                  <span className="block truncate text-supporting text-muted-foreground">
                    {DOCUMENT_CATEGORY_LABELS[latest.category]} · {latest.file_name}
                  </span>
                </span>
                <Badge variant="secondary">v{latest.version}</Badge>
              </label>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(nextIsOpen) => !attachDocuments.isPending && onOpenChange(nextIsOpen)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attach documents</DialogTitle>
          <DialogDescription>
            Choose documents from your library. The current version is attached and kept even if you upload newer
            versions later.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Label htmlFor="attach-search" className="sr-only">
            Search your library
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="attach-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search your library"
            className="pl-8"
          />
        </div>

        {renderList()}

        {attachDocuments.error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
            {attachDocuments.error.message}
          </p>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={attachDocuments.isPending} />}>Cancel</DialogClose>
          <Button onClick={handleAttach} disabled={!selectedIds.size || attachDocuments.isPending}>
            {attachDocuments.isPending
              ? 'Attaching…'
              : selectedIds.size > 1
                ? `Attach ${selectedIds.size} documents`
                : 'Attach'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
