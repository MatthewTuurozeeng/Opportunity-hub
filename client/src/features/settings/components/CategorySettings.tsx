import { Check, Pencil, Plus, Tags, Trash2, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCategoriesWithUsage } from '@/features/categories/hooks/useCategories'
import { useCreateCategory, useDeleteCategory, useRenameCategory } from '@/features/categories/hooks/useCategoryMutations'
import type { CategoryWithUsage } from '@/features/categories/services/category.service'
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS } from '@/features/documents/constants/documentCategories'
import { useDocuments } from '@/features/documents/hooks/useDocumentQueries'
import { groupDocumentVersions } from '@/features/documents/utils/documentGroups'

import { categoryNameSchema } from '../schemas/settingsSchemas'
import { SettingsSection } from './SettingsSection'

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Returns an error message, or null when the name can be saved. */
function validateCategoryName(name: string, categories: readonly CategoryWithUsage[], ignoreId?: string): string | null {
  const result = categoryNameSchema.safeParse(name)
  if (!result.success) return result.error.issues[0].message

  const isDuplicate = categories.some(
    (category) => category.id !== ignoreId && category.name.toLowerCase() === result.data.toLowerCase(),
  )
  return isDuplicate ? 'A category with this name already exists.' : null
}

function AddCategoryForm({ categories }: { categories: readonly CategoryWithUsage[] }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createCategory = useCreateCategory()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateCategoryName(name, categories)
    setError(validationError)
    if (validationError) return

    createCategory.mutate(name, {
      onSuccess: () => {
        toast.success(`Category "${name.trim()}" added.`)
        setName('')
      },
      onError: (createError) => setError(createError.message),
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Label htmlFor="new-category-name">New category</Label>
      <div className="flex max-w-md gap-2">
        <Input
          id="new-category-name"
          value={name}
          maxLength={60}
          placeholder="e.g. Research positions"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'new-category-error' : undefined}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
        />
        <Button type="submit" disabled={createCategory.isPending}>
          <Plus aria-hidden="true" />
          {createCategory.isPending ? 'Adding…' : 'Add'}
        </Button>
      </div>
      {error && (
        <p id="new-category-error" className="text-supporting text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}

interface CategoryRowProps {
  category: CategoryWithUsage
  categories: readonly CategoryWithUsage[]
  onDelete: (category: CategoryWithUsage) => void
}

function CategoryRow({ category, categories, onDelete }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [error, setError] = useState<string | null>(null)
  const renameCategory = useRenameCategory()
  const inputId = `category-name-${category.id}`

  function cancelEditing() {
    setIsEditing(false)
    setName(category.name)
    setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim() === category.name) return cancelEditing()

    const validationError = validateCategoryName(name, categories, category.id)
    setError(validationError)
    if (validationError) return

    renameCategory.mutate(
      { categoryId: category.id, name },
      {
        onSuccess: () => {
          toast.success('Category renamed.')
          setIsEditing(false)
        },
        onError: (renameError) => setError(renameError.message),
      },
    )
  }

  if (isEditing) {
    return (
      <li className="p-3">
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <Label htmlFor={inputId} className="sr-only">
            Category name
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id={inputId}
              value={name}
              maxLength={60}
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-error` : undefined}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => event.key === 'Escape' && cancelEditing()}
            />
            <Button type="submit" size="icon-sm" disabled={renameCategory.isPending} aria-label="Save name">
              <Check aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={cancelEditing} aria-label="Cancel renaming">
              <X aria-hidden="true" />
            </Button>
          </div>
          {error && (
            <p id={`${inputId}-error`} className="text-supporting text-destructive">
              {error}
            </p>
          )}
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{category.name}</p>
        <p className="text-supporting text-muted-foreground">{pluralize(category.opportunityCount, 'opportunity', 'opportunities')}</p>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} aria-label={`Rename ${category.name}`}>
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(category)}
        aria-label={`Delete ${category.name}`}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  )
}

function ApplicationCategories() {
  const { data: categories, isLoading, error, refetch } = useCategoriesWithUsage()
  const deleteCategory = useDeleteCategory()
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithUsage | null>(null)

  function handleConfirmDelete() {
    if (!categoryToDelete) return
    deleteCategory.mutate(categoryToDelete.id, {
      onSuccess: () => {
        toast.success(`Category "${categoryToDelete.name}" deleted.`)
        setCategoryToDelete(null)
      },
      onError: (deleteError) => {
        toast.error(deleteError.message)
        setCategoryToDelete(null)
      },
    })
  }

  function renderList() {
    if (isLoading) return <LoadingState label="Loading categories…" className="py-6" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
    if (!categories?.length) {
      return <p className="text-body text-muted-foreground">No categories yet. Add one below.</p>
    }

    return (
      <ul className="divide-y divide-border rounded-lg border border-border">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} categories={categories} onDelete={setCategoryToDelete} />
        ))}
      </ul>
    )
  }

  const usageCount = categoryToDelete?.opportunityCount ?? 0

  return (
    <SettingsSection
      title="Application categories"
      description="Group opportunities by type. Renaming a category updates every opportunity that uses it."
    >
      {renderList()}
      {categories && <AddCategoryForm categories={categories} />}

      <ConfirmDialog
        isOpen={categoryToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}
        title={`Delete "${categoryToDelete?.name ?? ''}"?`}
        description={
          usageCount > 0
            ? `${pluralize(usageCount, 'opportunity', 'opportunities')} will be kept but become uncategorized.`
            : 'No opportunities use this category.'
        }
        confirmLabel="Delete category"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteCategory.isPending}
        onConfirm={handleConfirmDelete}
      />
    </SettingsSection>
  )
}

function DocumentCategories() {
  const { data: documents, isLoading } = useDocuments()

  const countsByCategory = useMemo(() => {
    const counts = new Map<string, number>()
    for (const group of groupDocumentVersions(documents ?? [])) {
      counts.set(group.latest.category, (counts.get(group.latest.category) ?? 0) + 1)
    }
    return counts
  }, [documents])

  return (
    <SettingsSection
      title="Document categories"
      description="The standard set of document types from the Document Library. They are fixed so documents stay consistently organized."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {DOCUMENT_CATEGORIES.map((category) => (
          <li key={category} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <span className="flex items-center gap-2 text-body">
              <Tags className="size-4 text-muted-foreground" aria-hidden="true" />
              {DOCUMENT_CATEGORY_LABELS[category]}
            </span>
            {!isLoading && (
              <Badge variant="secondary" className="tabular-nums">
                {pluralize(countsByCategory.get(category) ?? 0, 'document')}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </SettingsSection>
  )
}

export function CategorySettings() {
  return (
    <div className="flex flex-col gap-4">
      <ApplicationCategories />
      <DocumentCategories />
    </div>
  )
}
