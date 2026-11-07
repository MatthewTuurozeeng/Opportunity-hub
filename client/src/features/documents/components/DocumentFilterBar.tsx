import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS } from '../constants/documentCategories'
import type { DocumentFilters } from '../types/document.types'

interface DocumentFilterBarProps {
  filters: DocumentFilters
  onFiltersChange: (filters: DocumentFilters) => void
}

export function DocumentFilterBar({ filters, onFiltersChange }: DocumentFilterBarProps) {
  return (
    <section
      aria-label="Search and filter documents"
      className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_16rem]"
    >
      <div className="relative">
        <Label htmlFor="document-search" className="sr-only">
          Search documents
        </Label>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="document-search"
          type="search"
          value={filters.searchTerm}
          onChange={(event) => onFiltersChange({ ...filters, searchTerm: event.target.value })}
          placeholder="Search by name, file name or description"
          className="pl-8"
        />
      </div>
      <div>
        <Label htmlFor="document-category-filter" className="sr-only">
          Category
        </Label>
        <NativeSelect
          id="document-category-filter"
          className="w-full"
          value={filters.category}
          onChange={(event) => onFiltersChange({ ...filters, category: event.target.value as DocumentFilters['category'] })}
        >
          <NativeSelectOption value="all">All categories</NativeSelectOption>
          {DOCUMENT_CATEGORIES.map((category) => (
            <NativeSelectOption key={category} value={category}>
              {DOCUMENT_CATEGORY_LABELS[category]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </section>
  )
}
