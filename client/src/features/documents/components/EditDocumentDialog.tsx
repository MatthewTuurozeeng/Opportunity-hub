import { zodResolver } from '@hookform/resolvers/zod'
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
import { useUpdateDocumentDetails } from '../hooks/useDocumentMutations'
import { type DocumentDetailsFormValues, documentDetailsSchema } from '../schemas/documentDetailsSchema'
import type { DocumentGroup } from '../types/document.types'

/** Mounted with a fresh `key` per opening, so the form starts from the document's values. */
interface EditDocumentDialogProps {
  group: DocumentGroup
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function EditDocumentDialog({ group, isOpen, onOpenChange }: EditDocumentDialogProps) {
  const updateDetails = useUpdateDocumentDetails()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<DocumentDetailsFormValues>({
    resolver: zodResolver(documentDetailsSchema),
    defaultValues: {
      name: group.latest.name,
      category: group.latest.category,
      description: group.latest.description ?? '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    updateDetails.mutate(
      { versionGroupId: group.versionGroupId, values },
      {
        onSuccess: () => {
          toast.success('Document details saved.')
          onOpenChange(false)
        },
      },
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={(nextIsOpen) => !updateDetails.isPending && onOpenChange(nextIsOpen)}>
      <DialogContent className="sm:max-w-lg">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Edit document details</DialogTitle>
            <DialogDescription>
              {group.versions.length > 1
                ? `Changes apply to all ${group.versions.length} versions of this document.`
                : 'Update how this document appears in your library.'}
            </DialogDescription>
          </DialogHeader>

          <FormField id="edit-document-name" label="Name" isRequired errorMessage={errors.name?.message} {...register('name')} />

          <FormControl id="edit-document-category" label="Category" isRequired errorMessage={errors.category?.message}>
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

          <FormControl id="edit-document-description" label="Description" errorMessage={errors.description?.message}>
            {(controlProps) => <Textarea rows={3} {...controlProps} {...register('description')} />}
          </FormControl>

          {updateDetails.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
              {updateDetails.error.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={updateDetails.isPending} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!isDirty || updateDetails.isPending}>
              {updateDetails.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
