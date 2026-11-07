import { describe, expect, it } from 'vitest'

import { MAX_FILE_SIZE_BYTES } from '../constants/fileRules'
import {
  buildStoragePath,
  formatFileSize,
  getFileBaseName,
  resolveMimeType,
  sanitizeFileName,
  validateFile,
} from './fileUtils'

describe('resolveMimeType', () => {
  it('uses the browser type when it is allowed', () => {
    expect(resolveMimeType({ name: 'cv.pdf', type: 'application/pdf' })).toBe('application/pdf')
  })

  it('falls back to the extension when the browser type is missing', () => {
    expect(resolveMimeType({ name: 'Letter.DOCX', type: '' })).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
  })

  it('rejects unsupported types even if the extension looks fine', () => {
    expect(resolveMimeType({ name: 'script.exe', type: 'application/x-msdownload' })).toBeNull()
    expect(resolveMimeType({ name: 'archive.zip', type: '' })).toBeNull()
  })
})

describe('validateFile', () => {
  it('accepts a normal PDF', () => {
    expect(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: 2048 })).toBeNull()
  })

  it('rejects unsupported, empty and oversized files', () => {
    expect(validateFile({ name: 'photo.gif', type: 'image/gif', size: 10 })).toMatch(/not supported/)
    expect(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: 0 })).toMatch(/empty/)
    expect(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: MAX_FILE_SIZE_BYTES + 1 })).toMatch(
      /too large .* must be 10 MB or smaller/,
    )
    expect(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: 15 * 1024 * 1024 })).toMatch(/\(15 MB\)/)
  })
})

describe('sanitizeFileName', () => {
  it('removes accents, spaces and unsafe characters', () => {
    expect(sanitizeFileName('Résumé (final) v2.PDF')).toBe('Resume-final-v2.pdf')
    expect(sanitizeFileName('../../etc/passwd.txt')).toBe('etc-passwd.txt')
  })

  it('falls back to a default name', () => {
    expect(sanitizeFileName('???.pdf')).toBe('document.pdf')
  })
})

describe('buildStoragePath', () => {
  it('places the file in the user folder with a unique prefix', () => {
    expect(buildStoragePath('user-1', 'My CV.pdf', 'abc')).toBe('user-1/abc-My-CV.pdf')
  })
})

describe('getFileBaseName', () => {
  it('strips the extension only', () => {
    expect(getFileBaseName('Cover.Letter.docx')).toBe('Cover.Letter')
    expect(getFileBaseName('README')).toBe('README')
  })
})

describe('formatFileSize', () => {
  it('formats bytes, kilobytes and megabytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatFileSize(12 * 1024 * 1024)).toBe('12 MB')
  })
})
