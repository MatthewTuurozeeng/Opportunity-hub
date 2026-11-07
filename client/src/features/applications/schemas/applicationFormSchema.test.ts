import { describe, expect, it } from 'vitest'

import { toDateInputValue } from '@/lib/dateUtils'

import {
  applicationFormSchema,
  type ApplicationFormValues,
  EMPTY_APPLICATION_FORM_VALUES,
  toApplicationPayload,
} from './applicationFormSchema'

const validValues: ApplicationFormValues = {
  ...EMPTY_APPLICATION_FORM_VALUES,
  title: '  Global Leaders Scholarship ',
  organization: 'Example Foundation',
  status: 'submitted',
  submittedDate: '2026-01-15',
}

function getIssuePaths(values: ApplicationFormValues) {
  const result = applicationFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('applicationFormSchema', () => {
  it('accepts a minimal valid application', () => {
    expect(getIssuePaths(validValues)).toEqual([])
  })

  it('requires a title and organization', () => {
    expect(getIssuePaths({ ...validValues, title: '   ', organization: '' })).toEqual(['title', 'organization'])
  })

  it('only accepts http(s) links', () => {
    expect(getIssuePaths({ ...validValues, applicationUrl: 'javascript:alert(1)' })).toEqual(['applicationUrl'])
    expect(getIssuePaths({ ...validValues, applicationUrl: 'https://example.org/apply' })).toEqual([])
  })

  it('rejects a submission date on a draft', () => {
    expect(getIssuePaths({ ...validValues, status: 'draft' })).toEqual(['submittedDate'])
  })

  it('rejects a submission date in the future', () => {
    expect(getIssuePaths({ ...validValues, submittedDate: '2999-01-01' })).toEqual(['submittedDate'])
  })
})

describe('toApplicationPayload', () => {
  it('trims text, turns empty strings into null and converts dates', () => {
    const payload = toApplicationPayload({ ...validValues, deadline: '2026-12-01', location: '   ' })

    expect(payload.opportunity.title).toBe('Global Leaders Scholarship')
    expect(payload.opportunity.location).toBeNull()
    expect(payload.opportunity.category_id).toBeNull()
    expect(toDateInputValue(payload.opportunity.deadline)).toBe('2026-12-01')
    expect(new Date(payload.opportunity.deadline!).getHours()).toBe(23)
    expect(toDateInputValue(payload.application.submitted_at)).toBe('2026-01-15')
    expect(payload.application.status).toBe('submitted')
  })
})
