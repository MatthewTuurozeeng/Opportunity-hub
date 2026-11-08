import { BarChart3, CircleCheck, Hourglass, Send, Users } from 'lucide-react'
import { useMemo } from 'react'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { BarList } from '@/components/shared/BarList'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Panel } from '@/components/shared/Panel'
import { StatTile } from '@/components/shared/StatTile'
import { useApplications, useInterviewApplicationIds } from '@/features/applications/hooks/useApplicationQueries'

import { MonthlyOutcomesChart } from '../components/MonthlyOutcomesChart'
import { OutcomeSplit } from '../components/OutcomeSplit'
import { SINGLE_SERIES_COLOR } from '../constants/outcomes'
import {
  buildMonthlyOutcomes,
  computeApplicationMetrics,
  countSubmittedByCategory,
  countSubmittedByYear,
  formatPercent,
} from '../utils/applicationMetrics'

function formatApplicationCount(count: number): string {
  return `${count} ${count === 1 ? 'application' : 'applications'}`
}

export function AnalyticsPage() {
  const applications = useApplications()
  const interviewIds = useInterviewApplicationIds()

  const analytics = useMemo(() => {
    if (!applications.data) return null
    return {
      metrics: computeApplicationMetrics(applications.data, interviewIds.data),
      byCategory: countSubmittedByCategory(applications.data),
      byYear: countSubmittedByYear(applications.data),
      months: buildMonthlyOutcomes(applications.data),
    }
  }, [applications.data, interviewIds.data])

  function renderContent() {
    if (applications.isLoading || interviewIds.isLoading) return <LoadingState label="Loading analytics…" />

    const error = applications.error ?? interviewIds.error
    if (error) {
      return (
        <ErrorState
          message={error.message}
          onRetry={() => {
            if (applications.error) applications.refetch()
            if (interviewIds.error) interviewIds.refetch()
          }}
        />
      )
    }

    if (!analytics || analytics.metrics.submitted === 0) {
      return (
        <EmptyState
          icon={BarChart3}
          title="Not enough data yet"
          description="Insights appear once you have submitted applications. Drafts are not counted."
          action={<AddApplicationButton />}
        />
      )
    }

    const { metrics, byCategory, byYear, months } = analytics

    return (
      <div className="flex flex-col gap-4">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Submitted applications"
            value={metrics.submitted}
            detail={metrics.drafts ? `${metrics.drafts} more in draft` : 'Drafts are not counted'}
            icon={Send}
            iconClassName="bg-blue-50 text-blue-700"
          />
          <StatTile
            label="Pending"
            value={metrics.outcomes.pending}
            detail="Awaiting a decision"
            icon={Hourglass}
            iconClassName="bg-amber-50 text-amber-700"
          />
          <StatTile
            label="Success rate"
            value={formatPercent(metrics.successRate)}
            detail={
              metrics.decided
                ? `${metrics.outcomes.successful} of ${metrics.decided} decided applications`
                : 'No decisions yet'
            }
            icon={CircleCheck}
            iconClassName="bg-green-50 text-success-green"
          />
          <StatTile
            label="Interview rate"
            value={formatPercent(metrics.interviewRate)}
            detail={`${metrics.interviewsReached} of ${metrics.submitted} reached the interview stage`}
            icon={Users}
            iconClassName="bg-violet-50 text-violet-700"
          />
        </dl>

        <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
          <Panel
            title="Submissions over the last 12 months"
            description="By month submitted, coloured by each application's current outcome."
          >
            <MonthlyOutcomesChart months={months} />
          </Panel>
          <Panel title="Outcomes" description={`All ${formatApplicationCount(metrics.submitted)} submitted.`}>
            <OutcomeSplit outcomes={metrics.outcomes} />
          </Panel>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Panel title="By category" description="Submitted applications per opportunity category.">
            <BarList
              label="Submitted applications by category"
              color={SINGLE_SERIES_COLOR}
              formatValue={String}
              items={byCategory.map((item) => ({ key: item.label, label: item.label, textLabel: item.label, value: item.count }))}
            />
          </Panel>
          <Panel title="By year" description="Submitted applications per year of submission.">
            <BarList
              label="Submitted applications by year"
              color={SINGLE_SERIES_COLOR}
              formatValue={String}
              items={byYear.map((item) => ({ key: item.label, label: item.label, textLabel: item.label, value: item.count }))}
            />
          </Panel>
        </div>

        <p className="text-supporting text-muted-foreground">
          Success rate = successful ÷ decided (successful + unsuccessful) applications. Interview rate = applications
          that reached the Interview status ÷ submitted applications. Pending, withdrawn and no-response applications
          are never counted as unsuccessful.
        </p>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Analytics" description="Review your application activity and outcomes." />
      {renderContent()}
    </>
  )
}
