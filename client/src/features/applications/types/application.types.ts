import type { Tables } from '@/types/database.types'

import type { ApplicationStatus } from '../constants/applicationStatuses'

export type CategorySummary = Pick<Tables<'categories'>, 'id' | 'name'>

export type OpportunityWithCategory = Tables<'opportunities'> & {
  category: CategorySummary | null
}

/** An application joined with its opportunity and the opportunity's category. */
export type ApplicationRecord = Tables<'applications'> & {
  opportunity: OpportunityWithCategory
}

export type StatusHistoryEntry = Tables<'application_status_history'>

export const APPLICATION_SORT_OPTIONS = ['updated_desc', 'deadline_asc', 'submitted_desc', 'created_desc'] as const
export type ApplicationSortOption = (typeof APPLICATION_SORT_OPTIONS)[number]

export const DEADLINE_FILTERS = ['all', 'upcoming', 'passed', 'none'] as const
export type DeadlineFilter = (typeof DEADLINE_FILTERS)[number]

export interface ApplicationFilters {
  searchTerm: string
  /** A category id, or 'all'. */
  categoryId: string
  status: ApplicationStatus | 'all'
  deadline: DeadlineFilter
  sortBy: ApplicationSortOption
}

/** Values sent to the database when creating or updating an application. */
export interface ApplicationPayload {
  opportunity: {
    title: string
    organization: string
    category_id: string | null
    location: string | null
    description: string | null
    application_url: string | null
    source: string | null
    deadline: string | null
  }
  application: {
    status: ApplicationStatus
    submitted_at: string | null
    application_method: string | null
    reference_number: string | null
    notes: string | null
  }
}
