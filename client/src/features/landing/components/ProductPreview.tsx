import { CalendarClock, CircleCheck, Hourglass, Send, Users } from 'lucide-react'

import { cn } from '@/lib/utils'

const PREVIEW_STATS = [
  { label: 'Submitted', value: '24', icon: Send, chip: 'bg-blue-50 text-blue-700' },
  { label: 'In progress', value: '9', icon: Hourglass, chip: 'bg-amber-50 text-amber-700' },
  { label: 'Successful', value: '6', icon: CircleCheck, chip: 'bg-green-50 text-success-green' },
]

const PREVIEW_UPCOMING = [
  { title: 'Panel interview', meta: 'Global Leaders Fellowship · Tomorrow, 10:00', icon: Users, chip: 'bg-violet-50 text-violet-700' },
  { title: 'Application deadline', meta: 'Graduate Research Scholarship · In 4 days', icon: CalendarClock, chip: 'bg-amber-50 text-amber-700' },
]

const PREVIEW_APPLICATIONS = [
  { title: 'Data Science Internship', status: 'Interview', badge: 'bg-violet-50 text-violet-800 border-violet-200' },
  { title: 'Community Impact Grant', status: 'Under Review', badge: 'bg-sky-50 text-sky-800 border-sky-200' },
  { title: 'Summer Research Programme', status: 'Successful', badge: 'bg-success-green text-pure-white border-success-green' },
]

/** A decorative, static sketch of the dashboard. Example data only. */
export function ProductPreview({ className }: { className?: string }) {
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div
        aria-hidden="true"
        className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 shadow-sm sm:p-4"
      >
        <div className="flex items-center gap-1.5 pb-1">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="ml-2 text-supporting font-medium text-muted-foreground">Dashboard</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PREVIEW_STATS.map(({ label, value, icon: Icon, chip }) => (
            <div key={label} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-2.5 sm:p-3">
              <span className={cn('flex size-6 items-center justify-center rounded-md', chip)}>
                <Icon className="size-3.5" />
              </span>
              <span className="text-lg leading-6 font-semibold text-heading tabular-nums">{value}</span>
              <span className="truncate text-[11px] leading-4 text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-supporting font-semibold text-heading">Coming up</p>
          <ul className="flex flex-col gap-2.5">
            {PREVIEW_UPCOMING.map(({ title, meta, icon: Icon, chip }) => (
              <li key={title} className="flex items-center gap-2.5">
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', chip)}>
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-supporting font-medium text-heading">{title}</span>
                  <span className="block truncate text-[11px] leading-4 text-muted-foreground">{meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-supporting font-semibold text-heading">Recently updated</p>
          <ul className="flex flex-col divide-y divide-border">
            {PREVIEW_APPLICATIONS.map(({ title, status, badge }) => (
              <li key={title} className="flex items-center justify-between gap-2 py-1.5">
                <span className="truncate text-supporting">{title}</span>
                <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[11px] leading-4 font-medium', badge)}>
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="text-center text-supporting text-muted-foreground">
        The dashboard: totals, what&apos;s coming up and recent progress, all in one place. Example data shown.
      </figcaption>
    </figure>
  )
}
