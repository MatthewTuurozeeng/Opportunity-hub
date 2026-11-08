import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  type TooltipValueType,
  XAxis,
  YAxis,
} from 'recharts'

import { OUTCOME_DETAILS, OUTCOMES } from '../constants/outcomes'
import type { MonthlyOutcomes } from '../utils/applicationMetrics'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 }

function MonthTooltip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  const month = payload?.[0]?.payload as MonthlyOutcomes | undefined
  if (!active || !month) return null

  return (
    <div className="flex min-w-44 flex-col gap-1.5 rounded-md border border-border bg-popover p-3 text-supporting shadow-md">
      <p className="font-medium text-heading">{month.fullLabel}</p>
      {OUTCOMES.map((outcome) => (
        <p key={outcome} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-sm" style={{ backgroundColor: OUTCOME_DETAILS[outcome].color }} />
            {OUTCOME_DETAILS[outcome].label}
          </span>
          <span className="font-medium tabular-nums">{month[outcome]}</span>
        </p>
      ))}
      <p className="mt-0.5 flex justify-between gap-4 border-t border-border pt-1.5 font-medium">
        <span>Total submitted</span>
        <span className="tabular-nums">{month.total}</span>
      </p>
    </div>
  )
}

interface MonthlyOutcomesChartProps {
  months: readonly MonthlyOutcomes[]
}

/** Applications submitted per month, stacked by their current outcome, with a table view. */
export function MonthlyOutcomesChart({ months }: MonthlyOutcomesChartProps) {
  return (
    <div className="flex flex-col gap-3">
      <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-supporting">
        {OUTCOMES.map((outcome) => (
          <li key={outcome} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: OUTCOME_DETAILS[outcome].color }} />
            {OUTCOME_DETAILS[outcome].label}
          </li>
        ))}
      </ul>

      {/* The table below carries the same data for screen readers. */}
      <div aria-hidden="true" className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...months]} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={AXIS_TICK} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} />
            <Tooltip content={MonthTooltip} cursor={{ fill: 'var(--muted)' }} />
            {OUTCOMES.map((outcome) => (
              <Bar
                key={outcome}
                dataKey={outcome}
                name={OUTCOME_DETAILS[outcome].label}
                stackId="outcomes"
                fill={OUTCOME_DETAILS[outcome].color}
                stroke="var(--card)"
                strokeWidth={1}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="text-supporting">
        <summary className="w-fit cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
          Show data as a table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-supporting">
            <caption className="sr-only">Applications submitted per month by outcome</caption>
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="col" className="py-1.5 pr-3 font-medium">Month</th>
                {OUTCOMES.map((outcome) => (
                  <th key={outcome} scope="col" className="px-3 py-1.5 text-right font-medium">
                    {OUTCOME_DETAILS[outcome].label}
                  </th>
                ))}
                <th scope="col" className="py-1.5 pl-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {months.map((month) => (
                <tr key={month.key} className="border-b border-border last:border-0">
                  <th scope="row" className="py-1.5 pr-3 font-normal">{month.fullLabel}</th>
                  {OUTCOMES.map((outcome) => (
                    <td key={outcome} className="px-3 py-1.5 text-right">{month[outcome]}</td>
                  ))}
                  <td className="py-1.5 pl-3 text-right font-medium">{month.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
