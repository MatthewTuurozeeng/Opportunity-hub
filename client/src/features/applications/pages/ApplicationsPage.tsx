import { Briefcase, SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useCategories } from '@/features/categories/hooks/useCategories'

import { ApplicationFilterBar } from '../components/ApplicationFilterBar'
import { ApplicationList } from '../components/ApplicationList'
import { ApplicationListSkeleton } from '../components/ApplicationListSkeleton'
import { useApplications } from '../hooks/useApplicationQueries'
import type { ApplicationFilters } from '../types/application.types'
import { filterAndSortApplications, parseApplicationFilters, toFilterSearchParams } from '../utils/applicationFilters'

export function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseApplicationFilters(searchParams), [searchParams])
  const { data: applications, isLoading, error, refetch } = useApplications()
  const { data: categories = [] } = useCategories()

  const visibleApplications = useMemo(
    () => (applications ? filterAndSortApplications(applications, filters) : []),
    [applications, filters],
  )

  function handleFiltersChange(nextFilters: ApplicationFilters) {
    // Replace rather than push, so typing in search does not flood the history.
    setSearchParams(toFilterSearchParams(nextFilters), { replace: true })
  }

  function renderContent() {
    if (isLoading) return <ApplicationListSkeleton />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!applications?.length) {
      return (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Record an opportunity now and apply when you are ready. Drafts are not counted as submitted."
          action={<AddApplicationButton />}
        />
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <ApplicationFilterBar filters={filters} categories={categories} onFiltersChange={handleFiltersChange} />
        <p className="text-supporting text-muted-foreground" aria-live="polite">
          Showing {visibleApplications.length} of {applications.length}{' '}
          {applications.length === 1 ? 'application' : 'applications'}
        </p>
        {visibleApplications.length ? (
          <ApplicationList applications={visibleApplications} />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No matching applications"
            description="Try a different search term or clear the filters."
          />
        )}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Applications"
        description="Manage all your opportunities and applications."
        actions={applications?.length ? <AddApplicationButton /> : undefined}
      />
      {renderContent()}
    </>
  )
}
