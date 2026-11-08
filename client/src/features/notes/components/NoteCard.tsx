import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import { NOTE_CATEGORY_LABELS } from '../constants/noteCategories'
import type { NoteRecord } from '../types/note.types'

/** Notes longer than this start collapsed. */
const COLLAPSE_AFTER_CHARACTERS = 320
const COLLAPSE_AFTER_LINES = 6

function isLongNote(content: string): boolean {
  return content.length > COLLAPSE_AFTER_CHARACTERS || content.split('\n').length > COLLAPSE_AFTER_LINES
}

interface NoteCardProps {
  note: NoteRecord
  /** Show which application the note belongs to. */
  showApplication?: boolean
  onEdit: (note: NoteRecord) => void
  onDelete: (note: NoteRecord) => void
}

export function NoteCard({ note, showApplication = true, onEdit, onDelete }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentId = useId()
  const isCollapsible = isLongNote(note.content)
  const wasEdited = note.updated_at !== note.created_at

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <header className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="text-card-title font-semibold break-words">{note.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-supporting text-muted-foreground">
            <Badge variant="secondary">{NOTE_CATEGORY_LABELS[note.category]}</Badge>
            <span>
              {wasEdited ? 'Updated' : 'Written'} <time dateTime={note.updated_at}>{formatDate(note.updated_at)}</time>
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${note.title}`} />}>
            <MoreHorizontal aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              <Pencil aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(note)}>
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {showApplication && note.application && (
        <p className="text-supporting">
          <Link
            to={buildApplicationDetailPath(note.application.id)}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {note.application.opportunity.title}
          </Link>
          <span className="text-muted-foreground"> · {note.application.opportunity.organization}</span>
        </p>
      )}

      <p
        id={contentId}
        className={cn('text-body break-words whitespace-pre-line', isCollapsible && !isExpanded && 'line-clamp-5')}
      >
        {note.content}
      </p>

      {isCollapsible && (
        <button
          type="button"
          className="w-fit text-supporting font-medium text-primary underline-offset-4 hover:underline"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </article>
  )
}
