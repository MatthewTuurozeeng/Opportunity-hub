import { supabase } from '@/lib/supabase'

import type { DocumentCategory } from '../constants/documentCategories'
import { SIGNED_URL_EXPIRY_SECONDS } from '../constants/fileRules'
import type { DocumentDetailsValues, DocumentGroup, DocumentRecord, LinkedDocument } from '../types/document.types'
import { buildStoragePath, resolveMimeType, validateFile } from '../utils/fileUtils'

const DOCUMENTS_BUCKET = 'documents'

/** PostgreSQL error codes. */
const FOREIGN_KEY_VIOLATION_CODE = '23503'
const UNIQUE_VIOLATION_CODE = '23505'

export async function listDocuments(): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, application_documents(application_id)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load your documents.')
  }

  return data
}

export interface UploadDocumentInput {
  userId: string
  file: File
  name: string
  category: DocumentCategory
  description: string
  /** Set when uploading a new version of an existing document. */
  newVersionOf?: { versionGroupId: string; version: number }
}

/**
 * Uploads the file to the private bucket, then records its metadata.
 * If recording fails, the uploaded file is removed so nothing is left behind.
 */
export async function uploadDocument({
  userId,
  file,
  name,
  category,
  description,
  newVersionOf,
}: UploadDocumentInput): Promise<DocumentRecord> {
  const validationError = validateFile(file)
  const mimeType = resolveMimeType(file)
  if (validationError || !mimeType) {
    throw new Error(validationError ?? 'This file type is not supported.')
  }

  const storagePath = buildStoragePath(userId, file.name, crypto.randomUUID())

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, { contentType: mimeType, upsert: false })

  if (uploadError) {
    throw new Error('The file could not be uploaded. Check your connection and try again.')
  }

  const { data, error: insertError } = await supabase
    .from('documents')
    .insert({
      name: name.trim(),
      category,
      description: description.trim() || null,
      file_name: file.name,
      mime_type: mimeType,
      size_bytes: file.size,
      storage_path: storagePath,
      ...(newVersionOf && { version_group_id: newVersionOf.versionGroupId, version: newVersionOf.version }),
    })
    .select('*, application_documents(application_id)')
    .single()

  if (insertError) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath])
    throw new Error(
      insertError.code === UNIQUE_VIOLATION_CODE
        ? 'A newer version was just added. Refresh the page and try again.'
        : 'The document could not be saved. Please try again.',
    )
  }

  return data
}

/** Updates name, category and description on every version of the document. */
export async function updateDocumentDetails(versionGroupId: string, values: DocumentDetailsValues): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({
      name: values.name.trim(),
      category: values.category,
      description: values.description.trim() || null,
    })
    .eq('version_group_id', versionGroupId)

  if (error) {
    throw new Error('Unable to save the document details.')
  }
}

const LINKED_DOCUMENT_MESSAGE =
  'This document is attached to an application. Remove it from those applications first, so the version you submitted is kept.'

async function removeStoredFiles(storagePaths: string[]) {
  // The metadata is already gone; a leftover file is harmless and only uses storage.
  await supabase.storage.from(DOCUMENTS_BUCKET).remove(storagePaths)
}

/** Deletes every version of a document. Fails if any version is attached to an application. */
export async function deleteDocumentGroup(group: DocumentGroup): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('version_group_id', group.versionGroupId)

  if (error) {
    throw new Error(error.code === FOREIGN_KEY_VIOLATION_CODE ? LINKED_DOCUMENT_MESSAGE : 'Unable to delete the document.')
  }

  await removeStoredFiles(group.versions.map((version) => version.storage_path))
}

/** Deletes a single version. Fails if it is attached to an application. */
export async function deleteDocumentVersion(document: DocumentRecord): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', document.id)

  if (error) {
    throw new Error(error.code === FOREIGN_KEY_VIOLATION_CODE ? LINKED_DOCUMENT_MESSAGE : 'Unable to delete this version.')
  }

  await removeStoredFiles([document.storage_path])
}

interface SignedUrlOptions {
  /** Force a download (with the original file name) instead of opening in the browser. */
  asDownload: boolean
}

/** A short-lived link to a private file. */
export async function createDocumentUrl(
  document: Pick<LinkedDocument, 'storage_path' | 'file_name'>,
  { asDownload }: SignedUrlOptions,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(document.storage_path, SIGNED_URL_EXPIRY_SECONDS, {
      download: asDownload ? document.file_name : false,
    })

  if (error) {
    throw new Error('Unable to open this document. Please try again.')
  }

  return data.signedUrl
}

/** Documents attached to an application, most recently attached first. */
export async function listApplicationDocuments(applicationId: string): Promise<LinkedDocument[]> {
  const { data, error } = await supabase
    .from('application_documents')
    .select('created_at, document:documents!inner(*)')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load the attached documents.')
  }

  return data.map((link) => link.document)
}

export async function attachDocuments(applicationId: string, documentIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('application_documents')
    .upsert(
      documentIds.map((documentId) => ({ application_id: applicationId, document_id: documentId })),
      { onConflict: 'application_id,document_id', ignoreDuplicates: true },
    )

  if (error) {
    throw new Error('Unable to attach the documents.')
  }
}

export async function detachDocument(applicationId: string, documentId: string): Promise<void> {
  const { error } = await supabase
    .from('application_documents')
    .delete()
    .eq('application_id', applicationId)
    .eq('document_id', documentId)

  if (error) {
    throw new Error('Unable to remove the document from this application.')
  }
}
