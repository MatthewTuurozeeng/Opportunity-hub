import { describe, expect, it } from 'vitest'

import type { DocumentRecord } from '../types/document.types'
import { filterDocumentGroups, getNextVersionNumber, groupDocumentVersions } from './documentGroups'

function buildDocument(overrides: Partial<DocumentRecord>): DocumentRecord {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    version_group_id: 'group-1',
    version: 1,
    name: 'General CV',
    category: 'curriculum_vitae',
    description: null,
    file_name: 'cv.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1000,
    storage_path: 'user-1/cv.pdf',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    application_documents: [],
    ...overrides,
  }
}

const cvVersion1 = buildDocument({
  id: 'cv-1',
  version: 1,
  created_at: '2026-09-01T00:00:00Z',
  application_documents: [{ application_id: 'app-1' }],
})
const cvVersion2 = buildDocument({
  id: 'cv-2',
  version: 2,
  created_at: '2026-11-01T00:00:00Z',
  application_documents: [{ application_id: 'app-1' }, { application_id: 'app-2' }],
})
const transcript = buildDocument({
  id: 'transcript',
  version_group_id: 'group-2',
  name: 'University Transcript',
  category: 'academic_transcript',
  file_name: 'transcript.pdf',
  description: 'Official copy',
  created_at: '2026-10-15T00:00:00Z',
})

describe('groupDocumentVersions', () => {
  const groups = groupDocumentVersions([cvVersion1, transcript, cvVersion2])

  it('groups versions and puts the newest version first', () => {
    const cvGroup = groups.find((group) => group.versionGroupId === 'group-1')!
    expect(cvGroup.latest.id).toBe('cv-2')
    expect(cvGroup.versions.map((version) => version.id)).toEqual(['cv-2', 'cv-1'])
  })

  it('counts distinct linked applications across versions', () => {
    expect(groups.find((group) => group.versionGroupId === 'group-1')!.linkedApplicationCount).toBe(2)
    expect(groups.find((group) => group.versionGroupId === 'group-2')!.linkedApplicationCount).toBe(0)
  })

  it('orders groups by their latest upload', () => {
    expect(groups.map((group) => group.versionGroupId)).toEqual(['group-1', 'group-2'])
  })

  it('suggests the next version number', () => {
    expect(getNextVersionNumber(groups[0])).toBe(3)
  })
})

describe('filterDocumentGroups', () => {
  const groups = groupDocumentVersions([cvVersion1, cvVersion2, transcript])
  const filterIds = (searchTerm: string, category: 'all' | DocumentRecord['category'] = 'all') =>
    filterDocumentGroups(groups, { searchTerm, category }).map((group) => group.versionGroupId)

  it('searches name, file name, description and category label', () => {
    expect(filterIds('transcript')).toEqual(['group-2'])
    expect(filterIds('official')).toEqual(['group-2'])
    expect(filterIds('curriculum')).toEqual(['group-1'])
    expect(filterIds('  CV ')).toEqual(['group-1'])
  })

  it('filters by category', () => {
    expect(filterIds('', 'academic_transcript')).toEqual(['group-2'])
    expect(filterIds('', 'cover_letter')).toEqual([])
  })
})
