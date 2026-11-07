import { DOCUMENT_CATEGORY_LABELS } from '../constants/documentCategories'
import type { DocumentFilters, DocumentGroup, DocumentRecord } from '../types/document.types'

/** Groups versions by version_group_id. Groups are ordered by their latest upload, newest first. */
export function groupDocumentVersions(documents: readonly DocumentRecord[]): DocumentGroup[] {
  const versionsByGroup = new Map<string, DocumentRecord[]>()

  for (const document of documents) {
    const versions = versionsByGroup.get(document.version_group_id) ?? []
    versions.push(document)
    versionsByGroup.set(document.version_group_id, versions)
  }

  return [...versionsByGroup.entries()]
    .map(([versionGroupId, versions]) => {
      const sortedVersions = [...versions].sort((first, second) => second.version - first.version)
      const linkedApplicationIds = new Set(
        sortedVersions.flatMap((version) => version.application_documents.map((link) => link.application_id)),
      )

      return {
        versionGroupId,
        latest: sortedVersions[0],
        versions: sortedVersions,
        linkedApplicationCount: linkedApplicationIds.size,
      }
    })
    .sort((first, second) => second.latest.created_at.localeCompare(first.latest.created_at))
}

export function filterDocumentGroups(groups: readonly DocumentGroup[], filters: DocumentFilters): DocumentGroup[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase()

  return groups.filter(({ latest }) => {
    if (filters.category !== 'all' && latest.category !== filters.category) return false
    if (!searchTerm) return true

    const searchableValues = [latest.name, latest.file_name, latest.description, DOCUMENT_CATEGORY_LABELS[latest.category]]
    return searchableValues.some((value) => value?.toLowerCase().includes(searchTerm))
  })
}

/** The next version number for a group. */
export function getNextVersionNumber(group: DocumentGroup): number {
  return group.latest.version + 1
}
