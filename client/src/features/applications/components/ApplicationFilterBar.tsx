import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { APPLICATION_STATUS_DETAILS, APPLICATION_STATUSES } from '../constants/applicationStatuses'
import type {
  ApplicationFilters,
  ApplicationSortOption,
  CategorySummary,
  DeadlineFilter,
} from '../types/application.types'
import { DEFAULT_APPLICATION_FILTERS, hasActiveFilters } from '../utils/applicationFilters'

const SORT_OPTION_LABELS: Record<ApplicationSortOption, string> = {
  updated_desc: 'Last updated',
  deadline_asc: 'Deadline (soonest first)',
  submitted_desc: 'Date submitted (newest first)',
  created_desc: 'Date added (newest first)',
}

const DEADLINE_FILTER_LABELS: Record<DeadlineFilter, string> = {
  all: 'All deadlines',
  upcoming: 'Upcoming',
  passed: 'Passed',
  none: 'No deadline',
}

interface ApplicationFilterBarProps {
  filters: ApplicationFilters
  categories: readonly CategorySummary[]
  onFiltersChange: (filters: ApplicationFilters) => void
}

export function ApplicationFilterBar({ filters, categories, onFiltersChange }: ApplicationFilterBarProps) {
  function updateFilter<Key extends keyof ApplicationFilters>(key: Key, value: ApplicationFilters[Key]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <section aria-label="Search and filter applications" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="relative">
        <Label htmlFor="application-search" className="sr-only">
          Search applications
        </Label>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="application-search"
          type="search"
          value={filters.searchTerm}
          onChange={(event) => updateFilter('searchTerm', event.target.value)}
          placeholder="Search by opportunity, organization or keyword"
          className="pl-8"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category" className="text-supporting text-muted-foreground">
            Category
          </Label>
          <NativeSelect
            id="filter-category"
            className="w-full"
            value={filters.categoryId}
            onChange={(event) => updateFilter('categoryId', event.target.value)}
          >
            <NativeSelectOption value="all">All categories</NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-status" className="text-supporting text-muted-foreground">
            Status
          </Label>
          <NativeSelect
            id="filter-status"
            className="w-full"
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value as ApplicationFilters['status'])}
          >
            <NativeSelectOption value="all">All statuses</NativeSelectOption>
            {APPLICATION_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {APPLICATION_STATUS_DETAILS[status].label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-deadline" className="text-supporting text-muted-foreground">
            Deadline
          </Label>
          <NativeSelect
            id="filter-deadline"
            className="w-full"
            value={filters.deadline}
            onChange={(event) => updateFilter('deadline', event.target.value as DeadlineFilter)}
          >
            {Object.entries(DEADLINE_FILTER_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sort-by" className="text-supporting text-muted-foreground">
            Sort by
          </Label>
          <NativeSelect
            id="sort-by"
            className="w-full"
            value={filters.sortBy}
            onChange={(event) => updateFilter('sortBy', event.target.value as ApplicationSortOption)}
          >
            {Object.entries(SORT_OPTION_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {hasActiveFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => onFiltersChange({ ...DEFAULT_APPLICATION_FILTERS, sortBy: filters.sortBy })}
        >
          <X aria-hidden="true" />
          Clear filters
        </Button>
      )}
    </section>
  )
}
