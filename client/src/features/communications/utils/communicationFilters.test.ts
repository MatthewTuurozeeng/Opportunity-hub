import { describe, expect, it } from 'vitest'

import type { CommunicationRecord } from '../types/communication.types'
import { DEFAULT_COMMUNICATION_FILTERS, filterCommunications, hasActiveCommunicationFilters } from './communicationFilters'

function buildCommunication(id: string, overrides: Partial<CommunicationRecord> = {}): CommunicationRecord {
  return {
    id,
    user_id: 'user-1',
    application_id: 'application-1',
    communication_type: 'other',
    direction: 'received',
    subject: 'Subject',
    sender: null,
    recipient: null,
    communicated_at: '2026-10-01T09:00:00Z',
    summary: null,
    content: null,
    external_link: null,
    attachment_document_id: null,
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z',
    application: { id: 'application-1', opportunity: { title: 'Data Fellowship', organization: 'Acme Foundation' } },
    attachment: null,
    ...overrides,
  }
}

const communications = [
  buildCommunication('invitation', { communication_type: 'interview_invitation', subject: 'Interview on Monday' }),
  buildCommunication('follow-up', { direction: 'sent', communication_type: 'follow_up', recipient: 'jane@acme.org' }),
  buildCommunication('other-application', {
    application_id: 'application-2',
    content: 'Your scholarship was approved',
    application: { id: 'application-2', opportunity: { title: 'Graduate Scholarship', organization: 'State Board' } },
  }),
]

function filteredIds(filters: Partial<typeof DEFAULT_COMMUNICATION_FILTERS>): string[] {
  return filterCommunications(communications, { ...DEFAULT_COMMUNICATION_FILTERS, ...filters }).map(({ id }) => id)
}

describe('filterCommunications', () => {
  it('returns everything with the default filters', () => {
    expect(filteredIds({})).toEqual(['invitation', 'follow-up', 'other-application'])
  })

  it('filters by direction, type and application', () => {
    expect(filteredIds({ direction: 'sent' })).toEqual(['follow-up'])
    expect(filteredIds({ communicationType: 'interview_invitation' })).toEqual(['invitation'])
    expect(filteredIds({ applicationId: 'application-2' })).toEqual(['other-application'])
  })

  it('searches subject, people, message text and the opportunity, ignoring case', () => {
    expect(filteredIds({ searchTerm: 'MONDAY' })).toEqual(['invitation'])
    expect(filteredIds({ searchTerm: 'jane@acme' })).toEqual(['follow-up'])
    expect(filteredIds({ searchTerm: 'approved' })).toEqual(['other-application'])
    expect(filteredIds({ searchTerm: 'state board' })).toEqual(['other-application'])
  })

  it('requires every search word to match', () => {
    expect(filteredIds({ searchTerm: 'interview scholarship' })).toEqual([])
  })
})

describe('hasActiveCommunicationFilters', () => {
  it('ignores a whitespace-only search', () => {
    expect(hasActiveCommunicationFilters({ ...DEFAULT_COMMUNICATION_FILTERS, searchTerm: '  ' })).toBe(false)
    expect(hasActiveCommunicationFilters({ ...DEFAULT_COMMUNICATION_FILTERS, direction: 'received' })).toBe(true)
  })
})
