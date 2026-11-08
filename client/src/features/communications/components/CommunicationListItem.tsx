import { ChevronDown, Download, ExternalLink, MoreHorizontal, Paperclip, Pencil, Trash2 } from 'lucide-react'
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
import { useOpenDocument } from '@/features/documents/hooks/useOpenDocument'
import { formatDateTime } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

import { COMMUNICATION_DIRECTION_DETAILS, COMMUNICATION_TYPE_LABELS } from '../constants/communicationTypes'
import type { CommunicationRecord } from '../types/communication.types'

function describeParticipants({ direction, sender, recipient }: CommunicationRecord): string | null {
  if (direction === 'received') {
    if (sender) return recipient ? `From ${sender} to ${recipient}` : `From ${sender}`
    return recipient ? `To ${recipient}` : null
  }
  if (recipient) return sender ? `From ${sender} to ${recipient}` : `To ${recipient}`
  return sender ? `From ${sender}` : null
}

interface CommunicationListItemProps {
  communication: CommunicationRecord
  /** Show which application it belongs to (on the main Communications page). */
  showApplication?: boolean
  onEdit: (communication: CommunicationRecord) => void
  onDelete: (communication: CommunicationRecord) => void
}

export function CommunicationListItem({ communication, showApplication = false, onEdit, onDelete }: CommunicationListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentId = useId()
  const { viewDocument, downloadDocument } = useOpenDocument()
  const directionDetails = COMMUNICATION_DIRECTION_DETAILS[communication.direction]
  const DirectionIcon = directionDetails.icon
  const participants = describeParticipants(communication)
  const { opportunity } = communication.application
  const { attachment } = communication

  return (
    <li className="flex items-start gap-3 p-4">
      <span
        aria-hidden="true"
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', directionDetails.iconClassName)}
      >
        <DirectionIcon className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium break-words text-heading">{communication.subject}</p>
          <Badge variant="outline">{COMMUNICATION_TYPE_LABELS[communication.communication_type]}</Badge>
        </div>

        <p className="text-supporting text-muted-foreground">
          <span className="font-medium">{directionDetails.label}</span>
          {' · '}
          <time dateTime={communication.communicated_at}>{formatDateTime(communication.communicated_at)}</time>
          {participants && <> · {participants}</>}
        </p>

        {showApplication && (
          <p className="text-supporting">
            <Link
              to={buildApplicationDetailPath(communication.application.id)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {opportunity.title}
            </Link>
            <span className="text-muted-foreground"> · {opportunity.organization}</span>
          </p>
        )}

        {communication.summary && <p className="mt-1 text-body whitespace-pre-line">{communication.summary}</p>}

        {(communication.external_link || attachment) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            {communication.external_link && (
              <a
                href={communication.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-supporting font-medium text-primary underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Open original message
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            {attachment && (
              <span className="inline-flex items-center gap-1 text-supporting">
                <Paperclip className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => viewDocument(attachment)}
                >
                  {attachment.name} (v{attachment.version})
                </button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => downloadDocument(attachment)}
                  aria-label={`Download ${attachment.name}`}
                >
                  <Download aria-hidden="true" />
                </Button>
              </span>
            )}
          </div>
        )}

        {communication.content && (
          <div className="mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2.5 text-muted-foreground"
              aria-expanded={isExpanded}
              aria-controls={contentId}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              <ChevronDown className={cn('transition-transform', isExpanded && 'rotate-180')} aria-hidden="true" />
              {isExpanded ? 'Hide full message' : 'Show full message'}
            </Button>
            {isExpanded && (
              <p id={contentId} className="mt-1 rounded-md bg-muted px-3 py-2 text-body break-words whitespace-pre-line">
                {communication.content}
              </p>
            )}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${communication.subject}`} />}
        >
          <MoreHorizontal aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onEdit(communication)}>
            <Pencil aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(communication)}>
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
