import { ALLOWED_FILE_TYPES, ALLOWED_FILE_TYPES_LABEL, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../constants/fileRules'

const BYTES_PER_KILOBYTE = 1024
const MAX_STORED_FILE_NAME_LENGTH = 100

export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > 0 ? fileName.slice(lastDotIndex + 1).toLowerCase() : ''
}

/** File name without its extension, e.g. "My CV.pdf" -> "My CV". */
export function getFileBaseName(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName
}

/**
 * The MIME type to store. Browsers sometimes report an empty or generic type,
 * so fall back to the extension, and only ever return an allowed type.
 */
export function resolveMimeType(file: Pick<File, 'name' | 'type'>): string | null {
  if (ALLOWED_MIME_TYPES.has(file.type)) return file.type
  return ALLOWED_FILE_TYPES[getFileExtension(file.name)] ?? null
}

/** Returns a user-facing error, or null when the file can be uploaded. */
export function validateFile(file: Pick<File, 'name' | 'type' | 'size'>): string | null {
  if (!resolveMimeType(file)) {
    return `This file type is not supported. Upload a ${ALLOWED_FILE_TYPES_LABEL} file.`
  }
  if (file.size === 0) {
    return 'This file is empty.'
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `This file is too large (${formatFileSize(file.size)}). Files must be ${formatFileSize(MAX_FILE_SIZE_BYTES)} or smaller.`
  }
  return null
}

/** Safe storage name: ASCII letters, digits, dot, dash and underscore only. */
export function sanitizeFileName(fileName: string): string {
  const extension = getFileExtension(fileName)
  const safeBaseName = getFileBaseName(fileName)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, MAX_STORED_FILE_NAME_LENGTH)

  const baseName = safeBaseName || 'document'
  return extension ? `${baseName}.${extension}` : baseName
}

/**
 * Storage path inside the user's own folder: <userId>/<uniqueId>-<safe-name>.
 * The folder is required by the storage policies; the unique id prevents clashes.
 */
export function buildStoragePath(userId: string, fileName: string, uniqueId: string): string {
  return `${userId}/${uniqueId}-${sanitizeFileName(fileName)}`
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < BYTES_PER_KILOBYTE) return `${sizeInBytes} B`

  const sizeInKilobytes = sizeInBytes / BYTES_PER_KILOBYTE
  if (sizeInKilobytes < BYTES_PER_KILOBYTE) return `${Math.round(sizeInKilobytes)} KB`

  const sizeInMegabytes = sizeInKilobytes / BYTES_PER_KILOBYTE
  return `${sizeInMegabytes.toFixed(sizeInMegabytes < 10 ? 1 : 0)} MB`
}
