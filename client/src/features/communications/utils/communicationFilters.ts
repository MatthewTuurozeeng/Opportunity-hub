import type { CommunicationFilters, CommunicationRecord } from '../types/communication.types'

export const DEFAULT_COMMUNICATION_FILTERS: CommunicationFilters = {
  searchTerm: '',
  direction: 'all',
  communicationType: 'all',
  applicationId: 'all',
}

export function hasActiveCommunicationFilters(filters: CommunicationFilters): boolean {
  return (
    filters.searchTerm.trim() !== '' ||
    filters.direction !== 'all' ||
    filters.communicationType !== 'all' ||
    filters.applicationId !== 'all'
  )
}

function getSearchableText(communication: CommunicationRecord): string {
  const { opportunity } = communication.application

  return [
    communication.subject,
    communication.summary,
    communication.content,
    communication.sender,
    communication.recipient,
    opportunity.title,
    opportunity.organization,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Keeps communications matching every filter. Every search word must appear somewhere. */
export function filterCommunications(
  communications: readonly CommunicationRecord[],
  filters: CommunicationFilters,
): CommunicationRecord[] {
  const searchWords = filters.searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return communications.filter((communication) => {
    if (filters.direction !== 'all' && communication.direction !== filters.direction) return false
    if (filters.communicationType !== 'all' && communication.communication_type !== filters.communicationType) return false
    if (filters.applicationId !== 'all' && communication.application_id !== filters.applicationId) return false
    if (!searchWords.length) return true

    const searchableText = getSearchableText(communication)
    return searchWords.every((word) => searchableText.includes(word))
  })
}
