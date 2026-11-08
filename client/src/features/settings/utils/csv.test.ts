import { describe, expect, it } from 'vitest'

import { escapeCsvCell, toCsv } from './csv'
import { buildExportFileName } from './downloadFile'

describe('escapeCsvCell', () => {
  it('writes empty cells for missing values and Yes/No for booleans', () => {
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
    expect(escapeCsvCell(true)).toBe('Yes')
    expect(escapeCsvCell(false)).toBe('No')
  })

  it('quotes cells with commas, quotes or line breaks', () => {
    expect(escapeCsvCell('Accra, Ghana')).toBe('"Accra, Ghana"')
    expect(escapeCsvCell('She said "yes"')).toBe('"She said ""yes"""')
    expect(escapeCsvCell('Line one\nLine two')).toBe('"Line one\nLine two"')
  })

  it('neutralises text a spreadsheet would run as a formula', () => {
    expect(escapeCsvCell('=HYPERLINK("http://evil.test")')).toBe('"\'=HYPERLINK(""http://evil.test"")"')
    expect(escapeCsvCell('+1 555')).toBe("'+1 555")
    expect(escapeCsvCell('-cmd')).toBe("'-cmd")
    expect(escapeCsvCell('@SUM(A1)')).toBe("'@SUM(A1)")
  })

  it('leaves real numbers, including negative ones, untouched', () => {
    expect(escapeCsvCell(-5)).toBe('-5')
    expect(escapeCsvCell(1024)).toBe('1024')
    expect(escapeCsvCell(Number.NaN)).toBe('')
  })
})

describe('toCsv', () => {
  it('writes a header row and one line per row with Windows line endings', () => {
    const csv = toCsv(
      [
        { name: 'CV', size: 10 },
        { name: 'Cover, letter', size: 20 },
      ],
      [
        { header: 'Name', value: (row) => row.name },
        { header: 'Size', value: (row) => row.size },
      ],
    )

    expect(csv).toBe('Name,Size\r\nCV,10\r\n"Cover, letter",20\r\n')
  })

  it('writes only the header for no rows', () => {
    expect(toCsv([], [{ header: 'Name', value: () => '' }])).toBe('Name\r\n')
  })
})

describe('buildExportFileName', () => {
  it('names files by dataset and local date', () => {
    expect(buildExportFileName('applications', 'csv', new Date(2026, 0, 9))).toBe('opportunityhub-applications-2026-01-09.csv')
  })
})
