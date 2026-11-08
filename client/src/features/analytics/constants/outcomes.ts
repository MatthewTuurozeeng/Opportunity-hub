import type { ApplicationStatus } from '@/features/applications/constants/applicationStatuses'

/**
 * Outcome groups for submitted applications (drafts are never counted).
 * "Pending" is never treated as unsuccessful (README section 2.7).
 */
export const OUTCOMES = ['successful', 'pending', 'unsuccessful', 'closed'] as const
export type Outcome = (typeof OUTCOMES)[number]

export const OUTCOME_BY_STATUS: Record<Exclude<ApplicationStatus, 'draft'>, Outcome> = {
  submitted: 'pending',
  under_review: 'pending',
  shortlisted: 'pending',
  interview: 'pending',
  assessment: 'pending',
  successful: 'successful',
  unsuccessful: 'unsuccessful',
  withdrawn: 'closed',
  no_response: 'closed',
}

interface OutcomeDetails {
  label: string
  description: string
  /**
   * Series color. This order and these values pass the categorical palette
   * validator on white (lightness, chroma, CVD and contrast checks).
   */
  color: string
}

export const OUTCOME_DETAILS: Record<Outcome, OutcomeDetails> = {
  successful: { label: 'Successful', description: 'Positive outcome.', color: '#1f7a4d' },
  pending: { label: 'Pending', description: 'Submitted and awaiting a decision.', color: '#2a78d6' },
  unsuccessful: { label: 'Unsuccessful', description: 'Application was rejected.', color: '#d03b3b' },
  closed: { label: 'Closed', description: 'Withdrawn, or no response was received.', color: '#8a7fd0' },
}

/** Single-series bars (one hue for magnitude). */
export const SINGLE_SERIES_COLOR = '#2a78d6'
