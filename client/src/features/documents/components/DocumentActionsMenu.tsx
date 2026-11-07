import { Download, Eye, History, MoreHorizontal, Pencil, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useOpenDocument } from '../hooks/useOpenDocument'
import type { DocumentGroup } from '../types/document.types'

export type DocumentDialogType = 'new-version' | 'versions' | 'edit' | 'delete'

interface DocumentActionsMenuProps {
  group: DocumentGroup
  onOpenDialog: (dialogType: DocumentDialogType, group: DocumentGroup) => void
}

export function DocumentActionsMenu({ group, onOpenDialog }: DocumentActionsMenuProps) {
  const { viewDocument, downloadDocument } = useOpenDocument()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${group.latest.name}`} />}>
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => viewDocument(group.latest)}>
          <Eye aria-hidden="true" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadDocument(group.latest)}>
          <Download aria-hidden="true" />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onOpenDialog('new-version', group)}>
          <Upload aria-hidden="true" />
          Upload new version
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOpenDialog('versions', group)}>
          <History aria-hidden="true" />
          Version history
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOpenDialog('edit', group)}>
          <Pencil aria-hidden="true" />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onOpenDialog('delete', group)}>
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
