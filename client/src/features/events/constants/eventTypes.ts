import {
  BellRing,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ListChecks,
  type LucideIcon,
  MailOpen,
  MailX,
  Send,
  Trophy,
  Users,
} from 'lucide-react'

import type { Enums } from '@/types/database.types'

export type ApplicationEventType = Enums<'application_event_type'>

/** Event types (README section 2.6), in display order. Mirrors the database enum. */
export const APPLICATION_EVENT_TYPES = [
  'application_deadline',
  'submission',
  'shortlisting_notification',
  'interview_invitation',
  'interview',
  'assessment',
  'follow_up_reminder',
  'acceptance_notification',
  'rejection_notification',
  'other',
] as const satisfies readonly ApplicationEventType[]

interface EventTypeDetails {
  label: string
  icon: LucideIcon
  /** Tinted chip behind the type icon. The label is always shown too, never color alone. */
  iconClassName: string
}

export const EVENT_TYPE_DETAILS: Record<ApplicationEventType, EventTypeDetails> = {
  application_deadline: {
    label: 'Application deadline',
    icon: CalendarClock,
    iconClassName: 'bg-amber-50 text-amber-700',
  },
  submission: {
    label: 'Submission',
    icon: Send,
    iconClassName: 'bg-blue-50 text-blue-700',
  },
  shortlisting_notification: {
    label: 'Shortlisting notification',
    icon: ListChecks,
    iconClassName: 'bg-emerald-50 text-emerald-700',
  },
  interview_invitation: {
    label: 'Interview invitation',
    icon: MailOpen,
    iconClassName: 'bg-violet-50 text-violet-700',
  },
  interview: {
    label: 'Interview',
    icon: Users,
    iconClassName: 'bg-violet-50 text-violet-700',
  },
  assessment: {
    label: 'Assessment',
    icon: ClipboardCheck,
    iconClassName: 'bg-orange-50 text-orange-700',
  },
  follow_up_reminder: {
    label: 'Follow-up reminder',
    icon: BellRing,
    iconClassName: 'bg-cyan-50 text-cyan-700',
  },
  acceptance_notification: {
    label: 'Acceptance notification',
    icon: Trophy,
    iconClassName: 'bg-green-50 text-success-green',
  },
  rejection_notification: {
    label: 'Rejection notification',
    icon: MailX,
    iconClassName: 'bg-red-50 text-red-700',
  },
  other: {
    label: 'Other event',
    icon: CalendarDays,
    iconClassName: 'bg-slate-100 text-slate-700',
  },
}
