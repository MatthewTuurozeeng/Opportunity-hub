import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

import { formatDate } from '@/lib/dateUtils'

import type { ApplicationRecord } from '../types/application.types'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { DeadlineLabel } from './DeadlineLabel'

interface DetailItemProps {
  label: string
  children: ReactNode
}

function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-supporting text-muted-foreground">{label}</dt>
      <dd className="text-body">{children ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}

interface DetailCardProps {
  title: string
  children: ReactNode
}

function DetailCard({ title, children }: DetailCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-section-heading font-semibold">{title}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

interface ApplicationOverviewProps {
  application: ApplicationRecord
}

export function ApplicationOverview({ application }: ApplicationOverviewProps) {
  const { opportunity } = application

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DetailCard title="Opportunity">
        <DetailItem label="Organization">{opportunity.organization}</DetailItem>
        <DetailItem label="Category">{opportunity.category?.name}</DetailItem>
        <DetailItem label="Location">{opportunity.location}</DetailItem>
        <DetailItem label="Deadline">
          <DeadlineLabel deadline={opportunity.deadline} status={application.status} />
        </DetailItem>
        <DetailItem label="Source">{opportunity.source}</DetailItem>
        <DetailItem label="Date added">{formatDate(opportunity.created_at)}</DetailItem>
        <div className="sm:col-span-2">
          <DetailItem label="Website or application link">
            {opportunity.application_url && (
              <a
                href={opportunity.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all text-primary underline-offset-4 hover:underline"
              >
                {opportunity.application_url}
                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </DetailItem>
        </div>
        <div className="sm:col-span-2">
          <DetailItem label="Description">
            {opportunity.description && <p className="whitespace-pre-line">{opportunity.description}</p>}
          </DetailItem>
        </div>
      </DetailCard>

      <DetailCard title="Application">
        <DetailItem label="Status">
          <ApplicationStatusBadge status={application.status} />
        </DetailItem>
        <DetailItem label="Date submitted">{application.submitted_at && formatDate(application.submitted_at)}</DetailItem>
        <DetailItem label="Application method">{application.application_method}</DetailItem>
        <DetailItem label="Reference number">{application.reference_number}</DetailItem>
        <DetailItem label="Created">{formatDate(application.created_at)}</DetailItem>
        <DetailItem label="Last updated">{formatDate(application.updated_at)}</DetailItem>
      </DetailCard>
    </div>
  )
}
