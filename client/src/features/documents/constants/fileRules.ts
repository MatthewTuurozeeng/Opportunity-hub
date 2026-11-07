/**
 * Upload rules. They mirror the private "documents" storage bucket settings
 * (migration create_documents_storage_bucket), which enforces them server-side too.
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** Allowed file extensions and the MIME type stored for each. */
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export const ALLOWED_MIME_TYPES = new Set(Object.values(ALLOWED_FILE_TYPES))

/** Value for <input type="file" accept="...">. */
export const FILE_INPUT_ACCEPT = Object.keys(ALLOWED_FILE_TYPES)
  .map((extension) => `.${extension}`)
  .join(',')

export const ALLOWED_FILE_TYPES_LABEL = 'PDF, Word, text, PNG or JPEG'

/** How long download and preview links stay valid. */
export const SIGNED_URL_EXPIRY_SECONDS = 60
