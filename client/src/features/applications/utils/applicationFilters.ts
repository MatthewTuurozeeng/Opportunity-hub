import { APPLICATION_STATUSES } from '../constants/applicationStatuses'
import {
  APPLICATION_SORT_OPTIONS,
  type ApplicationFilters,
  type ApplicationRecord,
  type ApplicationSortOption,
  DEADLINE_FILTERS,
} from '../types/application.types'

export const DEFAULT_APPLICATION_FILTERS: ApplicationFilters = {
  searchTerm: '',
  categoryId: 'all',
  status: 'all',
  deadline: 'all',
  sortBy: 'updated_desc',
}

/** URL search parameter names, so filters survive refreshes and the back button. */
export const FILTER_SEARCH_PARAMS = {
  searchTerm: 'q',
  categoryId: 'category',
  status: 'status',
  deadline: 'deadline',
  sortBy: 'sort',
} as const satisfies Record<keyof ApplicationFilters, string>

function isOneOf<T extends string>(options: readonly T[], value: string | null): value is T {
  return value !== null && (options as readonly string[]).includes(value)
}

/** Reads filters from URL search params, ignoring anything invalid. */
export function parseApplicationFilters(searchParams: URLSearchParams): ApplicationFilters {
  const status = searchParams.get(FILTER_SEARCH_PARAMS.status)
  const deadline = searchParams.get(FILTER_SEARCH_PARAMS.deadline)
  const sortBy = searchParams.get(FILTER_SEARCH_PARAMS.sortBy)

  return {
    searchTerm: searchParams.get(FILTER_SEARCH_PARAMS.searchTerm) ?? DEFAULT_APPLICATION_FILTERS.searchTerm,
    categoryId: searchParams.get(FILTER_SEARCH_PARAMS.categoryId) || DEFAULT_APPLICATION_FILTERS.categoryId,
    status: isOneOf(APPLICATION_STATUSES, status) ? status : DEFAULT_APPLICATION_FILTERS.status,
    deadline: isOneOf(DEADLINE_FILTERS, deadline) ? deadline : DEFAULT_APPLICATION_FILTERS.deadline,
    sortBy: isOneOf(APPLICATION_SORT_OPTIONS, sortBy) ? sortBy : DEFAULT_APPLICATION_FILTERS.sortBy,
  }
}

/** Writes only non-default filters, keeping URLs short. */
export function toFilterSearchParams(filters: ApplicationFilters): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const key of Object.keys(FILTER_SEARCH_PARAMS) as (keyof ApplicationFilters)[]) {
    const value = key === 'searchTerm' ? filters[key].trim() : filters[key]
    if (value && value !== DEFAULT_APPLICATION_FILTERS[key]) {
      searchParams.set(FILTER_SEARCH_PARAMS[key], value)
    }
  }

  return searchParams
}

export function hasActiveFilters(filters: ApplicationFilters): boolean {
  return (
    filters.searchTerm.trim() !== '' ||
    filters.categoryId !== DEFAULT_APPLICATION_FILTERS.categoryId ||
    filters.status !== DEFAULT_APPLICATION_FILTERS.status ||
    filters.deadline !== DEFAULT_APPLICATION_FILTERS.deadline
  )
}

function matchesSearch(application: ApplicationRecord, searchTerm: string): boolean {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  if (!normalizedSearchTerm) return true

  const { opportunity } = application
  const searchableValues = [
    opportunity.title,
    opportunity.organization,
    opportunity.location,
    opportunity.category?.name,
    application.reference_number,
  ]

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedSearchTerm))
}

function matchesDeadline(application: ApplicationRecord, deadlineFilter: ApplicationFilters['deadline'], now: Date) {
  const { deadline } = application.opportunity

  switch (deadlineFilter) {
    case 'upcoming':
      return deadline !== null && new Date(deadline) >= now
    case 'passed':
      return deadline !== null && new Date(deadline) < now
    case 'none':
      return deadline === null
    default:
      return true
  }
}

/** Compares two nullable ISO timestamps, always placing nulls last. */
function compareNullableDates(first: string | null, second: string | null, direction: 'asc' | 'desc'): number {
  if (first === second) return 0
  if (first === null) return 1
  if (second === null) return -1

  const difference = new Date(first).getTime() - new Date(second).getTime()
  return direction === 'asc' ? difference : -difference
}

const SORT_COMPARATORS: Record<ApplicationSortOption, (a: ApplicationRecord, b: ApplicationRecord) => number> = {
  updated_desc: (a, b) => compareNullableDates(a.updated_at, b.updated_at, 'desc'),
  deadline_asc: (a, b) => compareNullableDates(a.opportunity.deadline, b.opportunity.deadline, 'asc'),
  submitted_desc: (a, b) => compareNullableDates(a.submitted_at, b.submitted_at, 'desc'),
  created_desc: (a, b) => compareNullableDates(a.created_at, b.created_at, 'desc'),
}

export function filterAndSortApplications(
  applications: readonly ApplicationRecord[],
  filters: ApplicationFilters,
  now: Date = new Date(),
): ApplicationRecord[] {
  return applications
    .filter(
      (application) =>
        matchesSearch(application, filters.searchTerm) &&
        (filters.categoryId === 'all' || application.opportunity.category_id === filters.categoryId) &&
        (filters.status === 'all' || application.status === filters.status) &&
        matchesDeadline(application, filters.deadline, now),
    )
    .sort(SORT_COMPARATORS[filters.sortBy])
}
