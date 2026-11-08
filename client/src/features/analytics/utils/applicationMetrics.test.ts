import { describe, expect, it } from 'vitest'

import type { ApplicationStatus } from '@/features/applications/constants/applicationStatuses'

import {
  buildMonthlyOutcomes,
  computeApplicationMetrics,
  countSubmittedByCategory,
  countSubmittedByYear,
  formatPercent,
  type MetricsApplication,
  UNCATEGORIZED_LABEL,
} from './applicationMetrics'

function application(
  id: string,
  status: ApplicationStatus,
  { submittedAt = null, createdAt = '2026-01-15T10:00:00Z', category = 'Scholarships' }: {
    submittedAt?: string | null
    createdAt?: string
    category?: string | null
  } = {},
): MetricsApplication {
  return {
    id,
    status,
    submitted_at: submittedAt,
    created_at: createdAt,
    opportunity: { category: category === null ? null : { name: category } },
  }
}

describe('computeApplicationMetrics', () => {
  const applications = [
    application('draft', 'draft'),
    application('submitted', 'submitted'),
    application('interview-now', 'interview'),
    application('won', 'successful'),
    application('lost', 'unsuccessful'),
    application('lost-after-interview', 'unsuccessful'),
    application('withdrawn', 'withdrawn'),
    application('silent', 'no_response'),
  ]

  const metrics = computeApplicationMetrics(applications, new Set(['won', 'lost-after-interview', 'draft']))

  it('never counts drafts as submitted', () => {
    expect(metrics).toMatchObject({ total: 8, drafts: 1, submitted: 7 })
  })

  it('groups outcomes without treating pending as unsuccessful', () => {
    expect(metrics.outcomes).toEqual({ successful: 1, pending: 2, unsuccessful: 2, closed: 2 })
  })

  it('computes success rate over decided applications only', () => {
    expect(metrics.decided).toBe(3)
    expect(metrics.successRate).toBeCloseTo(33.33, 1)
  })

  it('counts applications that reached the interview stage, ignoring drafts', () => {
    expect(metrics.interviewsReached).toBe(3)
    expect(metrics.interviewRate).toBeCloseTo((3 / 7) * 100)
  })

  it('returns null rates when there is nothing to divide by', () => {
    const empty = computeApplicationMetrics([application('draft', 'draft')])
    expect(empty.successRate).toBeNull()
    expect(empty.interviewRate).toBeNull()
  })
})

describe('countSubmittedByCategory', () => {
  it('counts submitted applications per category, largest first', () => {
    const counts = countSubmittedByCategory([
      application('a', 'submitted', { category: 'Internships' }),
      application('b', 'successful', { category: 'Scholarships' }),
      application('c', 'interview', { category: 'Scholarships' }),
      application('d', 'submitted', { category: null }),
      application('e', 'draft', { category: 'Internships' }),
    ])

    expect(counts).toEqual([
      { label: 'Scholarships', count: 2 },
      { label: 'Internships', count: 1 },
      { label: UNCATEGORIZED_LABEL, count: 1 },
    ])
  })
})

describe('countSubmittedByYear', () => {
  it('uses the submission date, falling back to when it was recorded', () => {
    const counts = countSubmittedByYear([
      application('a', 'submitted', { submittedAt: '2025-06-01T12:00:00Z' }),
      application('b', 'submitted', { createdAt: '2026-03-01T12:00:00Z' }),
      application('c', 'successful', { submittedAt: '2026-04-01T12:00:00Z' }),
    ])

    expect(counts).toEqual([
      { label: '2025', count: 1 },
      { label: '2026', count: 2 },
    ])
  })
})

describe('buildMonthlyOutcomes', () => {
  const now = new Date(2026, 10, 8)

  it('returns one entry per month, oldest first, ending with the current month', () => {
    const months = buildMonthlyOutcomes([], { now, monthCount: 3 })
    expect(months.map((month) => month.key)).toEqual(['2026-09', '2026-10', '2026-11'])
  })

  it('counts submissions by month and outcome, skipping drafts and older months', () => {
    const months = buildMonthlyOutcomes(
      [
        application('a', 'successful', { submittedAt: new Date(2026, 10, 2).toISOString() }),
        application('b', 'submitted', { submittedAt: new Date(2026, 10, 5).toISOString() }),
        application('c', 'unsuccessful', { submittedAt: new Date(2026, 9, 20).toISOString() }),
        application('d', 'submitted', { submittedAt: new Date(2025, 0, 1).toISOString() }),
        application('e', 'draft', { createdAt: new Date(2026, 10, 3).toISOString() }),
      ],
      { now, monthCount: 2 },
    )

    expect(months[0]).toMatchObject({ key: '2026-10', total: 1, unsuccessful: 1 })
    expect(months[1]).toMatchObject({ key: '2026-11', total: 2, successful: 1, pending: 1 })
  })
})

describe('formatPercent', () => {
  it('rounds and handles missing values', () => {
    expect(formatPercent(66.666)).toBe('67%')
    expect(formatPercent(null)).toBe('—')
  })
})
