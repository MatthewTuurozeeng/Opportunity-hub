import { ArrowDownLeft, ArrowUpRight, type LucideIcon } from 'lucide-react'

import type { Enums } from '@/types/database.types'

export type CommunicationType = Enums<'communication_type'>
export type CommunicationDirection = Enums<'communication_direction'>

/** Communication types (README section 2.5), in display order. Mirrors the database enum. */
export const COMMUNICATION_TYPES = [
  'application_confirmation',
  'interview_invitation',
  'follow_up',
  'assessment_notification',
  'acceptance_notification',
  'rejection_notification',
  'general_inquiry',
  'other',
] as const satisfies readonly CommunicationType[]

export const COMMUNICATION_TYPE_LABELS: Record<CommunicationType, string> = {
  application_confirmation: 'Application confirmation',
  interview_invitation: 'Interview invitation',
  follow_up: 'Follow-up email',
  assessment_notification: 'Assessment notification',
  acceptance_notification: 'Acceptance notification',
  rejection_notification: 'Rejection notification',
  general_inquiry: 'General inquiry',
  other: 'Other communication',
}

export const COMMUNICATION_DIRECTIONS = ['received', 'sent'] as const satisfies readonly CommunicationDirection[]

interface DirectionDetails {
  label: string
  icon: LucideIcon
  /** Tinted chip behind the direction icon. The label is always shown too. */
  iconClassName: string
}

export const COMMUNICATION_DIRECTION_DETAILS: Record<CommunicationDirection, DirectionDetails> = {
  received: { label: 'Received', icon: ArrowDownLeft, iconClassName: 'bg-cyan-50 text-cyan-700' },
  sent: { label: 'Sent', icon: ArrowUpRight, iconClassName: 'bg-indigo-50 text-indigo-700' },
}
