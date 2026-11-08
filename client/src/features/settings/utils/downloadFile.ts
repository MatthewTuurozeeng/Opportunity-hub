/** Saves text as a file through the browser's download. */
export function downloadFile(fileName: string, content: string, mimeType: string) {
  // A byte-order mark lets Excel read UTF-8 CSV files (names with accents, emoji) correctly.
  const body = mimeType.startsWith('text/csv') ? `\uFEFF${content}` : content
  const url = URL.createObjectURL(new Blob([body], { type: mimeType }))

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()

  // Give the browser a moment to start the download before releasing the file.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** e.g. "opportunityhub-applications-2026-11-10.csv" */
export function buildExportFileName(dataset: string, extension: string, now: Date = new Date()): string {
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `opportunityhub-${dataset}-${date}.${extension}`
}
