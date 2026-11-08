import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import {
  COMMUNICATION_DIRECTION_DETAILS,
  COMMUNICATION_DIRECTIONS,
  COMMUNICATION_TYPE_LABELS,
  COMMUNICATION_TYPES,
} from '../constants/communicationTypes'
import type { CommunicationFilters } from '../types/communication.types'
import { DEFAULT_COMMUNICATION_FILTERS, hasActiveCommunicationFilters } from '../utils/communicationFilters'

export interface ApplicationOption {
  id: string
  label: string
}

interface CommunicationFilterBarProps {
  filters: CommunicationFilters
  applicationOptions: readonly ApplicationOption[]
  onFiltersChange: (filters: CommunicationFilters) => void
}

export function CommunicationFilterBar({ filters, applicationOptions, onFiltersChange }: CommunicationFilterBarProps) {
  function updateFilter<Key extends keyof CommunicationFilters>(key: Key, value: CommunicationFilters[Key]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <section
      aria-label="Search and filter communications"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
    >
      <div className="relative">
        <Label htmlFor="communication-search" className="sr-only">
          Search communications
        </Label>
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="communication-search"
          type="search"
          value={filters.searchTerm}
          onChange={(event) => updateFilter('searchTerm', event.target.value)}
          placeholder="Search by subject, sender, message or opportunity"
          className="pl-8"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="communication-direction-filter">Direction</Label>
          <NativeSelect
            id="communication-direction-filter"
            className="w-full"
            value={filters.direction}
            onChange={(event) => updateFilter('direction', event.target.value as CommunicationFilters['direction'])}
          >
            <NativeSelectOption value="all">Sent and received</NativeSelectOption>
            {COMMUNICATION_DIRECTIONS.map((direction) => (
              <NativeSelectOption key={direction} value={direction}>
                {COMMUNICATION_DIRECTION_DETAILS[direction].label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="communication-type-filter">Type</Label>
          <NativeSelect
            id="communication-type-filter"
            className="w-full"
            value={filters.communicationType}
            onChange={(event) =>
              updateFilter('communicationType', event.target.value as CommunicationFilters['communicationType'])
            }
          >
            <NativeSelectOption value="all">All types</NativeSelectOption>
            {COMMUNICATION_TYPES.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {COMMUNICATION_TYPE_LABELS[type]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="communication-application-filter">Application</Label>
          <NativeSelect
            id="communication-application-filter"
            className="w-full"
            value={filters.applicationId}
            onChange={(event) => updateFilter('applicationId', event.target.value)}
          >
            <NativeSelectOption value="all">All applications</NativeSelectOption>
            {applicationOptions.map((option) => (
              <NativeSelectOption key={option.id} value={option.id}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {hasActiveCommunicationFilters(filters) && (
          <Button variant="ghost" onClick={() => onFiltersChange(DEFAULT_COMMUNICATION_FILTERS)}>
            <X aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </section>
  )
}
