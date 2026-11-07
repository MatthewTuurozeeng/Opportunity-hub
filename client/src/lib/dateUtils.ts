const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

/** ISO timestamp -> "YYYY-MM-DD" in local time, for <input type="date">. */
export function toDateInputValue(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return ''

  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`
}

interface FromDateInputOptions {
  /** Use 23:59:59 local time, e.g. for deadlines that last the whole day. */
  endOfDay?: boolean
}

/** "YYYY-MM-DD" from <input type="date"> -> ISO timestamp (local time), or null when empty. */
export function fromDateInputValue(dateValue: string, { endOfDay = false }: FromDateInputOptions = {}): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim())
  if (!match) return null

  const [, year, month, day] = match.map(Number)
  const date = endOfDay ? new Date(year, month - 1, day, 23, 59, 59) : new Date(year, month - 1, day)

  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function formatDate(isoTimestamp: string | null | undefined): string {
  return isoTimestamp ? dateFormatter.format(new Date(isoTimestamp)) : '—'
}

export function formatDateTime(isoTimestamp: string | null | undefined): string {
  return isoTimestamp ? dateTimeFormatter.format(new Date(isoTimestamp)) : '—'
}

/** Whole calendar days from today until the date (negative when in the past). */
export function getDaysUntil(isoTimestamp: string, now: Date = new Date()): number {
  const target = new Date(isoTimestamp)
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / MILLISECONDS_PER_DAY)
}

/** Today's date as "YYYY-MM-DD", used as the max for past-only date inputs. */
export function getTodayDateInputValue(now: Date = new Date()): string {
  return toDateInputValue(now.toISOString())
}
