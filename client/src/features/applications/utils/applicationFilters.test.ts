import { describe, expect, it } from 'vitest'

import type { ApplicationRecord } from '../types/application.types'
import {
  DEFAULT_APPLICATION_FILTERS,
  filterAndSortApplications,
  hasActiveFilters,
  parseApplicationFilters,
  toFilterSearchParams,
} from './applicationFilters'

const NOW = new Date('2026-11-07T12:00:00Z')

function buildApplication(
  overrides: Partial<Omit<ApplicationRecord, 'opportunity'>> & {
    opportunity?: Partial<ApplicationRecord['opportunity']>
  } = {},
): ApplicationRecord {
  const { opportunity, ...application } = overrides
  const id = application.id ?? crypto.randomUUID()

  return {
    id,
    user_id: 'user-1',
    opportunity_id: `opportunity-${id}`,
    status: 'draft',
    submitted_at: null,
    application_method: null,
    reference_number: null,
    notes: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...application,
    opportunity: {
      id: `opportunity-${id}`,
      user_id: 'user-1',
      category_id: null,
      category: null,
      title: 'Untitled',
      organization: 'Organization',
      location: null,
      description: null,
      application_url: null,
      source: null,
      deadline: null,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
      ...opportunity,
    },
  }
}

const scholarship = buildApplication({
  id: 'scholarship',
  status: 'submitted',
  submitted_at: '2026-10-20T00:00:00Z',
  reference_number: 'REF-778',
  updated_at: '2026-11-01T00:00:00Z',
  created_at: '2026-09-01T00:00:00Z',
  opportunity: {
    title: 'Global Leaders Scholarship',
    organization: 'Example Foundation',
    category_id: 'cat-scholarships',
    category: { id: 'cat-scholarships', name: 'Scholarships' },
    deadline: '2026-12-01T23:59:59Z',
  },
})

const internship = buildApplication({
  id: 'internship',
  status: 'interview',
  submitted_at: '2026-09-15T00:00:00Z',
  updated_at: '2026-11-05T00:00:00Z',
  created_at: '2026-08-01T00:00:00Z',
  opportunity: {
    title: 'Software Engineering Internship',
    organization: 'Acme Corp',
    location: 'Accra',
    category_id: 'cat-internships',
    category: { id: 'cat-internships', name: 'Internships' },
    deadline: '2026-10-01T23:59:59Z',
  },
})

const draft = buildApplication({
  id: 'draft',
  updated_at: '2026-10-10T00:00:00Z',
  created_at: '2026-10-10T00:00:00Z',
  opportunity: { title: 'Research Fellowship', organization: 'University Lab' },
})

const applications = [scholarship, internship, draft]

function ids(records: ApplicationRecord[]) {
  return records.map((record) => record.id)
}

describe('filterAndSortApplications', () => {
  it('sorts by last updated by default', () => {
    expect(ids(filterAndSortApplications(applications, DEFAULT_APPLICATION_FILTERS, NOW))).toEqual([
      'internship',
      'scholarship',
      'draft',
    ])
  })

  it('searches title, organization, location, category and reference number case-insensitively', () => {
    const search = (searchTerm: string) =>
      ids(filterAndSortApplications(applications, { ...DEFAULT_APPLICATION_FILTERS, searchTerm }, NOW))

    expect(search('  ACME ')).toEqual(['internship'])
    expect(search('accra')).toEqual(['internship'])
    expect(search('scholarships')).toEqual(['scholarship'])
    expect(search('ref-778')).toEqual(['scholarship'])
    expect(search('nothing matches')).toEqual([])
  })

  it('filters by category and status', () => {
    expect(
      ids(filterAndSortApplications(applications, { ...DEFAULT_APPLICATION_FILTERS, categoryId: 'cat-internships' }, NOW)),
    ).toEqual(['internship'])
    expect(ids(filterAndSortApplications(applications, { ...DEFAULT_APPLICATION_FILTERS, status: 'draft' }, NOW))).toEqual([
      'draft',
    ])
  })

  it('filters by deadline', () => {
    const byDeadline = (deadline: (typeof DEFAULT_APPLICATION_FILTERS)['deadline']) =>
      ids(filterAndSortApplications(applications, { ...DEFAULT_APPLICATION_FILTERS, deadline }, NOW))

    expect(byDeadline('upcoming')).toEqual(['scholarship'])
    expect(byDeadline('passed')).toEqual(['internship'])
    expect(byDeadline('none')).toEqual(['draft'])
  })

  it('sorts by deadline and submission date with empty dates last', () => {
    expect(
      ids(filterAndSortApplications(applications, { ...DEFAULT_APPLICATION_FILTERS, sortBy: 'deadline_asc' }, NOW)),
    ).toEqual(['internship', 'scholarship', 'draft'])
    expect(
      ids(filterAndSortApplications(applications, { ...DEFAULT_APPLICATION_FILTERS, sortBy: 'submitted_desc' }, NOW)),
    ).toEqual(['scholarship', 'internship', 'draft'])
  })

  it('does not mutate the input array', () => {
    const input = [...applications]
    filterAndSortApplications(input, { ...DEFAULT_APPLICATION_FILTERS, sortBy: 'created_desc' }, NOW)
    expect(input).toEqual(applications)
  })
})

describe('URL filter parameters', () => {
  it('ignores invalid values', () => {
    const filters = parseApplicationFilters(new URLSearchParams('status=hacked&sort=bogus&deadline=x'))
    expect(filters).toEqual(DEFAULT_APPLICATION_FILTERS)
  })

  it('round-trips non-default filters and omits defaults', () => {
    const filters = { ...DEFAULT_APPLICATION_FILTERS, searchTerm: ' acme ', status: 'interview' as const }
    const searchParams = toFilterSearchParams(filters)

    expect(searchParams.toString()).toBe('q=acme&status=interview')
    expect(parseApplicationFilters(searchParams)).toEqual({ ...filters, searchTerm: 'acme' })
  })
})

describe('hasActiveFilters', () => {
  it('ignores sorting and whitespace-only search', () => {
    expect(hasActiveFilters({ ...DEFAULT_APPLICATION_FILTERS, sortBy: 'deadline_asc', searchTerm: '  ' })).toBe(false)
    expect(hasActiveFilters({ ...DEFAULT_APPLICATION_FILTERS, status: 'successful' })).toBe(true)
  })
})
