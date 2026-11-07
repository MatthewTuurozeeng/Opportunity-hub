import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormControl } from '@/components/shared/FormControl'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'

import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS } from '../constants/documentCategories'
import { useUploadDocument } from '../hooks/useDocumentMutations'
import { type DocumentDetailsFormValues, documentDetailsSchema } from '../schemas/documentDetailsSchema'
import type { DocumentGroup } from '../types/document.types'
import { getNextVersionNumber } from '../utils/documentGroups'
import { getFileBaseName, validateFile } from '../utils/fileUtils'
import { FileDropZone } from './FileDropZone'

/**
 * The page mounts this with a fresh `key` each time it opens,
 * so the form always starts from the props below.
 */
interface UploadDocumentDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  /** When set, the upload becomes a new version of this document. */
  versionOf?: DocumentGroup | null
}

const EMPTY_DETAILS: DocumentDetailsFormValues = { name: '', category: 'other', description: '' }

export function UploadDocumentDialog({ isOpen, onOpenChange, versionOf }: UploadDocumentDialogProps) {
  const isNewVersion = Boolean(versionOf)
  const uploadDocument = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<DocumentDetailsFormValues>({
    resolver: zodResolver(documentDetailsSchema),
    defaultValues: versionOf
      ? { name: versionOf.latest.name, category: versionOf.latest.category, description: '' }
      : EMPTY_DETAILS,
  })

  function handleOpenChange(nextIsOpen: boolean) {
    // Keep the dialog open while an upload is in progress.
    if (!uploadDocument.isPending) onOpenChange(nextIsOpen)
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile)
    setFileError(nextFile ? validateFile(nextFile) : null)

    // Suggest a name from the file for new documents, without overwriting one the user typed.
    if (nextFile && !isNewVersion && !getValues('name').trim()) {
      setValue('name', getFileBaseName(nextFile.name), { shouldValidate: true })
    }
  }

  const onSubmit = handleSubmit((values) => {
    if (!file) {
      setFileError('Choose a file to upload.')
      return
    }
    const validationError = validateFile(file)
    if (validationError) {
      setFileError(validationError)
      return
    }

    uploadDocument.mutate(
      {
        file,
        ...values,
        newVersionOf: versionOf
          ? { versionGroupId: versionOf.versionGroupId, version: getNextVersionNumber(versionOf) }
          : undefined,
      },
      {
        onSuccess: (document) => {
          toast.success(isNewVersion ? `Version ${document.version} uploaded.` : 'Document uploaded.')
          onOpenChange(false)
        },
      },
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isNewVersion ? 'Upload a new version' : 'Upload a document'}</DialogTitle>
            <DialogDescription>
              {isNewVersion
                ? `This becomes version ${versionOf ? getNextVersionNumber(versionOf) : ''} of "${versionOf?.latest.name}". Earlier versions, including any you submitted, are kept.`
                : 'Add a document to your library. You can attach it to applications afterwards.'}
            </DialogDescription>
          </DialogHeader>

          <FileDropZone
            file={file}
            onFileChange={handleFileChange}
            errorMessage={fileError}
            disabled={uploadDocument.isPending}
          />

          <FormField
            id="document-name"
            label="Name"
            isRequired
            placeholder="e.g. General CV"
            errorMessage={errors.name?.message}
            {...register('name')}
          />

          <FormControl id="document-category" label="Category" isRequired errorMessage={errors.category?.message}>
            {(controlProps) => (
              <NativeSelect className="w-full" {...controlProps} {...register('category')}>
                {DOCUMENT_CATEGORIES.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {DOCUMENT_CATEGORY_LABELS[category]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormControl>

          <FormControl
            id="document-description"
            label={isNewVersion ? 'What changed? (optional)' : 'Description (optional)'}
            errorMessage={errors.description?.message}
          >
            {(controlProps) => <Textarea rows={3} {...controlProps} {...register('description')} />}
          </FormControl>

          {uploadDocument.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
              {uploadDocument.error.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={uploadDocument.isPending} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={uploadDocument.isPending}>
              {uploadDocument.isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
