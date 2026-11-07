import { toast } from 'sonner'

import { createDocumentUrl } from '../services/document.service'
import type { LinkedDocument } from '../types/document.types'

type OpenableDocument = Pick<LinkedDocument, 'storage_path' | 'file_name'>

/** Opens or downloads private documents through short-lived signed links. */
export function useOpenDocument() {
  async function viewDocument(document: OpenableDocument) {
    // Open the tab immediately (inside the click) so pop-up blockers allow it,
    // then point it at the signed link once it is ready.
    const previewTab = window.open('', '_blank')

    try {
      const url = await createDocumentUrl(document, { asDownload: false })
      if (previewTab) {
        previewTab.opener = null
        previewTab.location.href = url
      } else {
        window.location.assign(url)
      }
    } catch (error) {
      previewTab?.close()
      toast.error(error instanceof Error ? error.message : 'Unable to open this document.')
    }
  }

  async function downloadDocument(document: OpenableDocument) {
    try {
      // The signed link is served as an attachment, so the current page stays open.
      const url = await createDocumentUrl(document, { asDownload: true })
      window.location.assign(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download this document.')
    }
  }

  return { viewDocument, downloadDocument }
}
