/**
 * Application statuses (README section 2.3) and their badge colors (section 4.3).
 * Values are snake_case so they can map directly onto a PostgreSQL enum.
 */
export const APPLICATION_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'shortlisted',
  'interview',
  'assessment',
  'successful',
  'unsuccessful',
  'withdrawn',
  'no_response',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

interface ApplicationStatusDetails {
  label: string
  description: string
  badgeClassName: string
}

export const APPLICATION_STATUS_DETAILS: Record<ApplicationStatus, ApplicationStatusDetails> = {
  draft: {
    label: 'Draft',
    description: 'Opportunity recorded but application not submitted.',
    badgeClassName: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  submitted: {
    label: 'Submitted',
    description: 'Application successfully submitted.',
    badgeClassName: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  under_review: {
    label: 'Under Review',
    description: 'Application is being reviewed.',
    badgeClassName: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  shortlisted: {
    label: 'Shortlisted',
    description: 'Applicant has been shortlisted.',
    badgeClassName: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  interview: {
    label: 'Interview',
    description: 'Interview stage reached.',
    badgeClassName: 'bg-violet-50 text-violet-800 border-violet-200',
  },
  assessment: {
    label: 'Assessment',
    description: 'Additional assessment or evaluation required.',
    badgeClassName: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  successful: {
    label: 'Successful',
    description: 'Application resulted in a positive outcome.',
    badgeClassName: 'bg-success-green text-pure-white border-success-green',
  },
  unsuccessful: {
    label: 'Unsuccessful',
    description: 'Application was rejected.',
    badgeClassName: 'bg-red-50 text-red-800 border-red-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    description: 'Application voluntarily withdrawn.',
    badgeClassName: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  no_response: {
    label: 'No Response',
    description: 'No final response recorded.',
    badgeClassName: 'bg-orange-50 text-orange-800 border-orange-200',
  },
}
