import { describe, expect, it } from 'vitest'

import type { CommunicationRecord } from '../types/communication.types'
import {
  buildEmptyCommunicationFormValues,
  communicationFormSchema,
  type CommunicationFormValues,
  toCommunicationFormValues,
  toCommunicationPayload,
} from './communicationFormSchema'

function buildValues(overrides: Partial<CommunicationFormValues> = {}): CommunicationFormValues {
  return {
    ...buildEmptyCommunicationFormValues('application-1'),
    subject: 'Interview invitation',
    date: '2026-10-05',
    time: '09:30',
    ...overrides,
  }
}

function getErrorPaths(values: CommunicationFormValues): string[] {
  const result = communicationFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('communicationFormSchema', () => {
  it('accepts a minimal communication', () => {
    expect(getErrorPaths(buildValues())).toEqual([])
  })

  it('requires an application, subject, date and time', () => {
    expect(getErrorPaths(buildValues({ applicationId: '' }))).toContain('applicationId')
    expect(getErrorPaths(buildValues({ subject: '   ' }))).toContain('subject')
    expect(getErrorPaths(buildValues({ date: '' }))).toContain('date')
    expect(getErrorPaths(buildValues({ time: '' }))).toContain('time')
  })

  it('rejects links that are not web addresses', () => {
    expect(getErrorPaths(buildValues({ externalLink: 'mail.google.com' }))).toEqual(['externalLink'])
    expect(getErrorPaths(buildValues({ externalLink: 'https://mail.google.com/x' }))).toEqual([])
  })

  it('rejects dates in the future', () => {
    expect(getErrorPaths(buildValues({ date: '2999-01-01' }))).toEqual(['date'])
  })
})

describe('buildEmptyCommunicationFormValues', () => {
  it('starts at the given moment and application', () => {
    const values = buildEmptyCommunicationFormValues('application-9', new Date(2026, 10, 8, 14, 7))

    expect(values).toMatchObject({ applicationId: 'application-9', date: '2026-11-08', time: '14:07' })
  })
})

describe('toCommunicationPayload', () => {
  it('trims text and stores blanks as null', () => {
    const payload = toCommunicationPayload(buildValues({ subject: '  Offer  ', sender: '  ', summary: ' Good news ' }))

    expect(payload).toMatchObject({
      application_id: 'application-1',
      subject: 'Offer',
      sender: null,
      summary: 'Good news',
      external_link: null,
      attachment_document_id: null,
    })
  })

  it('combines the date and time in local time', () => {
    const communicatedAt = new Date(toCommunicationPayload(buildValues()).communicated_at)

    expect([communicatedAt.getMonth(), communicatedAt.getDate()]).toEqual([9, 5])
    expect([communicatedAt.getHours(), communicatedAt.getMinutes()]).toEqual([9, 30])
  })
})

describe('toCommunicationFormValues', () => {
  it('round-trips through the payload', () => {
    const values = buildValues({
      direction: 'sent',
      communicationType: 'follow_up',
      recipient: 'hr@example.com',
      content: 'Thank you for your time.',
      externalLink: 'https://mail.example.com/1',
      attachmentDocumentId: 'document-1',
    })
    const record = { ...toCommunicationPayload(values), id: 'communication-1' } as CommunicationRecord

    expect(toCommunicationFormValues(record)).toEqual(values)
  })
})
