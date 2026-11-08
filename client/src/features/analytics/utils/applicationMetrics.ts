import type { ApplicationStatus } from '@/features/applications/constants/applicationStatuses'

import { type Outcome, OUTCOME_BY_STATUS, OUTCOMES } from '../constants/outcomes'

/** The fields the calculations need, so tests can use small objects. */
export interface MetricsApplication {
  id: string
  status: ApplicationStatus
  submitted_at: string | null
  created_at: string
  opportunity: { category: { name: string } | null }
}

export const UNCATEGORIZED_LABEL = 'Uncategorized'

/** The outcome group of a submitted application, or null for a draft. */
export function getOutcome(status: ApplicationStatus): Outcome | null {
  return status === 'draft' ? null : OUTCOME_BY_STATUS[status]
}

/** When an application was submitted. Falls back to when it was recorded if no date was entered. */
export function getSubmissionDate(application: Pick<MetricsApplication, 'submitted_at' | 'created_at'>): Date {
  return new Date(application.submitted_at ?? application.created_at)
}

export function toPercent(part: number, whole: number): number | null {
  return whole > 0 ? (part / whole) * 100 : null
}

export interface ApplicationMetrics {
  total: number
  drafts: number
  /** Every non-draft application. */
  submitted: number
  outcomes: Record<Outcome, number>
  /** Successful + unsuccessful: applications with a final decision. */
  decided: number
  /** Successful / decided × 100, or null when nothing is decided yet. */
  successRate: number | null
  /** Submitted applications that reached the Interview stage. */
  interviewsReached: number
  /** Interviews reached / submitted × 100, or null when nothing is submitted yet. */
  interviewRate: number | null
}

/**
 * @param interviewApplicationIds Applications whose status history includes Interview.
 *   An application currently at Interview counts even without history.
 */
export function computeApplicationMetrics(
  applications: readonly MetricsApplication[],
  interviewApplicationIds: ReadonlySet<string> = new Set(),
): ApplicationMetrics {
  const outcomes = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, 0])) as Record<Outcome, number>
  let drafts = 0
  let interviewsReached = 0

  for (const application of applications) {
    const outcome = getOutcome(application.status)
    if (!outcome) {
      drafts += 1
      continue
    }

    outcomes[outcome] += 1
    if (application.status === 'interview' || interviewApplicationIds.has(application.id)) {
      interviewsReached += 1
    }
  }

  const submitted = applications.length - drafts
  const decided = outcomes.successful + outcomes.unsuccessful

  return {
    total: applications.length,
    drafts,
    submitted,
    outcomes,
    decided,
    successRate: toPercent(outcomes.successful, decided),
    interviewsReached,
    interviewRate: toPercent(interviewsReached, submitted),
  }
}

export interface CountedItem {
  label: string
  count: number
}

/** Submitted applications per category, largest first. */
export function countSubmittedByCategory(applications: readonly MetricsApplication[]): CountedItem[] {
  const counts = new Map<string, number>()

  for (const application of applications) {
    if (application.status === 'draft') continue
    const label = application.opportunity.category?.name ?? UNCATEGORIZED_LABEL
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
}

/** Submitted applications per year of submission, oldest year first. */
export function countSubmittedByYear(applications: readonly MetricsApplication[]): CountedItem[] {
  const counts = new Map<number, number>()

  for (const application of applications) {
    if (application.status === 'draft') continue
    const year = getSubmissionDate(application).getFullYear()
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }

  return [...counts]
    .sort(([firstYear], [secondYear]) => firstYear - secondYear)
    .map(([year, count]) => ({ label: String(year), count }))
}

export type MonthlyOutcomes = Record<Outcome, number> & {
  /** "YYYY-MM" */
  key: string
  /** Short month, e.g. "Nov". */
  label: string
  /** Month and year, e.g. "November 2026". */
  fullLabel: string
  total: number
}

const shortMonthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' })
const longMonthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Submitted applications per submission month for the last `monthCount` months (oldest first), by current outcome. */
export function buildMonthlyOutcomes(
  applications: readonly MetricsApplication[],
  { monthCount = 12, now = new Date() }: { monthCount?: number; now?: Date } = {},
): MonthlyOutcomes[] {
  const months: MonthlyOutcomes[] = Array.from({ length: monthCount }, (_, index) => {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1)
    return {
      key: toMonthKey(monthStart),
      label: shortMonthFormatter.format(monthStart),
      fullLabel: longMonthFormatter.format(monthStart),
      total: 0,
      successful: 0,
      pending: 0,
      unsuccessful: 0,
      closed: 0,
    }
  })
  const monthsByKey = new Map(months.map((month) => [month.key, month]))

  for (const application of applications) {
    const outcome = getOutcome(application.status)
    if (!outcome) continue

    const month = monthsByKey.get(toMonthKey(getSubmissionDate(application)))
    if (!month) continue

    month[outcome] += 1
    month.total += 1
  }

  return months
}

/** e.g. 66.666 -> "67%"; null -> "—". */
export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)}%`
}
