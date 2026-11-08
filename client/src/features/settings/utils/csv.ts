export type CsvValue = string | number | boolean | null | undefined

export interface CsvColumn<Row> {
  header: string
  value: (row: Row) => CsvValue
}

/** Characters that make spreadsheet apps treat a cell as a formula. */
const FORMULA_TRIGGER = /^[=+\-@\t\r]/

/**
 * One CSV cell (RFC 4180). Text that a spreadsheet would run as a formula is
 * prefixed with an apostrophe, so opening an export can never execute it.
 */
export function escapeCsvCell(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''

  const safeText = FORMULA_TRIGGER.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safeText) ? `"${safeText.replaceAll('"', '""')}"` : safeText
}

/** Rows to CSV text with a header row and Windows line endings (what spreadsheet apps expect). */
export function toCsv<Row>(rows: readonly Row[], columns: readonly CsvColumn<Row>[]): string {
  const lines = [
    columns.map((column) => escapeCsvCell(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsvCell(column.value(row))).join(',')),
  ]
  return `${lines.join('\r\n')}\r\n`
}
